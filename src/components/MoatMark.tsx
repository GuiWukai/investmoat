import React from 'react';

/**
 * InvestMoat brand mark — a fortified shield ringed by a moat around a
 * protected core. Stroke-based so it scales cleanly and inherits `currentColor`.
 */
export function MoatMark({
  className,
  strokeWidth = 1.7,
}: {
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      {/* Outer wall */}
      <path
        d="M12 2.4 L20.6 5.5 V12.3 C20.6 16.9 16.9 20 12 22 C7.1 20 3.4 16.9 3.4 12.3 V5.5 Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      {/* Inner keep — the gap to the outer wall reads as the moat */}
      <path
        d="M12 7.1 L16.3 8.7 V12.3 C16.3 14.8 14.5 16.6 12 17.7 C9.5 16.6 7.7 14.8 7.7 12.3 V8.7 Z"
        stroke="currentColor"
        strokeWidth={strokeWidth * 0.82}
        strokeLinejoin="round"
      />
      {/* Protected core asset */}
      <circle cx="12" cy="12.2" r="1.5" fill="currentColor" />
    </svg>
  );
}
