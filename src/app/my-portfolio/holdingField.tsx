'use client';

import { useEffect, useState } from 'react';

export function parsePositiveNumber(raw: string): number | null {
  const trimmed = raw.trim().replace(/,/g, '');
  if (!trimmed) return null;
  const n = Number(trimmed);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

const FIELD_INPUT_CLASS =
  'w-full rounded-lg border border-border bg-foreground/[0.03] px-2.5 py-1.5 font-mono text-xs tabular-nums text-foreground outline-none transition-colors placeholder:text-foreground/25 focus:border-accent/40 focus:bg-foreground/[0.05] md:rounded-xl md:px-3 md:py-2 md:text-sm';

/** Local draft input that commits a positive number (or clear) on blur. */
export function HoldingNumberField({
  'aria-label': ariaLabel,
  allowEmpty = false,
  className = '',
  onCommit,
  placeholder,
  value,
}: {
  'aria-label': string;
  allowEmpty?: boolean;
  className?: string;
  onCommit: (next: number | undefined) => void;
  placeholder?: string;
  value: number | undefined;
}) {
  const [draft, setDraft] = useState(value != null ? String(value) : '');

  useEffect(() => {
    setDraft(value != null ? String(value) : '');
  }, [value]);

  return (
    <input
      aria-label={ariaLabel}
      className={`${FIELD_INPUT_CLASS} ${className}`}
      inputMode="decimal"
      onBlur={() => {
        const raw = draft.trim();
        if (!raw) {
          if (allowEmpty) {
            onCommit(undefined);
            setDraft('');
          } else {
            setDraft(value != null ? String(value) : '');
          }
          return;
        }
        const n = parsePositiveNumber(raw);
        if (n == null) {
          setDraft(value != null ? String(value) : '');
          return;
        }
        onCommit(n);
        setDraft(String(n));
      }}
      onChange={(e) => setDraft(e.target.value)}
      placeholder={placeholder}
      value={draft}
    />
  );
}
