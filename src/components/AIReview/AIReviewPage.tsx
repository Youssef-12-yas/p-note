import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  BookOpen, 
  FileText, 
  ChevronRight,
  Loader2,
  CheckCircle,
  Brain
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGroups } from '@/hooks/useGroups';
import { useLessons } from '@/hooks/useLessons';
import { useGenerateAINote } from '@/hooks/useNotes';

export function AIReviewPage() {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedNote, setGeneratedNote] = useState<any>(null);

  const { data: groups = [], isLoading: groupsLoading } = useGroups();
  const { data: lessons = [], isLoading: lessonsLoading } = useLessons(selectedGroup || undefined);
  const generateAINote = useGenerateAINote();

  const handleGenerate = async () => {
    if (!selectedLesson) return;

    const lesson = lessons.find(l => l.id === selectedLesson);
    if (!lesson || !lesson.notes || lesson.notes.length === 0) {
      alert('Please add some notes to this lesson first.');
      return;
    }

    const userNotes = lesson.notes
      .filter(n => !n.is_ai_generated)
      .map(n => ({ title: n.title, content: n.content || '' }));

    if (userNotes.length === 0) {
      alert('Please add some user notes (not AI-generated) to this lesson first.');
      return;
    }

    setIsGenerating(true);
    setGeneratedNote(null);

    try {
      const result = await generateAINote.mutateAsync({
        lessonId: selectedLesson,
        userNotes,
      });
      setGeneratedNote(result.note);
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedLessonData = lessons.find(l => l.id === selectedLesson);
  const userNotesCount = selectedLessonData?.notes?.filter(n => !n.is_ai_generated).length || 0;

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">AI Review</h1>
            <p className="text-muted-foreground">Generate AI-powered summaries of your notes</p>
          </div>
        </div>
      </motion.div>

      {/* AI Agents Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 gradient-border p-6 rounded-2xl"
      >
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          Multi-Agent AI System
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {[
            { name: 'Validator', desc: 'Checks accuracy', icon: '✓' },
            { name: 'Teacher', desc: 'Explains concepts', icon: '📚' },
            { name: 'Code Reviewer', desc: 'Fixes code issues', icon: '💻' },
            { name: 'Knowledge Expander', desc: 'Adds insights', icon: '💡' },
          ].map((agent) => (
            <div key={agent.name} className="text-center p-4 rounded-xl bg-secondary/30">
              <div className="text-2xl mb-2">{agent.icon}</div>
              <p className="font-medium text-sm">{agent.name}</p>
              <p className="text-xs text-muted-foreground">{agent.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Selection Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Select Group */}
          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Select a Group
            </h3>

            {groupsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-secondary rounded-xl animate-pulse" />
                ))}
              </div>
            ) : groups.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No groups yet</p>
                <Link to="/groups">
                  <button className="btn-primary">Create your first group</button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {groups.map((group) => (
                  <motion.button
                    key={group.id}
                    whileHover={{ x: 4 }}
                    onClick={() => {
                      setSelectedGroup(group.id);
                      setSelectedLesson(null);
                      setGeneratedNote(null);
                    }}
                    className={`w-full p-4 rounded-xl text-left transition-all flex items-center gap-3 ${
                      selectedGroup === group.id
                        ? 'bg-primary/10 border-2 border-primary'
                        : 'bg-secondary/50 hover:bg-secondary border-2 border-transparent'
                    }`}
                  >
                    <span className="text-2xl">{group.icon || '📚'}</span>
                    <div className="flex-1">
                      <p className="font-medium">{group.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {group.lessonsCount} lessons • {group.notesCount} notes
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* Select Lesson */}
          <AnimatePresence>
            {selectedGroup && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="glass rounded-2xl p-6"
              >
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Select a Lesson
                </h3>

                {lessonsLoading ? (
                  <div className="space-y-2">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-14 bg-secondary rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : lessons.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No lessons in this group yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {lessons.map((lesson) => {
                      const userNotes = lesson.notes?.filter(n => !n.is_ai_generated).length || 0;
                      return (
                        <motion.button
                          key={lesson.id}
                          whileHover={{ x: 4 }}
                          onClick={() => {
                            setSelectedLesson(lesson.id);
                            setGeneratedNote(null);
                          }}
                          className={`w-full p-4 rounded-xl text-left transition-all flex items-center gap-3 ${
                            selectedLesson === lesson.id
                              ? 'bg-primary/10 border-2 border-primary'
                              : 'bg-secondary/50 hover:bg-secondary border-2 border-transparent'
                          }`}
                        >
                          <BookOpen className="w-5 h-5 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="font-medium">{lesson.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {userNotes} user notes • {lesson.notes?.filter(n => n.is_ai_generated).length || 0} AI notes
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Generate Button */}
          <AnimatePresence>
            {selectedLesson && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGenerate}
                  disabled={isGenerating || userNotesCount === 0}
                  className="btn-primary w-full py-4 flex items-center justify-center gap-3 text-lg disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Generating AI Summary...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-6 h-6" />
                      Generate AI Summary
                    </>
                  )}
                </motion.button>
                {userNotesCount === 0 && (
                  <p className="text-sm text-muted-foreground text-center mt-2">
                    Add some notes to this lesson first
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Preview Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Output
          </h3>

          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow">
                <Sparkles className="w-8 h-8 text-primary-foreground animate-pulse" />
              </div>
              <h4 className="text-lg font-medium mb-2">Analyzing your notes...</h4>
              <p className="text-muted-foreground text-sm text-center">
                AI is reading, understanding, and creating a comprehensive summary
              </p>
            </div>
          ) : generatedNote ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-success">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">AI Summary Generated!</span>
              </div>

              <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
                <h4 className="font-medium mb-2">{generatedNote.title}</h4>
                <p className="text-sm text-muted-foreground line-clamp-6">
                  {generatedNote.content?.slice(0, 500)}...
                </p>
              </div>

              <Link to={`/notes/${generatedNote.id}`}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-secondary w-full flex items-center justify-center gap-2"
                >
                  View Full Note
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </Link>
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>Select a group and lesson, then click "Generate AI Summary"</p>
              <p className="text-sm mt-2">
                AI will analyze your notes and create a comprehensive summary
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
