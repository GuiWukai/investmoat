'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUp, Check, Link2, List, Share2 } from 'lucide-react';
import type { ArticleSection } from '@/lib/researchMeta';
import { Card } from "@heroui/react";

/**
 * Reader scaffolding for a research article: scroll progress, the contents
 * rail, the anchor/share affordances and back-to-top. Kept out of
 * ResearchArticle so the block renderers stay about content.
 */

/** Which section anchor is currently in view. Drives the contents rail. */
function useActiveSection(sections: ArticleSection[]) {
  const key = sections.map((s) => s.id).join(',');
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const ids = key ? key.split(',') : [];
    if (ids.length === 0) return;

    const seen = new Map<string, boolean>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          seen.set(entry.target.id, entry.isIntersecting);
        }
        // The topmost heading currently inside the reading band wins; if none
        // is, keep the last one we scrolled past rather than blanking out.
        const visible = ids.filter((id) => seen.get(id));
        if (visible.length > 0) setActive(visible[0]);
      },
      // Band sits near the top of the viewport and covers the upper third —
      // where a reader's eye actually is. The mobile header is not sticky,
      // so there is no chrome to offset against.
      { rootMargin: '-88px 0px -66% 0px', threshold: 0 },
    );

    const nodes = ids
      .map((id) => document.getElementById(id))
      .filter((n): n is HTMLElement => n !== null);
    nodes.forEach((n) => observer.observe(n));

    return () => observer.disconnect();
  }, [key]);

  return active;
}

/** 0–1 how far through the article the reader is. Shared by the gold rule and the sticky contents. */
function useReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    function update() {
      frame = 0;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      setProgress(scrollable > 0 ? Math.min(1, doc.scrollTop / scrollable) : 0);
    }
    function onScroll() {
      if (frame === 0) frame = requestAnimationFrame(update);
    }
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return progress;
}

/** Thin gold rule that fills as the article scrolls. */
export function ReadingProgress() {
  const progress = useReadingProgress();

  return (
    <div
      className="fixed top-0 left-0 right-0 lg:left-[280px] h-[2px] z-[120] pointer-events-none"
      aria-hidden="true"
    >
      <div
        className="h-full origin-left bg-gradient-to-r from-gold-deep via-accent to-gold-bright"
        style={{ transform: `scaleX(${progress})`, transition: 'transform 90ms linear' }}
      />
    </div>
  );
}

