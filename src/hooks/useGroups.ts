import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Group {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  lessonsCount?: number;
  notesCount?: number;
}

export function useGroups() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['groups', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: groups, error } = await supabase
        .from('groups')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Get counts for each group
      const groupsWithCounts = await Promise.all(
        (groups || []).map(async (group) => {
          const { count: lessonsCount } = await supabase
            .from('lessons')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id);

          const { data: lessons } = await supabase
            .from('lessons')
            .select('id')
            .eq('group_id', group.id);

          let notesCount = 0;
          if (lessons && lessons.length > 0) {
            const lessonIds = lessons.map((l) => l.id);
            const { count } = await supabase
              .from('notes')
              .select('*', { count: 'exact', head: true })
              .in('lesson_id', lessonIds);
            notesCount = count || 0;
          }

          return {
            ...group,
            lessonsCount: lessonsCount || 0,
            notesCount,
          };
        })
      );

      return groupsWithCounts;
    },
    enabled: !!user,
  });
}

export function useGroup(groupId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['group', groupId],
    queryFn: async () => {
      if (!groupId) return null;

      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!groupId,
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ name, description, icon }: { name: string; description?: string; icon?: string }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('groups')
        .insert({
          name,
          description: description || null,
          icon: icon || '📚',
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Group created successfully!');
    },
    onError: (error) => {
      toast.error('Failed to create group: ' + error.message);
    },
  });
}

export function useUpdateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name, description, icon }: { id: string; name?: string; description?: string; icon?: string }) => {
      const { data, error } = await supabase
        .from('groups')
        .update({ name, description, icon })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Group updated successfully!');
    },
    onError: (error) => {
      toast.error('Failed to update group: ' + error.message);
    },
  });
}

export function useDeleteGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (groupId: string) => {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Group deleted successfully!');
    },
    onError: (error) => {
      toast.error('Failed to delete group: ' + error.message);
    },
  });
}
