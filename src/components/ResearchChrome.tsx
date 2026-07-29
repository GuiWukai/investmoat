'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { ArrowUp, Check, Link2, List } from 'lucide-react';
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
      // Band sits just under the sticky header and covers the upper third of
      // the viewport — where a reader's eye actually is.
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

/** Thin gold rule that fills as the article scrolls. */
export function ReadingProgress() {
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

/** Collapsible contents for viewports too narrow for the rail. */
export function ContentsDisclosure({ sections }: { sections: ArticleSection[] }) {
  const [open, setOpen] = useState(false);
  if (sections.length < 2) return null;

  return (
    <Card className="xl:hidden mb-8 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center gap-2.5 px-4 py-3 text-left hover:bg-foreground/[0.02] transition-colors"
      >
        <List size={14} className="text-accent" />
        <span className="section-label">Contents</span>
        <span className="ml-auto text-[11px] text-foreground/30 font-mono">
          {open ? 'Hide' : `${sections.length} sections`}
        </span>
      </button>
      {open && (
        <ol className="px-4 pb-3 space-y-0.5 border-t border-foreground/[0.05] pt-2">
          {sections.map((s, i) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  setOpen(false);
                  scrollToSection(s.id);
                }}
                className="flex gap-2.5 py-1.5 text-[13.5px] text-foreground/50 hover:text-foreground transition-colors"
              >
                <span className="font-mono text-[10px] pt-[3px] text-foreground/20 tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span>{s.label}</span>
              </a>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}

/** Copy-link button — shares the canonical URL of the article or a section. */
export function CopyLinkButton({ className = '' }: { className?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    const url = `${window.location.origin}${window.location.pathname}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard denied (insecure context, permissions) — leave the UI honest.
      setCopied(false);
    }
  }, []);

  return (
    <button
      type="button"
      onClick={copy}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-foreground/[0.08] bg-foreground/[0.02] text-[11px] font-bold uppercase tracking-widest transition-colors ${
        copied ? 'text-[#34d399] border-[#34d399]/30' : 'text-foreground/35 hover:text-foreground/80 hover:border-foreground/20'
      } ${className}`}
    >
      {copied ? <Check size={12} /> : <Link2 size={12} />}
      {copied ? 'Copied' : 'Copy link'}
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

/** Appears once the reader is a screen deep. */
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
      className="fixed bottom-5 right-5 z-[110] w-10 h-10 rounded-full border border-accent/25 bg-[#0b0e13]/90 backdrop-blur text-accent/70 hover:text-gold-bright hover:border-accent/50 flex items-center justify-center shadow-lg shadow-black/40 transition-colors"
    >
      <ArrowUp size={16} />
    </button>
  );
}
