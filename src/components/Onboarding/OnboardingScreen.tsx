import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, CheckCircle, Lightbulb, BookOpen, ArrowRight, Languages } from 'lucide-react';
import { useT } from '@/lib/i18n';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const slides = [
  {
    icon: Brain,
    title: "Think Deeper",
    subtitle: "Your ideas deserve intelligence",
    description: "P-Note is your AI-powered thinking companion that helps you organize, validate, and expand your knowledge.",
    gradient: "from-primary to-accent",
  },
  {
    icon: Sparkles,
    title: "AI Understands",
    subtitle: "More than just notes",
    description: "Our AI reads and comprehends your content, detecting patterns, connections, and opportunities for improvement.",
    gradient: "from-accent to-primary",
  },
  {
    icon: CheckCircle,
    title: "AI Reviews",
    subtitle: "Your personal mentor",
    description: "Get instant feedback on your ideas. The AI validates concepts, fixes errors, and suggests enhancements.",
    gradient: "from-primary to-success",
  },
  {
    icon: Lightbulb,
    title: "AI Expands",
    subtitle: "Grow your understanding",
    description: "Discover related concepts, better explanations, and resources you never knew existed.",
    gradient: "from-warning to-accent",
  },
  {
    icon: BookOpen,
    title: "Start Learning",
    subtitle: "Ready to think smarter?",
    description: "Join thousands of learners who are already transforming how they think and learn.",
    gradient: "from-primary to-accent",
  },
];

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const { t, lang, setLang, dir } = useT();
  const [step, setStep] = useState<'lang' | 'intro' | 'slides'>(() =>
    localStorage.getItem('ynote-lang-picked') === '1' ? 'intro' : 'lang'
  );
  const [currentSlide, setCurrentSlide] = useState(0);

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
    <div className="fixed inset-0 bg-background overflow-hidden" dir={dir}>
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-glow animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-primary/5 to-accent/5 rounded-full blur-3xl" />
      </div>

      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      <AnimatePresence mode="wait">
        {step === 'lang' ? (
          <motion.div
            key="lang"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.4 }}
            className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6"
          >
            <div className="w-20 h-20 mb-6 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow">
              <Languages className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-3 gradient-text text-center">
              {t('onb.pickLang')} / Choose your language
            </h1>
            <p className="text-base md:text-lg text-muted-foreground mb-10 text-center max-w-md">
              {t('onb.pickLangSub')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handlePickLang('ar')}
                className={`flex-1 glass-hover rounded-2xl p-6 text-center border-2 transition-colors ${lang === 'ar' ? 'border-primary' : 'border-transparent'}`}
              >
                <div className="text-3xl mb-2">🇸🇦</div>
                <div className="text-xl font-bold">العربية</div>
                <div className="text-sm text-muted-foreground mt-1">من اليمين لليسار</div>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handlePickLang('en')}
                className={`flex-1 glass-hover rounded-2xl p-6 text-center border-2 transition-colors ${lang === 'en' ? 'border-primary' : 'border-transparent'}`}
              >
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
            className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6"
          >
            {/* Logo animation */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, type: "spring", stiffness: 200 }}
              className="relative mb-8"
            >
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow">
                <Brain className="w-12 h-12 text-primary-foreground" />
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent flex items-center justify-center"
              >
                <Sparkles className="w-4 h-4 text-accent-foreground" />
              </motion.div>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-5xl md:text-7xl font-bold gradient-text mb-4"
            >
              P-Note — AI-powered thinking companion
            </motion.h1>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="text-xl md:text-2xl text-muted-foreground mb-12 text-center"
            >
              Think smarter. Write deeper.
            </motion.p>

            {/* CTA */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowIntro(false)}
              className="btn-primary flex items-center gap-3 text-lg"
            >
              Discover the future
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="slides"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative z-10 flex flex-col min-h-screen px-6 py-12"
          >
            {/* Skip button */}
            <div className="flex justify-end">
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleSkip}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip
              </motion.button>
            </div>

            {/* Slide content */}
            <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4 }}
                  className="text-center"
                >
                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                    className={`w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br ${slides[currentSlide].gradient} flex items-center justify-center glow`}
                  >
                    {(() => {
                      const Icon = slides[currentSlide].icon;
                      return <Icon className="w-10 h-10 text-primary-foreground" />;
                    })()}
                  </motion.div>

                  {/* Title */}
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl md:text-5xl font-bold mb-4 gradient-text"
                  >
                    {slides[currentSlide].title}
                  </motion.h2>

                  {/* Subtitle */}
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-xl text-primary mb-6"
                  >
                    {slides[currentSlide].subtitle}
                  </motion.p>

                  {/* Description */}
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-lg text-muted-foreground leading-relaxed"
                  >
                    {slides[currentSlide].description}
                  </motion.p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Progress and navigation */}
            <div className="flex flex-col items-center gap-8">
              {/* Progress dots */}
              <div className="flex gap-2">
                {slides.map((slide, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    aria-label={`Go to slide ${index + 1}: ${slide.title}`}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentSlide 
                        ? 'w-8 bg-primary' 
                        : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                    }`}
                    whileHover={{ scale: 1.2 }}
                  />
                ))}
              </div>

              {/* Next button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNext}
                className="btn-primary flex items-center gap-3 min-w-[200px] justify-center"
              >
                {currentSlide === slides.length - 1 ? 'Get Started' : 'Continue'}
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}