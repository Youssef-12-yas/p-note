import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData?.user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { noteId, noteTitle, noteContent, lessonId } = await req.json();

    if (!noteId || !noteContent || !lessonId) {
      return new Response(
        JSON.stringify({ error: "noteId, noteContent, and lessonId are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get lesson info for context
    const { data: lesson, error: lessonError } = await supabase
      .from("lessons")
      .select("name, group_id, groups(name)")
      .eq("id", lessonId)
      .single();

    if (lessonError || !lesson) {
      return new Response(
        JSON.stringify({ error: "Lesson not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

     const systemPrompt = `You are an expert AI learning assistant for P-Note. Your job is to analyze student notes and provide intelligent feedback in a structured JSON format.

CRITICAL: You must respond ONLY with valid JSON, no other text.

Analyze the student's note and:
1. VERIFY accuracy - check for any incorrect information or misconceptions
2. IDENTIFY if the content could benefit from expansion
3. If there are issues or areas to expand, provide helpful educational content

The lesson topic is: "${lesson.name}" from the group "${(lesson as any).groups?.name || 'General'}".

Respond with this exact JSON structure:
{
  "hasIssues": boolean,
  "verificationStatus": "correct" | "needs_correction" | "partially_correct",
  "issues": [
    {
      "original": "the incorrect or incomplete statement",
      "correction": "the corrected information",
      "explanation": "why this matters"
    }
  ],
  "canExpand": boolean,
  "expansion": {
    "title": "topic for expansion based on what they learned",
    "content": "expanded knowledge in markdown format with examples, code if relevant, and explanations. Be comprehensive but clear. Include practical examples."
  },
  "encouragement": "a brief encouraging message about their learning"
}

Rules:
- If the note is accurate, set hasIssues to false and issues to []
- If expansion is possible, provide valuable next-step knowledge that builds on what they learned
- For programming topics, include code examples in the expansion
- Keep explanations beginner-friendly but thorough
- Be encouraging and supportive like a mentor`;

    const userMessage = `Please analyze this student note:

Title: ${noteTitle || "Untitled Note"}

Content:
${noteContent}`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add more credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;

    if (!aiContent) {
      return new Response(
        JSON.stringify({ error: "No response from AI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the JSON response
    let analysisResult;
    try {
      // Clean up the response in case it has markdown code blocks
      let cleanedContent = aiContent.trim();
      if (cleanedContent.startsWith("```json")) {
        cleanedContent = cleanedContent.replace(/^```json\n?/, "").replace(/\n?```$/, "");
      } else if (cleanedContent.startsWith("```")) {
        cleanedContent = cleanedContent.replace(/^```\n?/, "").replace(/\n?```$/, "");
      }
      analysisResult = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiContent);
      return new Response(
        JSON.stringify({ error: "Failed to parse AI analysis" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If there's expanded knowledge to add, create a new AI note
    let expansionNote = null;
    if (analysisResult.canExpand && analysisResult.expansion?.content) {
      const expansionContent = `## 🎯 AI Knowledge Expansion

${analysisResult.encouragement || "Great work on your learning!"}

---

${analysisResult.expansion.content}

---

*This knowledge expansion was generated based on your note "${noteTitle || 'Untitled'}" to help deepen your understanding.*`;

      const { data: newNote, error: insertError } = await supabase
        .from("notes")
        .insert({
          lesson_id: lessonId,
          title: `✨ ${analysisResult.expansion.title || "Knowledge Expansion"}`,
          content: expansionContent,
          is_ai_generated: true,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Insert error:", insertError);
      } else {
        expansionNote = newNote;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis: {
          hasIssues: analysisResult.hasIssues || false,
          verificationStatus: analysisResult.verificationStatus || "correct",
          issues: analysisResult.issues || [],
          encouragement: analysisResult.encouragement || "Keep up the great work!",
        },
        expansionNote,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
