import React from 'react';

/**
 * InvestMoat brand mark — a keep standing in a circular moat, with three
 * rising crenellated towers that read as both a fortress and a growth chart.
 * The disc cut out of the keep is the protected core (capital). Fill-based
 * so it stamps cleanly at small sizes and inherits `currentColor`.
 */
export function MoatMark({
  className,
}: {
  className?: string;
  /** Kept for call-site compatibility; the filled mark does not stroke. */
  strokeWidth?: number;
}) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      {/* Moat — thick elliptical water ring around the keep */}
      <path
        fillRule="evenodd"
        d="M12 13.4a9.65 3.9 0 1 0 .02 0Zm0 1.55a6.5 2.15 0 1 0 .02 0Z"
      />
      {/* Keep — three rising towers with merlons; circular core is a cutout */}
      <path
        fillRule="evenodd"
        d="M7.2 16.3V11.4h.5V9.15h2.25V11.4H10.4V8.15h.55V5.85h2.35V8.15H13.8V5.35h.6V3.05h2.5V5.35h.55V16.3H7.2Zm3.75-2.75a1.35 1.35 0 1 0 2.7 0 1.35 1.35 0 1 0-2.7 0Z"
      />
    </svg>
  );
}