function scrollToSection(id: string) {
  const node = document.getElementById(id);
  if (!node) return;
  node.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  // Update the URL without a jump, so the anchor is copyable and back works.
  history.replaceState(null, '', `#${id}`);
}

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/** Sticky contents rail — desktop only, sits in the gutter beside the prose. */
export function ContentsRail({ sections }: { sections: ArticleSection[] }) {
  const active = useActiveSection(sections);
  if (sections.length < 2) return null;

  return (
    <nav aria-label="Article contents" className="sticky top-8 max-h-[calc(100vh-6rem)] overflow-y-auto pb-6">
      <div className="section-label mb-3">Contents</div>
      <ul className="space-y-0.5 border-l border-foreground/[0.07]">
        {sections.map((s, i) => {
          const isActive = active === s.id;
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(s.id);
                }}
                aria-current={isActive ? 'true' : undefined}
                className={`group flex gap-2.5 py-1.5 pl-3 -ml-px border-l text-[12.5px] leading-snug transition-colors ${
                  isActive
                    ? 'border-accent text-foreground/85'
                    : 'border-transparent text-foreground/35 hover:text-foreground/70 hover:border-foreground/20'
                }`}
              >
                <span
                  className={`font-mono text-[10px] pt-[3px] tabular-nums ${
                    isActive ? 'text-accent' : 'text-foreground/20 group-hover:text-foreground/35'
                  }`}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span>{s.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Collapsible contents for viewports too narrow for the rail.
 *
 * The mobile header is not sticky, so once the reader is into the piece this
 * panel pins under the progress rule and carries the current section plus
 * remaining time — the wayfinding the gutter rail provides on a wide screen.
 */
export function ContentsDisclosure({
  sections,
  minutes,
}: {
  sections: ArticleSection[];
  minutes: number;
}) {
  const [open, setOpen] = useState(false);
  const [stuck, setStuck] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const active = useActiveSection(sections);
  const progress = useReadingProgress();

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setStuck(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  if (sections.length < 2) return null;

  const activeLabel = sections.find((s) => s.id === active)?.label;
  const remaining =
    progress > 0.97 ? 'Done' : `${Math.max(1, Math.round((1 - progress) * minutes))} min left`;

  return (
    <>
      <div ref={sentinelRef} className="xl:hidden h-px" aria-hidden="true" />
      <nav
        aria-label="Article contents"
        className={`xl:hidden sticky top-0 z-[60] -mx-4 sm:-mx-6 mb-8 mt-8 ${
          stuck
            ? 'border-b border-foreground/[0.08] bg-[#0b0e13]/92 backdrop-blur-xl shadow-[0_12px_32px_rgba(0,0,0,0.35)]'
            : ''
        }`}
      >
        <Card
          className={`overflow-hidden ${
            stuck
              ? 'rounded-none border-0 bg-transparent shadow-none mx-0'
              : 'mx-4 sm:mx-6'
          }`}
        >
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="w-full flex items-center gap-2.5 px-4 min-h-12 py-3 text-left hover:bg-foreground/[0.02] transition-colors"
          >
            <List size={14} className="text-accent shrink-0" />
            <span className="section-label shrink-0">Contents</span>
            {!open && activeLabel && (
              <span className="min-w-0 truncate text-[13px] text-foreground/55">
                {activeLabel}
              </span>
            )}
            <span className="ml-auto shrink-0 text-[11px] text-foreground/30 font-mono">
              {open ? 'Hide' : stuck ? remaining : `${sections.length} sections`}
            </span>
          </button>
          {open && (
            <ol className="px-4 pb-3 space-y-0.5 border-t border-foreground/[0.05] pt-2 max-h-[min(60vh,24rem)] overflow-y-auto">
              {sections.map((s, i) => {
                const isActive = active === s.id;
                return (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setOpen(false);
                        scrollToSection(s.id);
                      }}
                      aria-current={isActive ? 'true' : undefined}
                      className={`flex gap-2.5 py-1.5 text-[13.5px] transition-colors ${
                        isActive
                          ? 'text-foreground/85'
                          : 'text-foreground/50 hover:text-foreground'
                      }`}
                    >
                      <span
                        className={`font-mono text-[10px] pt-[3px] tabular-nums ${
                          isActive ? 'text-accent' : 'text-foreground/20'
                        }`}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span>{s.label}</span>
                    </a>
                  </li>
                );
              })}
            </ol>
          )}
        </Card>
      </nav>
    </>
  );
}

/** Share / copy-link — native share on a phone, clipboard everywhere else.
 *  Copies the current URL including the section hash, so a heading jump is shareable.
 */
export function CopyLinkButton({
  title,
  className = '',
}: {
  title?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function');
  }, []);

  const copy = useCallback(async () => {
    const url = `${window.location.origin}${window.location.pathname}${window.location.hash}`;
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, url });
        return;
      } catch (err) {
        // User cancelled, or share isn't actually available — fall through to copy.
        if (err instanceof DOMException && err.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }, [title]);

  const sharing = canShare && !copied;

  return (
    <button
      type="button"
      onClick={copy}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-foreground/[0.08] bg-foreground/[0.02] text-[11px] font-bold uppercase tracking-widest transition-colors ${
        copied
          ? 'text-[#34d399] border-[#34d399]/30'
          : 'text-foreground/35 hover:text-foreground/80 hover:border-foreground/20'
      } ${className}`}
    >
      {copied ? <Check size={12} /> : sharing ? <Share2 size={12} /> : <Link2 size={12} />}
      {copied ? 'Copied' : sharing ? 'Share' : 'Copy link'}
    </button>
  );
}

/** Anchor affordance shown on heading hover. */
export function HeadingAnchor({ id }: { id: string }) {
  return (
    <a
      href={`#${id}`}
      onClick={(e) => {
        e.preventDefault();
        scrollToSection(id);
      }}
      aria-label="Link to this section"
      className="hidden md:inline ml-2 align-middle text-foreground/0 group-hover:text-foreground/25 hover:!text-gold-bright focus-visible:text-gold-bright transition-colors"
    >
      <Link2 size={16} className="inline" />
    </a>
  );
}

/** Desktop-only. On a phone the article back-to-top lives in the FAB cluster
 *  next to search and the menu, so this one would double up.
 */
export function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    function onScroll() {
      setShow(window.scrollY > 1200);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      type="button"
      onClick={() =>
        window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
      }
      aria-label="Back to top"
      className="hidden lg:flex fixed z-[110] h-10 w-10 items-center justify-center rounded-full border border-accent/25 bg-[#0b0e13]/90 text-accent/70 shadow-lg shadow-black/40 backdrop-blur transition-colors hover:border-accent/50 hover:text-gold-bright right-5 bottom-5"
    >
      <ArrowUp size={16} />
    </button>
  );
}
