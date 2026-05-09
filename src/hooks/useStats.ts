import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['stats', user?.id],
    queryFn: async () => {
      if (!user) return { totalGroups: 0, totalNotes: 0, aiReviews: 0 };

      // Get groups count
      const { count: groupsCount } = await supabase
        .from('groups')
        .select('*', { count: 'exact', head: true });

      // Get all lessons for user's groups
      const { data: groups } = await supabase
        .from('groups')
        .select('id');

      let totalNotes = 0;
      let aiReviews = 0;

      if (groups && groups.length > 0) {
        const groupIds = groups.map((g) => g.id);

        const { data: lessons } = await supabase
          .from('lessons')
          .select('id')
          .in('group_id', groupIds);

        if (lessons && lessons.length > 0) {
          const lessonIds = lessons.map((l) => l.id);

          const { count: notesCount } = await supabase
            .from('notes')
            .select('*', { count: 'exact', head: true })
            .in('lesson_id', lessonIds);

          const { count: aiCount } = await supabase
            .from('notes')
            .select('*', { count: 'exact', head: true })
            .in('lesson_id', lessonIds)
            .eq('is_ai_generated', true);

          totalNotes = notesCount || 0;
          aiReviews = aiCount || 0;
        }
      }

      return {
        totalGroups: groupsCount || 0,
        totalNotes,
        aiReviews,
      };
    },
    enabled: !!user,
  });
}
