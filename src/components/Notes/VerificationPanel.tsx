import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { VerificationResult } from '@/hooks/useVerifyNote';

interface VerificationPanelProps {
  result: VerificationResult | null;
  isLoading: boolean;
}

export function VerificationPanel({ result, isLoading }: VerificationPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-4 mb-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">AI is verifying your note...</p>
            <p className="text-xs text-muted-foreground">Checking accuracy and preparing knowledge expansion</p>
          </div>
          <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </motion.div>
    );
  }

  if (!result) return null;

  const getStatusIcon = () => {
    switch (result.verificationStatus) {
      case 'correct':
        return <CheckCircle2 className="w-5 h-5 text-[hsl(var(--success))]" />;
      case 'partially_correct':
        return <AlertTriangle className="w-5 h-5 text-[hsl(var(--warning))]" />;
      case 'needs_correction':
        return <XCircle className="w-5 h-5 text-destructive" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-[hsl(var(--success))]" />;
    }
  };

  const getStatusColor = () => {
    switch (result.verificationStatus) {
      case 'correct':
        return 'from-[hsl(var(--success)/0.2)] to-[hsl(var(--success)/0.05)] border-[hsl(var(--success)/0.3)]';
      case 'partially_correct':
        return 'from-[hsl(var(--warning)/0.2)] to-[hsl(var(--warning)/0.05)] border-[hsl(var(--warning)/0.3)]';
      case 'needs_correction':
        return 'from-destructive/20 to-destructive/5 border-destructive/30';
      default:
        return 'from-[hsl(var(--success)/0.2)] to-[hsl(var(--success)/0.05)] border-[hsl(var(--success)/0.3)]';
    }
  };

  const getStatusLabel = () => {
    switch (result.verificationStatus) {
      case 'correct':
        return 'Verified Correct';
      case 'partially_correct':
        return 'Partially Correct';
      case 'needs_correction':
        return 'Needs Correction';
      default:
        return 'Verified';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border bg-gradient-to-br ${getStatusColor()} mb-4 overflow-hidden`}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center gap-3 hover:bg-white/5 transition-colors"
      >
        <div className="w-8 h-8 rounded-lg bg-background/50 flex items-center justify-center">
          {getStatusIcon()}
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-medium">{getStatusLabel()}</p>
          <p className="text-xs text-muted-foreground">{result.encouragement}</p>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && result.hasIssues && result.issues.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/10"
          >
            <div className="p-4 space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Areas to Review
              </p>
              {result.issues.map((issue, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass rounded-lg p-3 space-y-2"
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-[hsl(var(--warning))] mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-muted-foreground line-through">
                        {issue.original}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 pl-6">
                    <CheckCircle2 className="w-4 h-4 text-[hsl(var(--success))] mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{issue.correction}</p>
                      <p className="text-xs text-muted-foreground mt-1">{issue.explanation}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
