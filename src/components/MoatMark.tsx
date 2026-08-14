import React from 'react';

/**
 * InvestMoat brand mark — a circular moat around three rising bars.
 * Stroke + fill, inherits `currentColor`, stamps cleanly at 16px.
 */
export function MoatMark({
  className,
  strokeWidth = 2,
}: {
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <circle
        cx="12"
        cy="12"
        r="8.7"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
      />
      <rect x="7.35" y="11.3" width="2.45" height="5.15" rx="0.35" />
      <rect x="10.775" y="8.45" width="2.45" height="8" rx="0.35" />
      <rect x="14.2" y="5.55" width="2.45" height="10.9" rx="0.35" />
    </svg>
  );
}
