import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, CheckCircle, Lightbulb, BookOpen, ArrowRight, Languages } from 'lucide-react';
import { useT } from '@/lib/i18n';
import logo from '@/assets/logo.png';

interface OnboardingScreenProps {
  onComplete: () => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const { t, lang, setLang, dir } = useT();
  const [step, setStep] = useState<'lang' | 'intro' | 'slides'>(() =>
    localStorage.getItem('ynote-lang-picked') === '1' ? 'intro' : 'lang'
  );
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    { icon: Brain, title: t('onb.s1.title'), subtitle: t('onb.s1.sub'), description: t('onb.s1.desc'), gradient: 'from-primary to-accent' },
    { icon: Sparkles, title: t('onb.s2.title'), subtitle: t('onb.s2.sub'), description: t('onb.s2.desc'), gradient: 'from-accent to-primary' },
    { icon: CheckCircle, title: t('onb.s3.title'), subtitle: t('onb.s3.sub'), description: t('onb.s3.desc'), gradient: 'from-primary to-success' },
    { icon: Lightbulb, title: t('onb.s4.title'), subtitle: t('onb.s4.sub'), description: t('onb.s4.desc'), gradient: 'from-warning to-accent' },
    { icon: BookOpen, title: t('onb.s5.title'), subtitle: t('onb.s5.sub'), description: t('onb.s5.desc'), gradient: 'from-primary to-accent' },
  ];

  const handlePickLang = (l: 'ar' | 'en') => {
    setLang(l);
    localStorage.setItem('ynote-lang-picked', '1');
    setStep('intro');
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) setCurrentSlide(currentSlide + 1);
    else onComplete();
  };

  const handleSkip = () => onComplete();

  return (
    <div className="fixed inset-0 bg-background overflow-y-auto" dir={dir}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-glow animate-float-delayed" />
      </div>

      <AnimatePresence mode="wait">
        {step === 'lang' ? (
          <motion.div
            key="lang"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.4 }}
            className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-10"
          >
            <div className="w-20 h-20 mb-6 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow">
              <Languages className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-3 gradient-text text-center">
              اختر لغتك / Choose your language
            </h1>
            <p className="text-base md:text-lg text-muted-foreground mb-10 text-center max-w-md">
              {t('onb.pickLangSub')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => handlePickLang('ar')} className={`flex-1 glass-hover rounded-2xl p-6 text-center border-2 transition-colors ${lang === 'ar' ? 'border-primary' : 'border-transparent'}`}>
                <div className="text-3xl mb-2">🇸🇦</div>
                <div className="text-xl font-bold">العربية</div>
                <div className="text-sm text-muted-foreground mt-1">من اليمين لليسار</div>
              </motion.button>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => handlePickLang('en')} className={`flex-1 glass-hover rounded-2xl p-6 text-center border-2 transition-colors ${lang === 'en' ? 'border-primary' : 'border-transparent'}`}>
                <div className="text-3xl mb-2">🇬🇧</div>
                <div className="text-xl font-bold">English</div>
                <div className="text-sm text-muted-foreground mt-1">Left to right</div>
              </motion.button>
            </div>
          </motion.div>
        ) : step === 'intro' ? (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-10"
          >
            <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ duration: 0.8, type: 'spring', stiffness: 200 }} className="relative mb-8">
              <img src={logo} alt="P-Note" className="w-28 h-28 rounded-3xl glow object-contain" />
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }} className="text-3xl md:text-5xl font-bold gradient-text mb-4 text-center">
              {t('onb.heroTitle')}
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.5 }} className="text-lg md:text-2xl text-muted-foreground mb-10 text-center">
              {t('onb.tagline')}
            </motion.p>

            <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.5 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} onClick={() => setStep('slides')} className="btn-primary flex items-center gap-3 text-lg">
              {t('onb.discover')}
              <ArrowRight className={`w-5 h-5 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="slides"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative z-10 flex flex-col min-h-screen px-6 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
          >
            <div className="flex justify-end">
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={handleSkip} className="text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg">
                {t('onb.skip')}
              </motion.button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto py-6">
              <AnimatePresence mode="wait">
                <motion.div key={currentSlide} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.4 }} className="text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: 'spring', stiffness: 200 }} className={`w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br ${slides[currentSlide].gradient} flex items-center justify-center glow`}>
                    {(() => {
                      const Icon = slides[currentSlide].icon;
                      return <Icon className="w-10 h-10 text-primary-foreground" />;
                    })()}
                  </motion.div>
                  <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-3xl md:text-5xl font-bold mb-4 gradient-text">
                    {slides[currentSlide].title}
                  </motion.h2>
                  <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-lg md:text-xl text-primary mb-6">
                    {slides[currentSlide].subtitle}
                  </motion.p>
                  <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-base md:text-lg text-muted-foreground leading-relaxed">
                    {slides[currentSlide].description}
                  </motion.p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex flex-col items-center gap-5 mt-auto">
              <div className="flex gap-2">
                {slides.map((slide, index) => (
                  <motion.button key={index} onClick={() => setCurrentSlide(index)} aria-label={`Go to slide ${index + 1}: ${slide.title}`} className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-8 bg-primary' : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'}`} whileHover={{ scale: 1.2 }} />
                ))}
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleNext} className="btn-primary flex items-center gap-3 min-w-[220px] justify-center">
                {currentSlide === slides.length - 1 ? t('onb.getStarted') : t('onb.continue')}
                <ArrowRight className={`w-5 h-5 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
