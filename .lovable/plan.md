# خطة التحسين الشاملة لـ Y Note

## 1. صفحة البروفايل الجديدة (`/profile`)

**الواجهة:**
- صورة شخصية قابلة للرفع (Avatar) + اسم المستخدم + البريد
- قسم "مستواي" مع شارة (Beginner / Intermediate / Advanced / Expert) محسوبة بالـ AI
- بطاقات إحصائية: عدد المجموعات، الدروس، الملاحظات، ملاحظات AI، نسبة دقة الكتابة
- مخطط بياني (Recharts) للنشاط آخر 30 يوم
- زر "تحليل تقدمي بالذكاء الاصطناعي" يُنتج تقريرًا مفصلاً عن نقاط القوة والضعف وخطوات تطور

**البنية التحتية:**
- Storage Bucket: `avatars` (public) مع RLS سياسات (المستخدم يرفع/يحدّث/يحذف ملفاته فقط)
- إضافة عمود `level` و `xp` و `last_analysis` للجدول `profiles`
- جدول `progress_snapshots` لتخزين تقارير AI الدورية (للأداء بدون إعادة الحساب)

## 2. تحليل المستوى بالذكاء الاصطناعي

Edge Function جديدة: `analyze-user-progress`
- تجمع: عدد ونوع الملاحظات + ملاحظات AI + التصحيحات السابقة
- ترسلها إلى Lovable AI (gemini-2.5-flash) مع schema منظّم
- ترجع: المستوى، نقاط XP، تحليل نصي، توصيات، نقاط قوة/ضعف
- تُخزّن النتيجة في `progress_snapshots` و `profiles.level`
- محدودة بـ تشغيل واحد كل 6 ساعات لكل مستخدم (لتوفير الكريدت)

## 3. تحسين تصميم الهاتف

- **Sidebar/Drawer**: انتقالات أنعم، إغلاق تلقائي عند التنقل
- **GroupsPage**: شبكة 1 عمود على الموبايل، مسافات أفضل، أزرار أكبر للمس
- **NoteEditor**: شريط أدوات مدمج للموبايل، عرض كامل، تحسين لوحة المفاتيح
- **Cards**: حشوة وحجم خط متجاوبان، حالات تحميل (Skeleton) أنظف
- **Bottom Navigation**: شريط سفلي ثابت على الموبايل للوصول السريع

## 4. تحسينات الأداء والتوسع

- **قاعدة البيانات**: استبدال N+1 query في `useGroups` بـ RPC واحد يجمع الإحصائيات
- **React Query**: ضبط `staleTime` و `gcTime` للحد من الطلبات المكررة
- **Code splitting**: lazy load للصفحات الثقيلة (AIReview, NoteEditor)
- **Realtime مُحسّن**: تفعيل فقط على الصفحة النشطة
- **Image optimization**: ضغط الصور المرفوعة قبل الرفع
- **Bundle**: إزالة imports غير مستخدمة من shadcn

## التفاصيل التقنية

### Migration:
```sql
ALTER TABLE profiles ADD COLUMN level text DEFAULT 'Beginner',
  ADD COLUMN xp integer DEFAULT 0,
  ADD COLUMN last_analysis_at timestamptz;

CREATE TABLE progress_snapshots (
  id uuid PK, user_id uuid, level text, xp int,
  analysis jsonb, strengths text[], weaknesses text[],
  recommendations text[], created_at timestamptz
);
-- RLS: المستخدم يرى/ينشئ سناباتشاته فقط

-- RPC للأداء
CREATE FUNCTION get_user_dashboard_stats(uid uuid) RETURNS jsonb ...

-- Storage
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
-- RLS: auth.uid() = (storage.foldername(name))[1]
```

### ملفات جديدة:
- `src/pages/Profile.tsx`
- `src/components/Profile/AvatarUpload.tsx`
- `src/components/Profile/LevelBadge.tsx`
- `src/components/Profile/ProgressChart.tsx`
- `src/components/Profile/AIAnalysisCard.tsx`
- `src/hooks/useProfile.ts` (موسّع)
- `src/hooks/useProgressAnalysis.ts`
- `src/components/Layout/MobileBottomNav.tsx`
- `supabase/functions/analyze-user-progress/index.ts`

### النموذج المستخدم: 
`google/gemini-2.5-flash` (سريع وقليل التكلفة، كافٍ للتحليل النصي)

---

هل تعتمد الخطة لأبدأ التنفيذ؟
