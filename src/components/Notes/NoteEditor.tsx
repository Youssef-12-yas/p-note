import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Save, Sparkles, Loader2, Trash2, Eye, Edit3 } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useNote, useUpdateNote, useDeleteNote } from '@/hooks/useNotes';
import { useVerifyNote, type VerificationResult } from '@/hooks/useVerifyNote';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { MarkdownRenderer } from './MarkdownRenderer';
import { VerificationPanel } from './VerificationPanel';
import { RichEditor } from './RichEditor';
import { useT } from '@/lib/i18n';

// Debounce utility to prevent freezing
function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedFn = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedFn;
}

export function NoteEditor() {
  const { t } = useT();
  const { noteId } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  
  const initialLoadRef = useRef(true);

  const { data: note, isLoading } = useNote(noteId);
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  const verifyNote = useVerifyNote();

  // Initialize content only once when note loads
  useEffect(() => {
    if (note && initialLoadRef.current) {
      setTitle(note.title);
      setContent(note.content || '');
      initialLoadRef.current = false;
    }
  }, [note]);

  // Reset initial load ref when noteId changes
  useEffect(() => {
    initialLoadRef.current = true;
    setVerificationResult(null);
  }, [noteId]);

  // Stable save function
  const saveNote = useCallback(
    async (id: string, newTitle: string, newContent: string) => {
      try {
        await updateNote.mutateAsync({
          id,
          title: newTitle,
          content: newContent,
        });
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    },
    [updateNote]
  );

  // Debounced save - 1.5s delay to prevent freezing
  const debouncedSave = useDebounce(saveNote, 1500);

  const handleContentChange = useCallback(
    (newContent: string) => {
      setContent(newContent);
      setHasUnsavedChanges(true);
      if (noteId) {
        debouncedSave(noteId, title, newContent);
      }
    },
    [noteId, title, debouncedSave]
  );

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTitle = e.target.value;
      setTitle(newTitle);
      setHasUnsavedChanges(true);
      if (noteId) {
        debouncedSave(noteId, newTitle, content);
      }
    },
    [noteId, content, debouncedSave]
  );

  const handleSave = async () => {
    if (!noteId || !note) return;
    setIsSaving(true);
    try {
      await updateNote.mutateAsync({
        id: noteId,
        title,
        content,
      });
      setHasUnsavedChanges(false);

      // Trigger AI verification after manual save (only for user notes with content)
      if (!note.is_ai_generated && content.trim().length > 0) {
        toast.success(t('note.aiAnalyzing'));
        setVerificationResult(null);
        verifyNote.mutate(
          {
            noteId,
            noteTitle: title || 'Untitled',
            noteContent: content,
            lessonId: note.lesson_id,
          },
          {
            onSuccess: (data) => setVerificationResult(data.analysis),
            onError: (err) => console.error('AI verify failed:', err),
          }
        );
      } else {
        toast.success(t('note.saved'));
      }
    } catch (err) {
      console.error('Save failed:', err);
      toast.error(t('note.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!note) return;
    if (confirm(t('note.confirmDelete'))) {
      await deleteNote.mutateAsync({
        noteId: note.id,
        lessonId: note.lesson_id,
      });
      navigate(`/groups/${note.lesson?.group_id}`);
    }
  };

  // toolbar lives inside RichEditor

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold mb-2">{t('note.notFound')}</h2>
        <Link to="/groups" className="text-primary hover:underline">
          {t('common.back')}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-10rem)] flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4"
      >
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to={`/groups/${note.lesson?.group_id}`}
            className="p-2 rounded-lg hover:bg-secondary transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              className="text-xl sm:text-2xl font-bold bg-transparent border-none outline-none focus:ring-0 w-full"
              placeholder={t('note.titlePlaceholder')}
              readOnly={note.is_ai_generated}
            />
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2 truncate">
              <span className="truncate">{note.lesson?.groups?.name} → {note.lesson?.name}</span>
              {note.is_ai_generated && (
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs flex items-center gap-1 shrink-0">
                  <Sparkles className="w-3 h-3" />
                  AI
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-auto sm:ml-0">
          <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">
            {hasUnsavedChanges
              ? t('note.unsaved')
              : `${t('note.savedAgo')} ${formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}`}
          </span>

          {/* Preview toggle */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`p-2 rounded-lg transition-colors ${
              isPreviewMode ? 'bg-primary/10 text-primary' : 'hover:bg-secondary text-muted-foreground'
            }`}
            title={isPreviewMode ? t('note.edit') : t('note.preview')}
          >
            {isPreviewMode ? <Edit3 className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </motion.button>

          {!note.is_ai_generated && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={isSaving}
              className="btn-secondary flex items-center gap-2 disabled:opacity-60 px-3 py-2 sm:px-6 sm:py-3"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span className="hidden sm:inline">{t('note.save')}</span>
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDelete}
            className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>

      {/* AI Verification Panel */}
      {!note.is_ai_generated && (
        <VerificationPanel result={verificationResult} isLoading={verifyNote.isPending} />
      )}

      {/* Toolbar */}
      {!note.is_ai_generated && !isPreviewMode && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-2 flex items-center gap-1 mb-4 overflow-x-auto"
        >
          {toolbarButtons.map((button) => (
            <motion.button
              key={button.label}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={button.action}
              className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
              title={button.label}
            >
              <button.icon className="w-4 h-4" />
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Editor / Preview */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className={`flex-1 glass rounded-2xl overflow-hidden flex flex-col ${
          note.is_ai_generated ? 'ai-note-container' : ''
        }`}
      >
        <AnimatePresence mode="wait">
          {isPreviewMode || note.is_ai_generated ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 overflow-auto p-4 sm:p-6"
            >
              <MarkdownRenderer content={content} className="note-content" />
            </motion.div>
          ) : (
            <motion.div
              key="editor"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 p-4 sm:p-6 flex flex-col"
            >
              <textarea
                ref={textareaRef}
                value={content}
                onChange={handleContentChange}
                className="flex-1 w-full max-w-3xl mx-auto bg-transparent border-none outline-none resize-none text-[17px] sm:text-lg leading-8 tracking-[0.005em] placeholder:text-muted-foreground/60"
                placeholder={t('note.startWriting')}
                spellCheck={false}
                autoFocus
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
