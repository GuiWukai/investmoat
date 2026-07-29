/**
 * Research articles — cross-cutting analysis that sits above the per-stock
 * pages at /stocks/[ticker].
 *
 * The governing rule: an article never hard-codes a score or a price. Blocks
 * that show scores (`scorecard`, `stat-strip` with a `ticker`) carry tickers
 * only and resolve against the live coverage registry at render time, exactly
 * like /stocks and /portfolio do. Prose carries the argument; the numbers stay
 * current on their own. Anything genuinely static — a capex guide, a headcount
 * — goes in a `table`, which requires an explicit `asOf` stamp so a reader can
 * see how old it is.
 */

/** Prose paragraph. Supports **bold** and [text](href) inline markup. */
export interface ProseBlock {
  type: 'prose';
  body: string;
}

/** Section heading — becomes an <h2> and an anchor target. */
export interface HeadingBlock {
  type: 'heading';
  text: string;
  /** Optional gold eyebrow rendered above the heading. */
  eyebrow?: string;
}

/**
 * Live scorecard. Ships tickers, never numbers: moat / growth / valuation /
 * composite and the recommendation are recomputed from the coverage registry
 * and the live price on every render.
 */
export interface ScorecardBlock {
  type: 'scorecard';
  /** Tickers as they appear in `allCoverageData`. */
  tickers: string[];
  caption?: string;
  /** Optional per-ticker annotation column, keyed by ticker. */
  notes?: Record<string, string>;
  /** Optional grouping label per ticker — renders as a divided sub-table. */
  groups?: { label: string; tickers: string[] }[];
  sort?: 'composite' | 'moat' | 'growth' | 'valuation' | 'given';
}

/** Static table. `asOf` is required — static figures must be dated. */
export interface TableBlock {
  type: 'table';
  caption?: string;
  asOf: string;
  /** Ids into the article's `sources` — where these figures came from. */
  sources?: string[];
  columns: string[];
  rows: string[][];
  /** Index of the column to emphasise (0-based). */
  highlightColumn?: number;
}

/**
 * Static time series of company-reported figures. Use it when the shape over
 * time is the argument; a single period is a `table`.
 */
export interface ChartBlock {
  type: 'chart';
  variant: 'line' | 'bar';
  caption?: string;
  asOf: string;
  sources?: string[];
  /** X-axis labels, usually reporting periods. */
  categories: string[];
  /** Up to four series, each with one value per category (`null` = not reported). */
  series: { name: string; values: (number | null)[] }[];
  /** Unit suffix, e.g. "%" or "B". */
  unit?: string;
  /** Value prefix, e.g. "$". */
  prefix?: string;
  note?: string;
}

/** Pull-out note. */
export interface CalloutBlock {
  type: 'callout';
  tone: 'insight' | 'risk' | 'method';
  title?: string;
  body: string;
}

/** Row of headline figures. A `ticker` makes the figure live. */
export interface StatStripBlock {
  type: 'stat-strip';
  stats: {
    label: string;
    /** Static value. Ignored when `live` is set. */
    value?: string;
    /** Resolve this stat from the registry instead of `value`. */
    live?: { ticker: string; field: 'composite' | 'moat' | 'growth' | 'valuation' | 'price' };
    note?: string;
  }[];
}

/** Bulleted or numbered list. */
export interface ListBlock {
  type: 'list';
  ordered?: boolean;
  items: string[];
}

/**
 * Live moat matrix — tickers down the side, moat pillars across the top,
 * statuses read from each stock's JSON at render time. Restate a moat status
 * in an article and it silently rots the next time the stock is reviewed;
 * this block cannot.
 */
export interface MoatMatrixBlock {
  type: 'moat-matrix';
  tickers: string[];
  /** Keys from the ten-moat framework, e.g. 'systemOfRecord'. */
  moats: TenMoatKey[];
  caption?: string;
  groups?: { label: string; tickers: string[] }[];
}

/** The ten-moat keys an article may chart. Must exist on `tenMoats`. */
export type TenMoatKey =
  | 'learnedInterfaces'
  | 'businessLogic'
  | 'publicDataAccess'
  | 'talentScarcity'
  | 'bundling'
  | 'proprietaryData'
  | 'regulatoryLockIn'
  | 'networkEffects'
  | 'transactionEmbedding'
  | 'systemOfRecord';

export type ResearchBlock =
  | ProseBlock
  | HeadingBlock
  | ScorecardBlock
  | MoatMatrixBlock
  | TableBlock
  | ChartBlock
  | CalloutBlock
  | StatStripBlock
  | ListBlock;

/**
 * A primary document behind a static figure. Live blocks correct themselves;
 * company-reported numbers can only be checked against the document they came
 * from, so the article carries it.
 */
export interface ArticleSource {
  /** Kebab-case id, referenced from a `table` or `chart`. */
  id: string;
  label: string;
  publisher?: string;
  date: string;
  url: string;
  kind: 'filing' | 'press-release' | 'transcript' | 'company-site' | 'regulator' | 'third-party';
}

/** Where the article's falsifiable claim currently stands. */
export type FalsifiableStatus = 'holding' | 'watch' | 'tripped' | 'retired';

export interface FalsifiableClaim {
  claim: string;
  status: FalsifiableStatus;
  /** What the latest data says. Required once the status leaves `holding`. */
  note?: string;
}

/** One entry in the visible revision log. */
export interface ArticleRevision {
  date: string;
  note: string;
}

export interface ResearchArticleData {
  /** URL slug matching the /research/[slug] route and the filename. */
  slug: string;
  title: string;
  /** One-sentence standfirst shown under the title and in the index card. */
  dek: string;
  /** Day-precision date, e.g. "July 28, 2026". */
  published: string;
  /**
   * Day-precision date the thesis was last checked against the underlying
   * stock data. Surfaced on the page — a reader should never have to guess
   * whether an article has been revisited.
   */
  lastReviewed: string;
  /** Tickers the article covers. Drives the ticker rail and index filtering. */
  tickers: string[];
  /** Short topic tags, e.g. "Enterprise Software", "AI Monetization". */
  tags: string[];
  /** 2–5 sentence thesis summary. Reused for metadata and the Markdown mirror. */
  summary: string;
  /** The falsifiable claim the piece rests on, and whether it still stands. */
  falsifiableBy?: FalsifiableClaim;
  /** Primary documents behind the article's static figures. */
  sources?: ArticleSource[];
  /** What changed and when, newest first. Appended by a review. */
  revisions?: ArticleRevision[];
  blocks: ResearchBlock[];
}
