import { motion } from 'framer-motion';
import { Brain, CheckCircle2, AlertCircle, Lightbulb, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { useLatestSnapshot, useAnalyzeProgress } from '@/hooks/useProgressAnalysis';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

export function AIAnalysisCard() {
  const { data: snapshot, isLoading } = useLatestSnapshot();
  const analyze = useAnalyzeProgress();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-5 sm:p-6 ai-note-container"
    >
      <div className="flex items-start justify-between gap-3 mb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
            <Brain className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              تحليلك الذكي <Sparkles className="w-4 h-4 text-primary" />
            </h3>
            {snapshot && (
              <p className="text-xs text-muted-foreground">
                آخر تحليل: {formatDistanceToNow(new Date(snapshot.created_at), { addSuffix: true, locale: ar })}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => analyze.mutate()}
          disabled={analyze.isPending}
          className="btn-secondary text-sm flex items-center gap-2 px-4 py-2"
        >
          {analyze.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          {snapshot ? 'تحديث' : 'تحليل'}
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : !snapshot ? (
        <div className="text-center py-8 text-muted-foreground">
          <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="mb-2 font-medium text-foreground">لم يُجرَ تحليل بعد</p>
          <p className="text-sm">اضغط "تحليل" ليحلّل الذكاء الاصطناعي ملاحظاتك ويحدد مستواك بدقة.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {snapshot.summary && (
            <p className="text-foreground/90 leading-relaxed text-sm sm:text-base">{snapshot.summary}</p>
          )}

          {snapshot.strengths?.length > 0 && (
            <Section icon={CheckCircle2} color="text-emerald-400" title="نقاط قوتك" items={snapshot.strengths} />
          )}
          {snapshot.weaknesses?.length > 0 && (
            <Section icon={AlertCircle} color="text-amber-400" title="مجالات للتحسين" items={snapshot.weaknesses} />
          )}
          {snapshot.recommendations?.length > 0 && (
            <Section icon={Lightbulb} color="text-primary" title="توصيات" items={snapshot.recommendations} />
          )}
        </div>
      )}
    </motion.div>
  );
}

function Section({
  icon: Icon,
  color,
  title,
  items,
}: {
  icon: any;
  color: string;
  title: string;
  items: string[];
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <h4 className="font-semibold text-sm">{title}</h4>
      </div>
      <ul className="space-y-1.5 pr-6">
        {items.map((it, i) => (
          <li key={i} className="text-sm text-foreground/80 list-disc">
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}
