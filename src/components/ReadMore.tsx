'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

const CLAMP: Record<1 | 2 | 3 | 4, string> = {
  1: 'line-clamp-1',
  2: 'line-clamp-2',
  3: 'line-clamp-3',
  4: 'line-clamp-4',
};

/**
 * Collapse overflowing copy and reveal the rest with Read more / Read less.
 * The toggle is omitted when the text already fits.
 */
export function ReadMore({
  text,
  lines = 2,
  className = '',
  extra,
}: {
  text: string;
  lines?: 1 | 2 | 3 | 4;
  className?: string;
  /** Optional meta (ticker, badge) rendered on the same row as the toggle. */
  extra?: ReactNode;
}) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const singleLine = lines === 1;

  useEffect(() => {
    setExpanded(false);
    setOverflows(false);
  }, [text, lines]);

  useEffect(() => {
    const el = textRef.current;
    if (!el || expanded) return;

    const measure = () => {
      // Sub-pixel rounding routinely reports 1–2px of fake overflow on
      // labels that already fit, which would show a no-op Read more.
      const over = singleLine
        ? el.scrollWidth - el.clientWidth > 8
        : el.scrollHeight - el.clientHeight > 4;
      setOverflows(over);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    void document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, [text, lines, expanded, singleLine]);

  if (!text) return null;

  const showBar = extra != null || overflows;

  return (
    <div className="min-w-0">
      <p
        ref={textRef}
        className={`${className} ${
          expanded ? '' : singleLine ? 'truncate' : CLAMP[lines]
        }`}
      >
        {text}
      </p>
      {showBar && (
        <div className="mt-0.5 flex min-w-0 flex-nowrap items-center gap-1.5">
          {extra != null && <div className="min-w-0 truncate">{extra}</div>}
          {overflows && (
            <button
              type="button"
              aria-expanded={expanded}
              className={`shrink-0 text-[10px] font-bold text-gold-bright hover:text-gold-bright/80 transition-colors ${
                extra != null ? 'ml-auto' : ''
              }`}
              onClick={(event) => {
                event.stopPropagation();
                event.preventDefault();
                setExpanded((open) => !open);
              }}
            >
              {expanded ? 'Read less' : 'Read more'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
