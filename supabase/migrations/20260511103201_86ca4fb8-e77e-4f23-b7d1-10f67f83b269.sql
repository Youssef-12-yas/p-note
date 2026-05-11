
-- Extend profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS level text NOT NULL DEFAULT 'Beginner',
  ADD COLUMN IF NOT EXISTS xp integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_analysis_at timestamptz;

-- Progress snapshots table
CREATE TABLE IF NOT EXISTS public.progress_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  level text NOT NULL,
  xp integer NOT NULL DEFAULT 0,
  summary text,
  strengths text[] DEFAULT '{}',
  weaknesses text[] DEFAULT '{}',
  recommendations text[] DEFAULT '{}',
  metrics jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_progress_snapshots_user ON public.progress_snapshots(user_id, created_at DESC);

ALTER TABLE public.progress_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own snapshots" ON public.progress_snapshots;
CREATE POLICY "Users view own snapshots" ON public.progress_snapshots
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users insert own snapshots" ON public.progress_snapshots;
CREATE POLICY "Users insert own snapshots" ON public.progress_snapshots
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Storage bucket for avatars (public read)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- High-performance dashboard stats RPC
CREATE OR REPLACE FUNCTION public.get_user_dashboard_stats()
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  WITH g AS (
    SELECT id FROM public.groups WHERE user_id = auth.uid()
  ),
  l AS (
    SELECT id FROM public.lessons WHERE group_id IN (SELECT id FROM g)
  ),
  n AS (
    SELECT id, is_ai_generated, created_at, updated_at, content
    FROM public.notes WHERE lesson_id IN (SELECT id FROM l)
  ),
  daily AS (
    SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS day,
           count(*) AS notes_count
    FROM n
    WHERE created_at > now() - interval '30 days'
    GROUP BY 1
    ORDER BY 1
  )
  SELECT jsonb_build_object(
    'totalGroups', (SELECT count(*) FROM g),
    'totalLessons', (SELECT count(*) FROM l),
    'totalNotes', (SELECT count(*) FROM n),
    'aiNotes', (SELECT count(*) FILTER (WHERE is_ai_generated) FROM n),
    'userNotes', (SELECT count(*) FILTER (WHERE NOT is_ai_generated) FROM n),
    'totalCharacters', (SELECT coalesce(sum(length(coalesce(content,''))),0) FROM n WHERE NOT is_ai_generated),
    'last30Days', coalesce((SELECT jsonb_agg(jsonb_build_object('day', day, 'count', notes_count)) FROM daily), '[]'::jsonb)
  );
$$;

REVOKE EXECUTE ON FUNCTION public.get_user_dashboard_stats() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.get_user_dashboard_stats() TO authenticated;

-- Per-group stats RPC (replaces N+1 query)
CREATE OR REPLACE FUNCTION public.get_groups_with_stats()
RETURNS TABLE (
  id uuid, name text, description text, icon text,
  user_id uuid, created_at timestamptz, updated_at timestamptz,
  lessons_count bigint, notes_count bigint
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT g.id, g.name, g.description, g.icon, g.user_id, g.created_at, g.updated_at,
         coalesce(ls.lessons_count, 0) AS lessons_count,
         coalesce(ls.notes_count, 0) AS notes_count
  FROM public.groups g
  LEFT JOIN LATERAL (
    SELECT count(DISTINCT l.id) AS lessons_count,
           count(n.id) AS notes_count
    FROM public.lessons l
    LEFT JOIN public.notes n ON n.lesson_id = l.id
    WHERE l.group_id = g.id
  ) ls ON true
  WHERE g.user_id = auth.uid()
  ORDER BY g.updated_at DESC;
$$;

REVOKE EXECUTE ON FUNCTION public.get_groups_with_stats() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.get_groups_with_stats() TO authenticated;
