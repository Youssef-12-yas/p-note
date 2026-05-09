import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FolderOpen, 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2,
  BookOpen,
  FileText,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGroups, useCreateGroup, useDeleteGroup } from '@/hooks/useGroups';

const gradientColors = [
  'from-blue-500 to-cyan-500',
  'from-purple-500 to-pink-500',
  'from-orange-500 to-red-500',
  'from-green-500 to-teal-500',
  'from-indigo-500 to-purple-500',
  'from-pink-500 to-rose-500',
];

const defaultIcons = ['📚', '💻', '🧠', '🌳', '🤖', '🌐', '⚛️', '🎨', '📊', '🔬'];

export function GroupsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('📚');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const { data: groups = [], isLoading } = useGroups();
  const createGroup = useCreateGroup();
  const deleteGroup = useDeleteGroup();

  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    await createGroup.mutateAsync({
      name: newGroupName,
      description: newGroupDescription,
      icon: selectedIcon,
    });
    setShowNewGroup(false);
    setNewGroupName('');
    setNewGroupDescription('');
    setSelectedIcon('📚');
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (confirm('Are you sure you want to delete this group? All lessons and notes will be deleted.')) {
      await deleteGroup.mutateAsync(groupId);
    }
    setMenuOpen(null);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold mb-1">Groups</h1>
          <p className="text-muted-foreground">Organize your learning spaces</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3"
        >
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-glass pl-10 pr-4 py-2 w-full sm:w-64"
            />
          </div>

          {/* New Group Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowNewGroup(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Group
          </motion.button>
        </motion.div>
      </div>

      {/* Groups Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass rounded-2xl p-6 animate-pulse">
              <div className="w-14 h-14 rounded-xl bg-secondary mb-4" />
              <div className="h-6 bg-secondary rounded w-3/4 mb-2" />
              <div className="h-4 bg-secondary rounded w-full mb-4" />
              <div className="flex gap-4">
                <div className="h-4 bg-secondary rounded w-20" />
                <div className="h-4 bg-secondary rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredGroups.map((group, index) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link to={`/groups/${group.id}`}>
                  <motion.div
                    whileHover={{ scale: 1.02, y: -4 }}
                    className="glass-hover rounded-2xl p-6 h-full cursor-pointer group relative"
                  >
                    {/* Icon & Menu */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradientColors[index % gradientColors.length]} flex items-center justify-center text-2xl`}>
                        {group.icon || '📚'}
                      </div>
                      <div className="relative">
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setMenuOpen(menuOpen === group.id ? null : group.id);
                          }}
                          className="p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-secondary"
                        >
                          <MoreVertical className="w-4 h-4 text-muted-foreground" />
                        </button>
                        
                        {menuOpen === group.id && (
                          <div className="absolute right-0 top-full mt-1 w-32 glass rounded-lg py-1 z-10">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDeleteGroup(group.id);
                              }}
                              className="w-full px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-semibold mb-2">{group.name}</h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {group.description || 'No description'}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4" />
                        <span>{group.lessonsCount || 0} lessons</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-4 h-4" />
                        <span>{group.notesCount || 0} notes</span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredGroups.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-secondary flex items-center justify-center">
            <FolderOpen className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No groups found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? 'Try a different search term' : 'Create your first group to get started'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowNewGroup(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Group
            </button>
          )}
        </motion.div>
      )}

      {/* New Group Modal */}
      <AnimatePresence>
        {showNewGroup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowNewGroup(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Create New Group</h2>
                <button
                  onClick={() => setShowNewGroup(false)}
                  className="p-2 rounded-lg hover:bg-secondary transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateGroup} className="space-y-4">
                {/* Icon selector */}
                <div>
                  <label className="block text-sm font-medium mb-2">Icon</label>
                  <div className="flex flex-wrap gap-2">
                    {defaultIcons.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setSelectedIcon(icon)}
                        className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                          selectedIcon === icon
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary hover:bg-secondary/80'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Group Name</label>
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="e.g., JavaScript Mastery"
                    className="input-glass w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={newGroupDescription}
                    onChange={(e) => setNewGroupDescription(e.target.value)}
                    placeholder="What will you learn in this group?"
                    rows={3}
                    className="input-glass w-full resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNewGroup(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary flex-1"
                    disabled={createGroup.isPending}
                  >
                    {createGroup.isPending ? 'Creating...' : 'Create Group'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
