import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface ProgressChartProps {
  data: { day: string; count: number }[];
}

export function ProgressChart({ data }: ProgressChartProps) {
  // Build full 30-day series, fill missing with 0
  const today = new Date();
  const map = new Map(data.map((d) => [d.day, d.count]));
  const series = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (29 - i));
    const key = d.toISOString().slice(0, 10);
    return {
      day: key,
      label: d.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' }),
      count: map.get(key) || 0,
    };
  });

  const total = series.reduce((s, d) => s + d.count, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-4 sm:p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">نشاطك آخر 30 يوم</h3>
        </div>
        <span className="text-sm text-muted-foreground">{total} ملاحظة</span>
      </div>
      <div className="h-48 sm:h-56 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="label" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} interval={5} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} axisLine={false} tickLine={false} width={28} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.75rem',
                fontSize: '12px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#chartFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
