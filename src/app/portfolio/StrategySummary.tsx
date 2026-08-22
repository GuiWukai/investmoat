import type { ReactNode } from "react";
import { ShieldCheck, TrendingDown, TrendingUp } from "lucide-react";
import { Card, Spinner } from "@heroui/react";

const BEAR = "#fb7185";
const BASE = "#60a5fa";
const BULL = "#34d399";

function signedPct(value: number, digits: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(digits)}%`;
}

function pctTone(value: number) {
  return value >= 0 ? "text-emerald-400" : "text-rose-400";
}

function GateChip({ children }: { children: ReactNode }) {
  return (
    <span className="shrink-0 rounded-full border border-border bg-foreground/[0.03] px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground/50">
      {children}
    </span>
  );
}

function KpiCell({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex h-full min-w-0 flex-col justify-center gap-1.5 px-5 py-5 sm:px-6 sm:py-6">
      <div className="text-[32px] font-semibold leading-none tracking-tight tabular-nums sm:text-[36px]">
        {children}
      </div>
      <span className="text-[13px] leading-snug text-foreground/40">{label}</span>
      {hint ? (
        <span className="text-[11px] leading-snug text-foreground/25">{hint}</span>
      ) : null}
    </div>
  );
}

function ReturnRange({
  bear,
  base,
  bull,
}: {
  bear: number;
  base: number;
  bull: number;
}) {
  const lo = Math.min(bear, base, bull);
  const hi = Math.max(bear, base, bull);
  const span = hi - lo || 1;
  const pct = (v: number) => Math.max(0, Math.min(100, ((v - lo) / span) * 100));
  const bearPct = pct(bear);
  const basePct = pct(base);
  const bullPct = pct(bull);
  const crossesZero = lo < 0 && hi > 0;

  return (
    <div className="relative mx-1 mt-4 h-3" aria-hidden>
      <div
        className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full"
        style={{
          background: `linear-gradient(to right,
            rgba(251,113,133,0.22) 0%,
            rgba(251,113,133,0.55) ${bearPct}%,
            rgba(96,165,250,0.55) ${basePct}%,
            rgba(52,211,153,0.55) ${bullPct}%,
            rgba(52,211,153,0.22) 100%)`,
        }}
      />
      {crossesZero && (
        <div
          className="absolute top-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2 bg-foreground/28"
          style={{ left: `${pct(0)}%` }}
        />
      )}
      {(
        [
          { key: "bear", value: bear, color: BEAR, size: 9 },
          { key: "base", value: base, color: BASE, size: 13 },
          { key: "bull", value: bull, color: BULL, size: 9 },
        ] as const
      ).map((m) => (
        <div
          key={m.key}
          className="absolute top-1/2 rounded-full"
          style={{
            left: `${pct(m.value)}%`,
            width: m.size,
            height: m.size,
            background: m.color,
            transform: "translate(-50%, -50%)",
            boxShadow:
              m.key === "base"
                ? `0 0 0 3px rgba(8,10,14,0.92), 0 0 10px ${m.color}66`
                : `0 0 0 2px rgba(8,10,14,0.85)`,
          }}
        />
      ))}
    </div>
  );
}

export function StrategySummary({
  positions,
  maxPositions,
  compositeFloor,
  moatFloor,
  maxWeightPct,
  today,
  pricesLoaded,
  scenario,
}: {
  positions: number;
  maxPositions: number;
  compositeFloor: number;
  moatFloor: number;
  maxWeightPct: number;
  today: number | null;
  pricesLoaded: boolean;
  scenario: { bear: number | null; base: number | null; bull: number | null };
}) {
  const slotsOpen = Math.max(0, maxPositions - positions);
  const todayText =
    !pricesLoaded || today == null
      ? "unavailable"
      : signedPct(today, 2);
  const scenarioText = (value: number | null) =>
    value == null ? "unavailable" : signedPct(value, 1);

  const summary = [
    `${positions} of ${maxPositions} positions`,
    `composite at least ${compositeFloor}`,
    `moat at least ${moatFloor}`,
    `today ${todayText}`,
    `estimated one-year return bear ${scenarioText(scenario.bear)}, base ${scenarioText(scenario.base)}, bull ${scenarioText(scenario.bull)}`,
  ].join(". ");

  const { bear, base, bull } = scenario;
  const rangeReady =
    pricesLoaded && bear != null && base != null && bull != null;

  return (
    <Card
      aria-label={`Strategy summary. ${summary}.`}
      className="gap-0 overflow-hidden p-0"
    >
      <div className="flex min-w-0 flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-2.5 min-w-0">
          <ShieldCheck size={16} className="text-accent shrink-0" />
          <h3 className="font-bold text-foreground/85">Strategy Summary</h3>
        </div>
        <div className="flex min-w-0 max-w-full flex-wrap gap-1.5 sm:justify-end">
          <GateChip>
            {positions} of {maxPositions}
            {slotsOpen > 0 ? ` · ${slotsOpen} open` : ""}
          </GateChip>
          <GateChip>Composite ≥ {compositeFloor}</GateChip>
          <GateChip>Moat ≥ {moatFloor}</GateChip>
          <GateChip>Max {maxWeightPct}%</GateChip>
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(11rem,0.38fr)_minmax(0,1fr)]">
        <KpiCell label="Today" hint="Score-weighted 1-day">
          {!pricesLoaded ? (
            <Spinner size="sm" color="current" />
          ) : today == null ? (
            <span className="text-foreground/20">—</span>
          ) : (
            <span className={`inline-flex items-center gap-1.5 whitespace-nowrap ${pctTone(today)}`}>
              {today >= 0 ? (
                <TrendingUp size={18} strokeWidth={2.4} className="shrink-0" />
              ) : (
                <TrendingDown size={18} strokeWidth={2.4} className="shrink-0" />
              )}
              {signedPct(today, 2)}
            </span>
          )}
        </KpiCell>

        <div className="flex flex-col justify-center border-t border-border px-5 py-5 sm:px-6 sm:py-6 lg:border-t-0 lg:border-l">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <p className="section-label mb-0">Est. 1-year return</p>
            <p className="text-[11px] text-foreground/28">Score-weighted vs live price</p>
          </div>

          {!pricesLoaded ? (
            <Spinner size="sm" color="current" />
          ) : !rangeReady ? (
            <p className="text-[32px] font-semibold leading-none tracking-tight text-foreground/20">
              —
            </p>
          ) : (
            <>
              <p className={`text-[32px] font-semibold leading-none tracking-tight tabular-nums sm:text-[36px] ${pctTone(base!)}`}>
                {signedPct(base!, 1)}
              </p>
              <p className="mt-2 text-[13px] text-foreground/40">Base case</p>
              <ReturnRange bear={bear!} base={base!} bull={bull!} />
              <div className="mt-3 mx-1 flex items-start justify-between gap-4">
                <div>
                  <p className={`text-sm font-semibold tabular-nums ${pctTone(bear!)}`}>
                    {signedPct(bear!, 1)}
                  </p>
                  <p className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-foreground/28">
                    Bear
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold tabular-nums ${pctTone(bull!)}`}>
                    {signedPct(bull!, 1)}
                  </p>
                  <p className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-foreground/28">
                    Bull
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
