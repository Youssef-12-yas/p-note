import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, FolderOpen, Sparkles, User, Settings, PartyPopper, ArrowRight, ArrowLeft, X } from 'lucide-react';
import { useT } from '@/lib/i18n';

// Bump this whenever you ship new features you want existing users to see.
export const TOUR_VERSION = 'v1';
const STORAGE_KEY = 'pnote-tour-version';

export function shouldShowTour() {
  return localStorage.getItem(STORAGE_KEY) !== TOUR_VERSION;
}

export function markTourSeen() {
  localStorage.setItem(STORAGE_KEY, TOUR_VERSION);
}

interface Step {
  icon: React.ComponentType<{ className?: string }>;
  titleKey: string;
  descKey: string;
  path?: string;
  gradient: string;
}

const steps: Step[] = [
  { icon: PartyPopper, titleKey: 'tour.welcome.title', descKey: 'tour.welcome.desc', gradient: 'from-primary to-accent' },
  { icon: Home, titleKey: 'tour.dashboard.title', descKey: 'tour.dashboard.desc', path: '/dashboard', gradient: 'from-primary to-accent' },
  { icon: FolderOpen, titleKey: 'tour.groups.title', descKey: 'tour.groups.desc', path: '/groups', gradient: 'from-accent to-primary' },
  { icon: Sparkles, titleKey: 'tour.ai.title', descKey: 'tour.ai.desc', path: '/ai-review', gradient: 'from-warning to-accent' },
  { icon: User, titleKey: 'tour.profile.title', descKey: 'tour.profile.desc', path: '/profile', gradient: 'from-primary to-success' },
  { icon: Settings, titleKey: 'tour.settings.title', descKey: 'tour.settings.desc', path: '/settings', gradient: 'from-accent to-primary' },
  { icon: PartyPopper, titleKey: 'tour.finish.title', descKey: 'tour.finish.desc', gradient: 'from-primary to-accent' },
];

export function ProductTour({ onClose }: { onClose: () => void }) {
  const { t, dir } = useT();
  const navigate = useNavigate();
  const [i, setI] = useState(0);

  const step = steps[i];
  const Icon = step.icon;
  const isLast = i === steps.length - 1;

  useEffect(() => {
    if (step.path) navigate(step.path);
  }, [i, step.path, navigate]);

  const next = () => (isLast ? finish() : setI(i + 1));
  const back = () => setI(Math.max(0, i - 1));
  const finish = () => {
    markTourSeen();
    onClose();
  };

  const ArrowFwd = dir === 'rtl' ? ArrowLeft : ArrowRight;
  const ArrowBwd = dir === 'rtl' ? ArrowRight : ArrowLeft;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 pointer-events-none" dir={dir}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-background/70 backdrop-blur-sm pointer-events-auto"
        onClick={finish}
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="relative pointer-events-auto w-full max-w-md glass border border-border/60 rounded-3xl p-6 shadow-2xl"
        >
          <button onClick={finish} className="absolute top-3 end-3 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" aria-label={t('tour.skip')}>
            <X className="w-4 h-4" />
          </button>

          <div className={`w-14 h-14 mb-4 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center glow`}>
            <Icon className="w-7 h-7 text-primary-foreground" />
          </div>

          <h3 className="text-2xl font-bold mb-2">{t(step.titleKey as any)}</h3>
          <p className="text-muted-foreground leading-relaxed mb-6">{t(step.descKey as any)}</p>

          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-1.5">
              {steps.map((_, idx) => (
                <span key={idx} className={`h-1.5 rounded-full transition-all ${idx === i ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/30'}`} />
              ))}
            </div>
            <div className="flex items-center gap-2">
              {i > 0 && (
                <button onClick={back} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors" aria-label={t('tour.back')}>
                  <ArrowBwd className="w-4 h-4" />
                </button>
              )}
              <button onClick={next} className="btn-primary flex items-center gap-2 px-5 py-2.5">
                {isLast ? t('tour.done') : t('tour.next')}
                {!isLast && <ArrowFwd className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
