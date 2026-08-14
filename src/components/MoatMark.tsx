import React from 'react';

/**
 * InvestMoat brand mark — three bars in an M: tall, short, tall.
 * Fill-based, inherits `currentColor`, stamps cleanly at 16px.
 */
export function MoatMark({
  className,
}: {
  className?: string;
  /** Kept for call-site compatibility; the mark is fill-only. */
  strokeWidth?: number;
}) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <rect x="4.95" y="3.8" width="3.7" height="16.2" rx="0.5" />
      <rect x="10.15" y="9.2" width="3.7" height="10.8" rx="0.5" />
      <rect x="15.35" y="3.8" width="3.7" height="16.2" rx="0.5" />
    </svg>
  );
}
