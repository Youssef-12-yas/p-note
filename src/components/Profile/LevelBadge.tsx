import { motion } from 'framer-motion';
import { Sparkles, Trophy, Zap, Flame } from 'lucide-react';

const LEVELS = {
  Beginner: { min: 0, max: 1500, color: 'from-emerald-500 to-teal-500', icon: Sparkles, label: 'مبتدئ' },
  Intermediate: { min: 1500, max: 4000, color: 'from-blue-500 to-cyan-500', icon: Zap, label: 'متوسط' },
  Advanced: { min: 4000, max: 7500, color: 'from-purple-500 to-pink-500', icon: Flame, label: 'متقدم' },
  Expert: { min: 7500, max: 10000, color: 'from-amber-500 to-orange-500', icon: Trophy, label: 'خبير' },
} as const;

interface LevelBadgeProps {
  level: string;
  xp: number;
}

export function LevelBadge({ level, xp }: LevelBadgeProps) {
  const config = LEVELS[level as keyof typeof LEVELS] || LEVELS.Beginner;
  const Icon = config.icon;
  const progress = Math.min(100, ((xp - config.min) / (config.max - config.min)) * 100);
  const nextXp = config.max;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6 relative overflow-hidden"
    >
      <div
        className={`absolute -top-12 -right-12 w-40 h-40 rounded-full bg-gradient-to-br ${config.color} opacity-20 blur-3xl`}
      />
      <div className="relative">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">مستواك</p>
            <h3 className="text-xl font-bold">{config.label} <span className="text-sm text-muted-foreground">({level})</span></h3>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-mono">{xp.toLocaleString()} XP</span>
            <span className="text-muted-foreground">{nextXp.toLocaleString()} XP</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full bg-gradient-to-r ${config.color} rounded-full`}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {level === 'Expert' ? 'وصلت أعلى مستوى! استمر في الكتابة 🏆' : `${Math.round(100 - progress)}% للوصول للمستوى التالي`}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
