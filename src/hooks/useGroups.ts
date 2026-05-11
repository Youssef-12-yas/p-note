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
      const { data, error } = await supabase.rpc('get_groups_with_stats');
      if (error) throw error;
      return (data || []).map((g: any) => ({
        id: g.id,
        name: g.name,
        description: g.description,
        icon: g.icon,
        user_id: g.user_id,
        created_at: g.created_at,
        updated_at: g.updated_at,
        lessonsCount: Number(g.lessons_count) || 0,
        notesCount: Number(g.notes_count) || 0,
      })) as Group[];
    },
    enabled: !!user,
    staleTime: 30 * 1000,
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
