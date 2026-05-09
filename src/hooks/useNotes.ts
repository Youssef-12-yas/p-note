import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Note {
  id: string;
  title: string;
  content: string | null;
  is_ai_generated: boolean;
  lesson_id: string;
  created_at: string;
  updated_at: string;
}

export interface NoteWithContext extends Note {
  lesson?: {
    name: string;
    group_id: string;
    groups?: {
      name: string;
    };
  };
}

export function useNotes(lessonId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['notes', lessonId],
    queryFn: async () => {
      if (!lessonId) return [];

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user && !!lessonId,
  });
}

export function useNote(noteId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['note', noteId],
    queryFn: async (): Promise<NoteWithContext | null> => {
      if (!noteId) return null;

      const { data, error } = await supabase
        .from('notes')
        .select('*, lessons(name, group_id, groups(name))')
        .eq('id', noteId)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        return {
          ...data,
          lesson: data.lessons as any,
        };
      }
      return null;
    },
    enabled: !!user && !!noteId,
  });
}

export function useRecentNotes(limit = 5) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['recentNotes', user?.id],
    queryFn: async (): Promise<NoteWithContext[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('notes')
        .select('*, lessons(name, group_id, groups(name))')
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      
      return (data || []).map((note) => ({
        ...note,
        lesson: note.lessons as any,
      }));
    },
    enabled: !!user,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ lessonId, title, content }: { lessonId: string; title: string; content?: string }) => {
      const { data, error } = await supabase
        .from('notes')
        .insert({
          lesson_id: lessonId,
          title,
          content: content || '',
          is_ai_generated: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notes', variables.lessonId] });
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      queryClient.invalidateQueries({ queryKey: ['recentNotes'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Note created successfully!');
    },
    onError: (error) => {
      toast.error('Failed to create note: ' + error.message);
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, title, content }: { id: string; title?: string; content?: string }) => {
      const { data, error } = await supabase
        .from('notes')
        .update({ title, content })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notes', data.lesson_id] });
      queryClient.invalidateQueries({ queryKey: ['note', data.id] });
      queryClient.invalidateQueries({ queryKey: ['recentNotes'] });
    },
    onError: (error) => {
      toast.error('Failed to save note: ' + error.message);
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ noteId, lessonId }: { noteId: string; lessonId: string }) => {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;
      return lessonId;
    },
    onSuccess: (lessonId) => {
      queryClient.invalidateQueries({ queryKey: ['notes', lessonId] });
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      queryClient.invalidateQueries({ queryKey: ['recentNotes'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Note deleted successfully!');
    },
    onError: (error) => {
      toast.error('Failed to delete note: ' + error.message);
    },
  });
}

export function useGenerateAINote() {
  const queryClient = useQueryClient();
  const { session } = useAuth();

  return useMutation({
    mutationFn: async ({ lessonId, userNotes }: { lessonId: string; userNotes: { title: string; content: string }[] }) => {
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-ai-note`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ lessonId, userNotes }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate AI note');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notes', variables.lessonId] });
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      queryClient.invalidateQueries({ queryKey: ['recentNotes'] });
      toast.success('AI note generated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
