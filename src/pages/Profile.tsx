import { motion } from 'framer-motion';
import { useState } from 'react';
import { Mail, Save, Loader2, FolderOpen, BookOpen, FileText, Bot, Type } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardStats, useLatestSnapshot } from '@/hooks/useProgressAnalysis';
import { AvatarUpload } from '@/components/Profile/AvatarUpload';
import { LevelBadge } from '@/components/Profile/LevelBadge';
import { ProgressChart } from '@/components/Profile/ProgressChart';
import { AIAnalysisCard } from '@/components/Profile/AIAnalysisCard';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, profile, updateProfile } = useAuth();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: snapshot } = useLatestSnapshot();

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await updateProfile({ full_name: fullName });
    if (error) toast.error('فشل الحفظ');
    else toast.success('تم تحديث ملفك الشخصي');
    setSaving(false);
  };

  const level = profile?.level || snapshot?.level || 'Beginner';
  const xp = profile?.xp ?? snapshot?.xp ?? 0;

  const statCards = [
    { label: 'مجموعات', value: stats?.totalGroups ?? 0, icon: FolderOpen, color: 'from-blue-500 to-cyan-500' },
    { label: 'دروس', value: stats?.totalLessons ?? 0, icon: BookOpen, color: 'from-purple-500 to-pink-500' },
    { label: 'ملاحظاتك', value: stats?.userNotes ?? 0, icon: FileText, color: 'from-emerald-500 to-teal-500' },
    { label: 'ملاحظات AI', value: stats?.aiNotes ?? 0, icon: Bot, color: 'from-amber-500 to-orange-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5"
      >
        <AvatarUpload size={104} />
        <div className="flex-1 w-full text-center sm:text-right space-y-3">
          <div>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="اسمك"
              className="text-2xl font-bold bg-transparent outline-none border-b border-transparent focus:border-primary/50 transition-all w-full text-center sm:text-right"
            />
            <div className="flex items-center justify-center sm:justify-start gap-2 text-muted-foreground text-sm mt-1">
              <Mail className="w-4 h-4" />
              <span className="truncate">{user?.email}</span>
            </div>
          </div>
          {fullName !== (profile?.full_name || '') && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary inline-flex items-center gap-2 text-sm px-4 py-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              حفظ
            </button>
          )}
        </div>
      </motion.div>

      {/* Level + Stats grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <LevelBadge level={level} xp={xp} />
        </div>
        <div className="lg:col-span-2 grid grid-cols-2 gap-3 sm:gap-4">
          {statCards.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl p-4 sm:p-5"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold tabular-nums">
                {statsLoading ? '—' : s.value.toLocaleString()}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Characters written */}
      {stats && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass rounded-2xl p-4 sm:p-5 flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
            <Type className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">إجمالي ما كتبته</p>
            <p className="text-xl font-bold tabular-nums">
              {stats.totalCharacters.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">حرف</span>
            </p>
          </div>
        </motion.div>
      )}

      {/* Chart */}
      <ProgressChart data={stats?.last30Days || []} />

      {/* AI Analysis */}
      <AIAnalysisCard />
    </div>
  );
}
