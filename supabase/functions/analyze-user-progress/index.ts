import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: authData, error: authError } = await supabase.auth.getClaims(token);
    if (authError || !authData?.claims) return json({ error: "Unauthorized" }, 401);

    const userId = authData.claims.sub as string;

    // Rate-limit: only 1 analysis per 6 hours
    const { data: profile } = await supabase
      .from("profiles")
      .select("last_analysis_at, level, xp")
      .eq("id", userId)
      .maybeSingle();

    if (profile?.last_analysis_at) {
      const last = new Date(profile.last_analysis_at).getTime();
      const sixHours = 6 * 60 * 60 * 1000;
      if (Date.now() - last < sixHours) {
        const remainingMin = Math.ceil((sixHours - (Date.now() - last)) / 60000);
        return json({
          error: `يمكنك إعادة التحليل بعد ${remainingMin} دقيقة`,
          rateLimited: true,
        }, 429);
      }
    }

    // Gather user's notes (sample up to 30 most recent)
    const { data: notes } = await supabase
      .from("notes")
      .select("title, content, is_ai_generated, created_at, lessons(name, groups(name))")
      .order("updated_at", { ascending: false })
      .limit(30);

    if (!notes || notes.length === 0) {
      return json({ error: "اكتب بعض الملاحظات أولاً قبل التحليل" }, 400);
    }

    const userNotes = notes.filter((n: any) => !n.is_ai_generated);
    const aiNotes = notes.filter((n: any) => n.is_ai_generated);

    const stats = {
      totalSampled: notes.length,
      userWritten: userNotes.length,
      aiGenerated: aiNotes.length,
      avgUserLength: userNotes.length
        ? Math.round(userNotes.reduce((s: number, n: any) => s + (n.content?.length || 0), 0) / userNotes.length)
        : 0,
      topics: [...new Set(notes.map((n: any) => n.lessons?.groups?.name).filter(Boolean))],
    };

    const notesDigest = userNotes.slice(0, 12).map((n: any, i: number) => {
      const trimmed = (n.content || "").slice(0, 800);
      return `### Note ${i + 1}: ${n.title}\nGroup: ${n.lessons?.groups?.name || "—"} | Lesson: ${n.lessons?.name || "—"}\n${trimmed}`;
    }).join("\n\n");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return json({ error: "AI service not configured" }, 500);

    const systemPrompt = `أنت مدرب ذكاء اصطناعي خبير لتطبيق Y Note. مهمتك تحليل ملاحظات المستخدم وتحديد مستواه التعليمي بدقة.

قيّم بناءً على:
- عمق المحتوى وجودة الشرح
- استخدام المصطلحات التقنية
- التنظيم والبنية
- التنوع في المواضيع
- مدى الاعتماد على ملاحظات الذكاء الاصطناعي مقابل الكتابة الذاتية

المستويات الممكنة فقط: "Beginner", "Intermediate", "Advanced", "Expert"
نقاط XP من 0 إلى 10000 (تعكس الجهد + الجودة).

أجب بصيغة JSON صالحة فقط بهذا الشكل بالضبط:
{
  "level": "Beginner|Intermediate|Advanced|Expert",
  "xp": <number 0-10000>,
  "summary": "<فقرة 2-3 جمل بالعربية تلخص مستواه ونمط تعلمه>",
  "strengths": ["<نقطة قوة 1>", "<نقطة قوة 2>", "<نقطة قوة 3>"],
  "weaknesses": ["<نقطة ضعف 1>", "<نقطة ضعف 2>"],
  "recommendations": ["<توصية عملية 1>", "<توصية عملية 2>", "<توصية عملية 3>"]
}`;

    const userMessage = `إحصائيات المستخدم:
- عدد الملاحظات المُحللة: ${stats.totalSampled}
- ملاحظات مكتوبة بنفسه: ${stats.userWritten}
- ملاحظات ذكاء اصطناعي: ${stats.aiGenerated}
- متوسط طول الملاحظة: ${stats.avgUserLength} حرف
- المواضيع: ${stats.topics.join(", ") || "غير محدد"}

عينة من ملاحظاته الذاتية:
${notesDigest || "(لا توجد ملاحظات ذاتية كافية)"}

حلّل ومستواه وأعط JSON فقط.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) return json({ error: "حد الاستخدام تجاوز، حاول لاحقًا" }, 429);
      if (aiResponse.status === 402) return json({ error: "نفدت أرصدة الذكاء الاصطناعي" }, 402);
      const errText = await aiResponse.text();
      console.error("AI error", aiResponse.status, errText);
      return json({ error: "AI service error" }, 500);
    }

    const aiData = await aiResponse.json();
    const raw = aiData.choices?.[0]?.message?.content;
    if (!raw) return json({ error: "No response from AI" }, 500);

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const m = raw.match(/\{[\s\S]*\}/);
      parsed = m ? JSON.parse(m[0]) : null;
    }
    if (!parsed) return json({ error: "Invalid AI response" }, 500);

    const level = ["Beginner", "Intermediate", "Advanced", "Expert"].includes(parsed.level)
      ? parsed.level : "Beginner";
    const xp = Math.max(0, Math.min(10000, Number(parsed.xp) || 0));

    // Save snapshot
    const { data: snapshot, error: snapErr } = await supabase
      .from("progress_snapshots")
      .insert({
        user_id: userId,
        level,
        xp,
        summary: parsed.summary || "",
        strengths: parsed.strengths || [],
        weaknesses: parsed.weaknesses || [],
        recommendations: parsed.recommendations || [],
        metrics: stats,
      })
      .select()
      .single();

    if (snapErr) console.error("snap insert err", snapErr);

    // Update profile
    await supabase
      .from("profiles")
      .update({ level, xp, last_analysis_at: new Date().toISOString() })
      .eq("id", userId);

    return json({ success: true, snapshot, level, xp });
  } catch (error) {
    console.error("Error:", error);
    return json({ error: error instanceof Error ? error.message : "Unknown" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
