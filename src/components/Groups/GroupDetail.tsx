import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  BookOpen, 
  FileText, 
  Sparkles,
  Clock,
  ChevronRight,
  ChevronDown,
  X,
  Trash2,
  Loader2,
  GraduationCap,
  Lightbulb
} from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useGroup } from '@/hooks/useGroups';
import { useLessons, useCreateLesson, useDeleteLesson } from '@/hooks/useLessons';
import { useCreateNote, useGenerateAINote } from '@/hooks/useNotes';
import { formatDistanceToNow } from 'date-fns';

const gradientColors = [
  'from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))]',
  'from-[hsl(270_70%_60%)] to-[hsl(320_70%_60%)]',
  'from-[hsl(30_90%_50%)] to-[hsl(0_90%_50%)]',
  'from-[hsl(150_70%_40%)] to-[hsl(180_70%_40%)]',
];

export function GroupDetail() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
  const [showNewLesson, setShowNewLesson] = useState(false);
  const [newLessonName, setNewLessonName] = useState('');
  const [generatingAI, setGeneratingAI] = useState<string | null>(null);

  const { data: group, isLoading: groupLoading } = useGroup(groupId);
  const { data: lessons = [], isLoading: lessonsLoading } = useLessons(groupId);
  const createLesson = useCreateLesson();
  const deleteLesson = useDeleteLesson();
  const createNote = useCreateNote();
  const generateAINote = useGenerateAINote();

  const filteredLessons = lessons.filter(lesson =>
    lesson.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupId) return;
    
    await createLesson.mutateAsync({
      groupId,
      name: newLessonName,
    });
    setShowNewLesson(false);
    setNewLessonName('');
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!groupId) return;
    if (confirm('Are you sure you want to delete this lesson? All notes will be deleted.')) {
      await deleteLesson.mutateAsync({ lessonId, groupId });
    }
  };

  const handleAddNote = async (lessonId: string) => {
    const note = await createNote.mutateAsync({
      lessonId,
      title: 'New Note',
      content: '',
    });
    navigate(`/notes/${note.id}`);
  };

  const handleGenerateAI = async (lessonId: string, notes: { title: string; content: string | null }[]) => {
    const userNotes = notes
      .filter(n => !n.title.startsWith('🤖') && !n.title.startsWith('✨'))
      .map(n => ({ title: n.title, content: n.content || '' }));

    if (userNotes.length === 0) {
      alert('Please add some notes first before generating AI content.');
      return;
    }

    setGeneratingAI(lessonId);
    try {
      await generateAINote.mutateAsync({
        lessonId,
        userNotes,
      });
    } finally {
      setGeneratingAI(null);
    }
  };

  if (groupLoading || lessonsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold mb-2">Group not found</h2>
        <Link to="/groups" className="text-primary hover:underline">
          Back to Groups
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        {/* Back button */}
        <Link to="/groups" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Groups
        </Link>

        {/* Group info */}
        <div className="flex items-start gap-4">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradientColors[0]} flex items-center justify-center text-3xl shadow-lg`}>
            {group.icon || '📚'}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-1">{group.name}</h1>
            <p className="text-muted-foreground">{group.description || 'No description'}</p>
          </div>
        </div>
      </motion.div>

      {/* Actions bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center justify-between gap-4 mb-6"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search lessons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-glass pl-10 pr-4 py-2 w-full"
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowNewLesson(true)}
          className="btn-secondary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Lesson
        </motion.button>
      </motion.div>

      {/* Lessons List */}
      {filteredLessons.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-secondary flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No lessons yet</h3>
          <p className="text-muted-foreground mb-4">Create your first lesson to start learning</p>
          <button
            onClick={() => setShowNewLesson(true)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Lesson
          </button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredLessons.map((lesson, index) => {
              const userNotes = lesson.notes?.filter(n => !n.is_ai_generated) || [];
              const aiNotes = lesson.notes?.filter(n => n.is_ai_generated) || [];
              const isGenerating = generatingAI === lesson.id;
              const isExpanded = expandedLesson === lesson.id;

              return (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass rounded-2xl overflow-hidden"
                >
                  {/* Lesson Header */}
                  <motion.div
                    onClick={() => setExpandedLesson(isExpanded ? null : lesson.id)}
                    className="p-5 cursor-pointer hover:bg-secondary/30 transition-colors flex items-center gap-4"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-6 h-6 text-primary" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg truncate">{lesson.name}</h3>
                        {aiNotes.length > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs flex items-center gap-1 shrink-0">
                            <Sparkles className="w-3 h-3" />
                            {aiNotes.length} AI
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" />
                          {userNotes.length} notes
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDistanceToNow(new Date(lesson.updated_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGenerateAI(lesson.id, lesson.notes || []);
                        }}
                        disabled={isGenerating}
                        className="p-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary transition-colors disabled:opacity-50"
                        title="Generate AI Summary"
                      >
                        {isGenerating ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Sparkles className="w-5 h-5" />
                        )}
                      </motion.button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteLesson(lesson.id);
                        }}
                        className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <motion.div
                        animate={{ rotate: isExpanded ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-border/50"
                      >
                        <div className="p-5 space-y-6">
                          {/* AI Generated Notes Section */}
                          {aiNotes.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <Lightbulb className="w-4 h-4 text-primary" />
                                <h4 className="text-sm font-semibold text-primary">AI Learning Content</h4>
                              </div>
                              <div className="space-y-2">
                                {aiNotes.map((note) => (
                                  <Link key={note.id} to={`/notes/${note.id}`}>
                                    <motion.div
                                      whileHover={{ scale: 1.01, x: 4 }}
                                      className="p-4 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-accent/5 
                                                 border border-primary/20 hover:border-primary/40 transition-all 
                                                 cursor-pointer group"
                                    >
                                      <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                                          <Sparkles className="w-5 h-5 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                                            {note.title}
                                          </p>
                                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                            {note.content?.slice(0, 150) || 'AI generated learning content'}
                                          </p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-2" />
                                      </div>
                                    </motion.div>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* User Notes Section */}
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <FileText className="w-4 h-4 text-muted-foreground" />
                              <h4 className="text-sm font-semibold text-muted-foreground">Your Notes</h4>
                            </div>
                            
                            {userNotes.length > 0 ? (
                              <div className="grid gap-2">
                                {userNotes.map((note) => (
                                  <Link key={note.id} to={`/notes/${note.id}`}>
                                    <motion.div
                                      whileHover={{ x: 4 }}
                                      className="p-3 rounded-xl hover:bg-secondary/50 transition-all flex items-center gap-3 cursor-pointer group"
                                    >
                                      <FileText className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                                          {note.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                          {note.content?.slice(0, 80) || 'Empty note'}
                                        </p>
                                      </div>
                                      <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </motion.div>
                                  </Link>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground text-center py-4">
                                No notes yet. Add your first note!
                              </p>
                            )}

                            {/* Add new note */}
                            <motion.button
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                              onClick={() => handleAddNote(lesson.id)}
                              disabled={createNote.isPending}
                              className="w-full mt-3 p-3 rounded-xl border border-dashed border-border/50 hover:border-primary/50 
                                         hover:bg-primary/5 transition-all flex items-center justify-center gap-2 text-muted-foreground 
                                         hover:text-primary text-sm disabled:opacity-50"
                            >
                              <Plus className="w-4 h-4" />
                              Add Note
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* New Lesson Modal */}
      <AnimatePresence>
        {showNewLesson && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowNewLesson(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Create New Lesson</h2>
                <button
                  onClick={() => setShowNewLesson(false)}
                  className="p-2 rounded-lg hover:bg-secondary transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateLesson} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Lesson Title</label>
                  <input
                    type="text"
                    value={newLessonName}
                    onChange={(e) => setNewLessonName(e.target.value)}
                    placeholder="e.g., Exception Handling"
                    className="input-glass w-full"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNewLesson(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary flex-1"
                    disabled={createLesson.isPending}
                  >
                    {createLesson.isPending ? 'Creating...' : 'Create Lesson'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Generation Overlay */}
      <AnimatePresence>
        {generatingAI && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="text-center"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow">
                <Sparkles className="w-10 h-10 text-primary-foreground animate-pulse" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI is analyzing your notes...</h3>
              <p className="text-muted-foreground">Creating a comprehensive summary with insights</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
