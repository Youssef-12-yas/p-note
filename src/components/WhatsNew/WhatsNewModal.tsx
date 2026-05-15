import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useT } from '@/lib/i18n';

// Bump this version when you ship new noteworthy features.
export const WHATS_NEW_VERSION = 'v2';
const STORAGE_KEY = 'pnote-whatsnew-version';

interface Item {
  emoji: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
}

const ITEMS: Item[] = [
  {
    emoji: '📱',
    titleAr: 'تطبيق أندرويد أصلي',
    titleEn: 'Native Android app',
    descAr: 'يمكنك الآن تثبيت P-Note كتطبيق APK حقيقي على هاتفك.',
    descEn: 'You can now install P-Note as a real native Android APK.',
  },
  {
    emoji: '✍️',
    titleAr: 'محرر كتابة جديد',
    titleEn: 'Brand-new editor',
    descAr: 'كتابة مرئية مباشرة بدون رموز Markdown ظاهرة.',
    descEn: 'WYSIWYG writing — no visible markdown symbols while you type.',
  },
  {
    emoji: '🔔',
    titleAr: 'إشعارات فورية',
    titleEn: 'Push notifications',
    descAr: 'استقبل تنبيهًا عند انتهاء أي تحليل أو إضافة جديدة.',
    descEn: 'Get a ping when an analysis finishes or something new arrives.',
  },
  {
    emoji: '⚡',
    titleAr: 'يعمل بدون إنترنت (PWA)',
    titleEn: 'Installable PWA',
    descAr: 'ثبّت الموقع على شاشتك الرئيسية مثل أي تطبيق.',
    descEn: 'Install the site to your home screen like any app.',
  },
];

export function shouldShowWhatsNew() {
  return localStorage.getItem(STORAGE_KEY) !== WHATS_NEW_VERSION;
}

export function markWhatsNewSeen() {
  localStorage.setItem(STORAGE_KEY, WHATS_NEW_VERSION);
}

export function WhatsNewModal({ onClose }: { onClose: () => void }) {
  const { lang, dir } = useT();
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && finish();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finish = () => {
    markWhatsNewSeen();
    setOpen(false);
    setTimeout(onClose, 200);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4" dir={dir}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/70 backdrop-blur-md"
            onClick={finish}
          />
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="relative w-full max-w-lg glass border border-border/60 rounded-3xl p-6 shadow-2xl"
          >
            <button
              onClick={finish}
              className="absolute top-3 end-3 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">
                  {lang === 'ar' ? 'ما الجديد؟' : "What's new"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {lang === 'ar' ? 'تحديثات هذا الإصدار' : 'Highlights of this release'}
                </p>
              </div>
            </div>

            <ul className="space-y-3 max-h-[55vh] overflow-auto pr-1">
              {ITEMS.map((it) => (
                <li key={it.titleEn} className="flex gap-3 p-3 rounded-xl bg-secondary/40">
                  <span className="text-2xl leading-none">{it.emoji}</span>
                  <div className="min-w-0">
                    <p className="font-semibold">{lang === 'ar' ? it.titleAr : it.titleEn}</p>
                    <p className="text-sm text-muted-foreground">{lang === 'ar' ? it.descAr : it.descEn}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex justify-end">
              <button onClick={finish} className="btn-primary px-5 py-2.5">
                {lang === 'ar' ? 'رائع!' : 'Got it'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
