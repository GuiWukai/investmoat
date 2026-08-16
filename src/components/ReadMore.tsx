'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

const CLAMP: Record<1 | 2 | 3 | 4, string> = {
  1: 'line-clamp-1',
  2: 'line-clamp-2',
  3: 'line-clamp-3',
  4: 'line-clamp-4',
};

/**
 * Collapse overflowing copy to a fixed number of lines and reveal the rest
 * with a Read more / Read less control. The toggle is omitted when the text
 * already fits, so short labels stay quiet.
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

  useEffect(() => {
    setExpanded(false);
    setOverflows(false);
  }, [text, lines]);

  useEffect(() => {
    const el = textRef.current;
    if (!el || expanded) return;

    const measure = () => {
      if (el.scrollHeight > el.clientHeight + 1) setOverflows(true);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text, lines, expanded]);

  if (!text) return null;

  const showBar = extra != null || overflows;

  return (
    <div className="min-w-0">
      <p
        ref={textRef}
        className={`${className} ${expanded ? '' : CLAMP[lines]}`}
      >
        {text}
      </p>
      {showBar && (
        <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
          {extra != null && <div className="min-w-0">{extra}</div>}
          {overflows && (
            <button
              type="button"
              aria-expanded={expanded}
              className="shrink-0 text-[10px] font-bold text-gold-bright hover:text-gold-bright/80 transition-colors"
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
