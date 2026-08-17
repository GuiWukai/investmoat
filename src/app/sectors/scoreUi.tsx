export function scoreColor(score: number) {
  if (score >= 90) return '#10b981';
  if (score >= 80) return '#3b82f6';
  if (score >= 70) return '#f59e0b';
  return '#ef4444';
}

export function ScorePill({ value }: { value: number }) {
  const color = scoreColor(value);
  return (
    <span
      className="inline-flex h-7 w-9 items-center justify-center rounded-lg text-xs font-black tabular-nums"
      style={{ color, background: `${color}18`, border: `1px solid ${color}30` }}
    >
      {value}
    </span>
  );
}

export function SubScore({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex min-w-[40px] flex-col items-center gap-0.5">
      <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/25">
        {label}
      </span>
      <span className="text-sm font-bold tabular-nums" style={{ color: scoreColor(value) }}>
        {value}
      </span>
    </div>
  );
}
