import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Lesson {
  id: string;
  name: string;
  description: string | null;
  group_id: string;
  created_at: string;
  updated_at: string;
  notesCount?: number;
  notes?: Note[];
}

export interface Note {
  id: string;
  title: string;
  content: string | null;
  is_ai_generated: boolean;
  lesson_id: string;
  created_at: string;
  updated_at: string;
}

export function useLessons(groupId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['lessons', groupId],
    queryFn: async () => {
      if (!groupId) return [];

      const { data: lessons, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Get notes for each lesson
      const lessonsWithNotes = await Promise.all(
        (lessons || []).map(async (lesson) => {
          const { data: notes, count } = await supabase
            .from('notes')
            .select('*', { count: 'exact' })
            .eq('lesson_id', lesson.id)
            .order('created_at', { ascending: true });

          return {
            ...lesson,
            notesCount: count || 0,
            notes: notes || [],
          };
        })
      );

      return lessonsWithNotes;
    },
    enabled: !!user && !!groupId,
  });
}

export function useLesson(lessonId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      if (!lessonId) return null;

      const { data, error } = await supabase
        .from('lessons')
        .select('*, groups(name)')
        .eq('id', lessonId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!lessonId,
  });
}

export function useCreateLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, name, description }: { groupId: string; name: string; description?: string }) => {
      const { data, error } = await supabase
        .from('lessons')
        .insert({
          group_id: groupId,
          name,
          description: description || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lessons', variables.groupId] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Lesson created successfully!');
    },
    onError: (error) => {
      toast.error('Failed to create lesson: ' + error.message);
    },
  });
}

export function useUpdateLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name, description }: { id: string; name?: string; description?: string }) => {
      const { data, error } = await supabase
        .from('lessons')
        .update({ name, description })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lessons', data.group_id] });
      toast.success('Lesson updated successfully!');
    },
    onError: (error) => {
      toast.error('Failed to update lesson: ' + error.message);
    },
  });
}

export function useDeleteLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ lessonId, groupId }: { lessonId: string; groupId: string }) => {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId);

      if (error) throw error;
      return groupId;
    },
    onSuccess: (groupId) => {
      queryClient.invalidateQueries({ queryKey: ['lessons', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Lesson deleted successfully!');
    },
    onError: (error) => {
      toast.error('Failed to delete lesson: ' + error.message);
    },
  });
}
