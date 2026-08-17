/**
 * Which thumb the mobile FAB should sit under.
 *
 * Browsers do not expose handedness. The signal is the thumb itself: empty
 * taps in the opposite bottom corner ("I expected the control here"), and
 * which edge a one-handed scroll starts from. Readers who swap hands are
 * not stuck — after both edges have been used, one opposite-corner tap
 * moves the dock, and stale votes decay so an old left-hand streak cannot
 * block a right thumb a few seconds later.
 *
 * Default is the right edge — that is where most thumbs rest, and where
 * the dock already lived. The choice is persisted in localStorage so a
 * return visit does not have to re-learn.
 */

export type FabHand = 'left' | 'right';

export const FAB_HAND_STORAGE_KEY = 'investmoat:fab-hand:v1';

export type StoredFabHand = {
  hand: FabHand;
  /** Menu / long-press: ignore casual scroll votes. Opposite-corner still wins. */
  locked: boolean;
  /** Reader has used both edges; swapping thumbs is a one-tap reach. */
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
export const FAB_SLOT_PX = 72;
/** Outer columns that count as a one-handed scroll start. */
export const SCROLL_GUTTER = 0.28;
export const SCROLL_DY = 12;
/** Forget a half-finished tally so a later thumb-swap is not fighting it. */
export const VOTE_DECAY_MS = 8000;

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
  const inLeftSlot = sample.x <= FAB_SLOT_PX + 20 && fromBottom <= FAB_SLOT_PX + 28;
  const inRightSlot =
    sample.x >= sample.viewportWidth - FAB_SLOT_PX - 20 && fromBottom <= FAB_SLOT_PX + 28;

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

  if (relX <= CORNER_GUTTER) {
    const opposite = current === 'right';
    return {
      hand: 'left',
      weight: opposite ? 2 : 1,
      reason: opposite ? 'opposite-corner' : 'thumb-zone',
    };
  }
  if (relX >= 1 - CORNER_GUTTER) {
    const opposite = current === 'left';
    return {
      hand: 'right',
      weight: opposite ? 2 : 1,
      reason: opposite ? 'opposite-corner' : 'thumb-zone',
    };
  }
  return null;
}

export type TallyOptions = {
  /**
   * Both edges have already been used. One opposite-corner tap (weight 2)
   * is enough to follow the thumb that is reaching now; first discovery
   * still wants two taps so a stray corner hit does not move the dock.
   */
  bothThumbs?: boolean;
};

/**
 * First time: two empty taps on the far corner, or three same-edge
 * scrolls. After both thumbs have been seen, a single opposite-corner
 * reach follows the hand that just swapped in. A mixed bag is not.
 */
export function tallyVote(
  leftVotes: number,
  rightVotes: number,
  vote: HandVote,
  options: TallyOptions = {}
): { leftVotes: number; rightVotes: number; inferred: FabHand | null } {
  const left = leftVotes + (vote.hand === 'left' ? vote.weight : 0);
  const right = rightVotes + (vote.hand === 'right' ? vote.weight : 0);
  const lead = Math.abs(left - right);
  const majority: FabHand | null = left > right ? 'left' : right > left ? 'right' : null;
  if (!majority) return { leftVotes: left, rightVotes: right, inferred: null };

  const snap = options.bothThumbs && vote.reason === 'opposite-corner';
  const min = snap ? 2 : 3;
  const minLead = snap ? 2 : 3;
  const inferred = Math.max(left, right) >= min && lead >= minLead ? majority : null;
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
