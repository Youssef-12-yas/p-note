-- Create profiles table linked to auth.users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create groups table
CREATE TABLE public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '📚',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lessons table
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notes table
CREATE TABLE public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  is_ai_generated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if user owns group
CREATE OR REPLACE FUNCTION public.user_owns_group(group_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.groups
    WHERE id = group_id AND user_id = auth.uid()
  )
$$;

-- Helper function: Check if user owns lesson
CREATE OR REPLACE FUNCTION public.user_owns_lesson(lesson_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.lessons l
    JOIN public.groups g ON l.group_id = g.id
    WHERE l.id = lesson_id AND g.user_id = auth.uid()
  )
$$;

-- Helper function: Check if user owns note
CREATE OR REPLACE FUNCTION public.user_owns_note(note_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.notes n
    JOIN public.lessons l ON n.lesson_id = l.id
    JOIN public.groups g ON l.group_id = g.id
    WHERE n.id = note_id AND g.user_id = auth.uid()
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (id = auth.uid());

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (id = auth.uid());

-- Groups policies
CREATE POLICY "Users can view own groups"
ON public.groups FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create own groups"
ON public.groups FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own groups"
ON public.groups FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete own groups"
ON public.groups FOR DELETE
USING (user_id = auth.uid());

-- Lessons policies
CREATE POLICY "Users can view lessons in own groups"
ON public.lessons FOR SELECT
USING (public.user_owns_group(group_id));

CREATE POLICY "Users can create lessons in own groups"
ON public.lessons FOR INSERT
WITH CHECK (public.user_owns_group(group_id));

CREATE POLICY "Users can update lessons in own groups"
ON public.lessons FOR UPDATE
USING (public.user_owns_group(group_id));

CREATE POLICY "Users can delete lessons in own groups"
ON public.lessons FOR DELETE
USING (public.user_owns_group(group_id));

-- Notes policies
CREATE POLICY "Users can view notes in own lessons"
ON public.notes FOR SELECT
USING (public.user_owns_lesson(lesson_id));

CREATE POLICY "Users can create notes in own lessons"
ON public.notes FOR INSERT
WITH CHECK (public.user_owns_lesson(lesson_id));

CREATE POLICY "Users can update notes in own lessons"
ON public.notes FOR UPDATE
USING (public.user_owns_lesson(lesson_id));

CREATE POLICY "Users can delete notes in own lessons"
ON public.notes FOR DELETE
USING (public.user_owns_lesson(lesson_id));

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON public.groups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON public.lessons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();