import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface VerificationIssue {
  original: string;
  correction: string;
  explanation: string;
}

export interface VerificationResult {
  hasIssues: boolean;
  verificationStatus: 'correct' | 'needs_correction' | 'partially_correct';
  issues: VerificationIssue[];
  encouragement: string;
}

export interface VerifyNoteResponse {
  success: boolean;
  analysis: VerificationResult;
  expansionNote?: {
    id: string;
    title: string;
    content: string;
  } | null;
}

export function useVerifyNote() {
  const queryClient = useQueryClient();
  const { session } = useAuth();

  return useMutation({
    mutationFn: async ({
      noteId,
      noteTitle,
      noteContent,
      lessonId,
    }: {
      noteId: string;
      noteTitle: string;
      noteContent: string;
      lessonId: string;
    }): Promise<VerifyNoteResponse> => {
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-and-expand-note`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ noteId, noteTitle, noteContent, lessonId }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to verify note');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notes', variables.lessonId] });
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      queryClient.invalidateQueries({ queryKey: ['recentNotes'] });
      
      if (data.analysis.hasIssues) {
        toast.info('AI found some areas to review', {
          description: 'Check the verification panel for details',
        });
      } else if (data.expansionNote) {
        toast.success('Knowledge expanded!', {
          description: 'AI added new learning material based on your note',
        });
      } else {
        toast.success(data.analysis.encouragement || 'Note verified successfully!');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
