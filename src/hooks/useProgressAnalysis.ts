import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ProgressSnapshot {
  id: string;
  level: string;
  xp: number;
  summary: string | null;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  metrics: any;
  created_at: string;
}

export function useLatestSnapshot() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['snapshot', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('progress_snapshots')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as ProgressSnapshot | null;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
}

export function useDashboardStats() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase.rpc('get_user_dashboard_stats');
      if (error) throw error;
      return data as {
        totalGroups: number;
        totalLessons: number;
        totalNotes: number;
        aiNotes: number;
        userNotes: number;
        totalCharacters: number;
        last30Days: { day: string; count: number }[];
      };
    },
    enabled: !!user,
    staleTime: 60 * 1000,
  });
}

export function useAnalyzeProgress() {
  const queryClient = useQueryClient();
  const { session } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!session?.access_token) throw new Error('Not authenticated');
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-user-progress`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to analyze progress');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['snapshot'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('تم تحديث تحليل تقدمك! 🎉');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
