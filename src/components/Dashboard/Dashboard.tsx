import { motion } from 'framer-motion';
import { 
  FolderOpen, 
  FileText, 
  Sparkles, 
  Clock, 
  TrendingUp,
  Plus,
  ArrowRight,
  Brain
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useGroups } from '@/hooks/useGroups';
import { useRecentNotes } from '@/hooks/useNotes';
import { useStats } from '@/hooks/useStats';
import { formatDistanceToNow } from 'date-fns';

const gradientColors = [
  'from-blue-500 to-cyan-500',
  'from-purple-500 to-pink-500',
  'from-orange-500 to-red-500',
  'from-green-500 to-teal-500',
  'from-indigo-500 to-purple-500',
  'from-pink-500 to-rose-500',
];

export function Dashboard() {
  const { profile, user } = useAuth();
  const { data: groups = [], isLoading: groupsLoading } = useGroups();
  const { data: recentNotes = [], isLoading: notesLoading } = useRecentNotes(5);
  const { data: stats } = useStats();

  const displayName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there';
  
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const statsData = [
    { label: 'Total Groups', value: stats?.totalGroups || 0, icon: FolderOpen, trend: '+2 this week' },
    { label: 'Total Notes', value: stats?.totalNotes || 0, icon: FileText, trend: '+12 this week' },
    { label: 'AI Reviews', value: stats?.aiReviews || 0, icon: Sparkles, trend: '+5 this week' },
  ];

  const recentGroups = groups.slice(0, 4);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-2">{greeting()}, {displayName} 👋</h1>
          <p className="text-muted-foreground">Ready to expand your knowledge today?</p>
        </motion.div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statsData.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card-interactive"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xs text-success flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {stat.trend}
              </span>
            </div>
            <p className="text-3xl font-bold mb-1">{stat.value}</p>
            <p className="text-muted-foreground text-sm">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-2xl p-6 mb-8"
      >
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/groups">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Group
            </motion.button>
          </Link>
          <Link to="/ai-review">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-secondary flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              AI Review
            </motion.button>
          </Link>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Groups */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Your Groups</h2>
            <Link to="/groups" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          {groupsLoading ? (
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="glass rounded-xl p-4 animate-pulse">
                  <div className="w-10 h-10 rounded-lg bg-secondary mb-3" />
                  <div className="h-4 bg-secondary rounded w-3/4 mb-2" />
                  <div className="h-3 bg-secondary rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : recentGroups.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {recentGroups.map((group, index) => (
                <Link key={group.id} to={`/groups/${group.id}`}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="glass-hover rounded-xl p-4 cursor-pointer"
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradientColors[index % gradientColors.length]} flex items-center justify-center mb-3 text-xl`}>
                      {group.icon || '📚'}
                    </div>
                    <h3 className="font-medium mb-1 truncate">{group.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {group.lessonsCount} lessons • {group.notesCount} notes
                    </p>
                  </motion.div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="glass rounded-xl p-8 text-center">
              <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground mb-4">No groups yet</p>
              <Link to="/groups">
                <button className="btn-primary">Create your first group</button>
              </Link>
            </div>
          )}
        </motion.div>

        {/* Recent Notes */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Notes</h2>
          </div>
          
          {notesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass rounded-xl p-4 animate-pulse flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-secondary" />
                  <div className="flex-1">
                    <div className="h-4 bg-secondary rounded w-3/4 mb-2" />
                    <div className="h-3 bg-secondary rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentNotes.length > 0 ? (
            <div className="space-y-3">
              {recentNotes.map((note, index) => (
                <Link key={note.id} to={`/notes/${note.id}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    whileHover={{ x: 4 }}
                    className="glass-hover rounded-xl p-4 cursor-pointer flex items-center gap-4"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      note.is_ai_generated 
                        ? 'bg-gradient-to-br from-primary/20 to-accent/20' 
                        : 'bg-secondary'
                    }`}>
                      {note.is_ai_generated ? (
                        <Sparkles className="w-5 h-5 text-primary" />
                      ) : (
                        <FileText className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate flex items-center gap-2">
                        {note.title}
                        {note.is_ai_generated && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">AI</span>
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {note.lesson?.groups?.name} → {note.lesson?.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="glass rounded-xl p-8 text-center">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No notes yet</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* AI Insight Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-8 gradient-border p-6 rounded-2xl"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
            <Brain className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">AI Insight</h3>
            <p className="text-muted-foreground text-sm mb-3">
              {groups.length > 0 
                ? `You have ${groups.length} learning groups. Keep adding notes and use AI Review to validate and expand your knowledge!`
                : 'Start by creating your first group to organize your learning. AI will help you review and expand your knowledge.'}
            </p>
            <Link to="/ai-review" className="text-sm text-primary hover:underline flex items-center gap-1">
              Get personalized recommendations <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
