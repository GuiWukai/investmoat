'use client';

import { useEffect, useRef, useState } from 'react';

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
  lines = 3,
  className = '',
  align = 'start',
}: {
  text: string;
  lines?: 1 | 2 | 3 | 4;
  className?: string;
  align?: 'start' | 'center';
}) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const singleLine = lines === 1;

  useEffect(() => {
    setExpanded(false);
  }, [text, lines]);

  useEffect(() => {
    const el = textRef.current;
    if (!el || expanded) return;

    const measure = () => {
      // Sub-pixel rounding routinely reports 1–2px of fake overflow on
      // copy that already fits, which would show a no-op Read more.
      const over = singleLine
        ? el.scrollWidth - el.clientWidth > 8
        : el.scrollHeight - el.clientHeight > 4;
      setOverflows(over);
    };

    measure();
    const raf = requestAnimationFrame(() => {
      measure();
      requestAnimationFrame(measure);
    });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    void document.fonts?.ready.then(measure);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [text, lines, expanded, singleLine]);

  if (!text) return null;

  return (
    <div className={`min-w-0 ${align === 'center' ? 'text-center' : ''}`}>
      <p
        ref={textRef}
        className={`${className} ${
          expanded ? '' : singleLine ? 'truncate' : CLAMP[lines]
        }`}
      >
        {text}
      </p>
      {overflows && (
        <button
          type="button"
          aria-expanded={expanded}
          className="mt-1 text-[11px] font-bold text-gold-bright hover:text-gold-bright/80 transition-colors"
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
  );
}
