/**
 * Which thumb the mobile FAB should sit under.
 *
 * Browsers do not expose handedness. The signal is the thumb that is using
 * the phone right now: a reach for the empty opposite FAB slot ("I expected
 * the control here"), and which edge a one-handed scroll starts from. The
 * same reader can swap hands mid-session — a vote for one thumb forgets the
 * other, so an old right-hand streak cannot block a left thumb that just
 * took over.
 *
 * Default is the right edge — that is where most thumbs rest, and where
 * the dock already lived. The choice is persisted in localStorage so a
 * return visit does not have to re-learn.
 */

export type FabHand = 'left' | 'right';

export const FAB_HAND_STORAGE_KEY = 'investmoat:fab-hand:v1';

export type StoredFabHand = {
  hand: FabHand;
  /** Menu / long-press: prefer this side until the other thumb is seen. */
  locked: boolean;
  /** Reader has used both edges; the menu copy becomes "Switch side". */
  bothThumbs?: boolean;
};

export type PointerSample = {
  x: number;
  y: number;
  viewportWidth: number;
  viewportHeight: number;
  pointerType: string;
  /** Landed on the FAB cluster — biased by wherever it already sits. */
  onDock: boolean;
  /** Landed on a link, button, or other control. */
  onControl: boolean;
  /** Vertical travel when this sample is a scroll, not a tap. */
  scrollDy?: number;
};

export type HandVote = {
  hand: FabHand;
  weight: number;
  reason: 'opposite-corner' | 'thumb-zone' | 'scroll-edge';
};

/** Bottom slice of the viewport where a resting thumb actually lands. */
export const THUMB_ZONE_TOP = 0.72;
/** Outer columns that count as a reach, not a content tap. */
export const CORNER_GUTTER = 0.22;
/** Hit box of the opposite FAB slot, in CSS pixels. */
export const FAB_SLOT_PX = 88;
/** Outer columns that count as a one-handed scroll start. */
export const SCROLL_GUTTER = 0.28;
export const SCROLL_DY = 12;
/** Forget a half-finished streak so two far-apart flicks do not add up. */
export const VOTE_DECAY_MS = 8000;
/** Ignore auto-votes briefly after an explicit flip so the dock does not bounce. */
export const FLIP_COOLDOWN_MS = 700;

const INTERACTIVE_SELECTOR = [
  'a',
  'button',
  'input',
  'textarea',
  'select',
  'summary',
  '[role="button"]',
  '[role="link"]',
  '[role="menuitem"]',
].join(',');

export function isFabHand(value: unknown): value is FabHand {
  return value === 'left' || value === 'right';
}

export function isFabDockTarget(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest('[data-fab-dock]'));
}

export function isInteractiveTarget(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest(INTERACTIVE_SELECTOR));
}

/**
 * Turn one pointer into a handedness vote, or ignore it.
 *
 * The hook already refuses to run on a desktop-width viewport, so mouse
 * is allowed here: a narrow window still shows the dock, and an empty
 * tap in the far corner is the same "put it here" signal as a thumb.
 * Taps on the dock itself are ignored (they only prove the current side
 * is reachable). A vertical scroll that starts on an outer edge is
 * weaker but plentiful, so it still counts.
 */
export function classifyPointer(sample: PointerSample, current: FabHand): HandVote | null {
  if (sample.viewportWidth <= 0 || sample.viewportHeight <= 0) return null;
  if (sample.onDock) return null;

  const relX = sample.x / sample.viewportWidth;
  const scrollDy = sample.scrollDy ?? 0;

  if (scrollDy >= SCROLL_DY) {
    if (relX <= SCROLL_GUTTER) return { hand: 'left', weight: 1, reason: 'scroll-edge' };
    if (relX >= 1 - SCROLL_GUTTER) return { hand: 'right', weight: 1, reason: 'scroll-edge' };
    return null;
  }

  const fromBottom = sample.viewportHeight - sample.y;
  const slotW = Math.min(FAB_SLOT_PX + 24, Math.max(56, Math.floor(sample.viewportWidth * 0.28)));
  const slotH = FAB_SLOT_PX + 36;
  const inLeftSlot = sample.x <= slotW && fromBottom <= slotH;
  const inRightSlot = sample.x >= sample.viewportWidth - slotW && fromBottom <= slotH;

  // The unused FAB slot is the strong "put it here" signal — even when
  // the tap lands on content sitting in that corner.
  if (inLeftSlot) {
    const opposite = current === 'right';
    return {
      hand: 'left',
      weight: opposite ? 2 : 1,
      reason: opposite ? 'opposite-corner' : 'thumb-zone',
    };
  }
  if (inRightSlot) {
    const opposite = current === 'left';
    return {
      hand: 'right',
      weight: opposite ? 2 : 1,
      reason: opposite ? 'opposite-corner' : 'thumb-zone',
    };
  }

  const relY = sample.y / sample.viewportHeight;
  if (relY < THUMB_ZONE_TOP) return null;
  if (sample.onControl) return null;

  // Broader empty gutter: a resting thumb, but not the FAB slot itself.
  // Never treated as opposite-corner, so a margin tap does not snap the dock.
  if (relX <= CORNER_GUTTER) {
    return { hand: 'left', weight: 1, reason: 'thumb-zone' };
  }
  if (relX >= 1 - CORNER_GUTTER) {
    return { hand: 'right', weight: 1, reason: 'thumb-zone' };
  }
  return null;
}

export type TallyOptions = {
  /**
   * Both edges have already been used. Two opposite-edge scrolls then
   * follow the thumb that swapped in; first discovery wants one more
   * so a single flick does not move the dock.
   */
  bothThumbs?: boolean;
};

/**
 * Consecutive votes for one hand. A vote for the other side zeros the
 * streak — that is what lets the same reader swap thumbs without fighting
 * a leftover lead.
 *
 * Opposite FAB-slot reach: one tap follows the thumb, first time and every
 * swap. Scrolls and empty-gutter taps: three the first time, two after
 * both thumbs have been seen.
 */
export function tallyVote(
  leftVotes: number,
  rightVotes: number,
  vote: HandVote,
  options: TallyOptions = {}
): { leftVotes: number; rightVotes: number; inferred: FabHand | null } {
  const left = vote.hand === 'left' ? leftVotes + vote.weight : 0;
  const right = vote.hand === 'right' ? rightVotes + vote.weight : 0;
  const score = vote.hand === 'left' ? left : right;

  if (vote.reason === 'opposite-corner') {
    return { leftVotes: left, rightVotes: right, inferred: vote.hand };
  }

  const min = options.bothThumbs ? 2 : 3;
  const inferred = score >= min ? vote.hand : null;
  return { leftVotes: left, rightVotes: right, inferred };
}

export function loadFabHand(): StoredFabHand | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(FAB_HAND_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return null;
    const hand = (parsed as { hand?: unknown }).hand;
    if (!isFabHand(hand)) return null;
    return {
      hand,
      locked: (parsed as { locked?: unknown }).locked === true,
      bothThumbs: (parsed as { bothThumbs?: unknown }).bothThumbs === true,
    };
  } catch {
    return null;
  }
}

export function saveFabHand(stored: StoredFabHand): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(FAB_HAND_STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // Quota / private mode — keep the in-memory side only.
  }
}

/** Drives CSS before (and after) React hydrates, so the dock does not jump. */
export function applyFabHandToDocument(hand: FabHand): void {
  if (typeof document === 'undefined') return;
  if (hand === 'left') {
    document.documentElement.dataset.fabHand = 'left';
  } else {
    delete document.documentElement.dataset.fabHand;
  }
}
