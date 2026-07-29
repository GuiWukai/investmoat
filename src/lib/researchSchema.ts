import { z } from 'zod';

// Runtime schema for research article JSON in src/data/research/*.json.
// Kept in sync with src/types/research.ts — when one changes, update the other.

/** Day-precision date, e.g. "July 28, 2026". */
const dateSchema = z
  .string()
  .regex(
    /^[A-Z][a-z]+ \d{1,2}, \d{4}$/,
    'must be a day-precision date like "July 28, 2026"',
  );

const tickerSchema = z.string().min(1).max(12);

/** Reference to an entry in the article's `sources` list. */
const sourceIdSchema = z
  .string()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'must be a lowercase kebab-case source id');

/**
 * A primary document a static figure came from. Framework scores are live and
 * self-correcting; company-reported figures are not, so they carry a citation
 * a reader can open.
 */
const sourceSchema = z.strictObject({
  id: sourceIdSchema,
  /** What the document is, e.g. "ServiceNow Q2 2026 results press release". */
  label: z.string().min(1),
  publisher: z.string().min(1).optional(),
  date: dateSchema,
  url: z.string().url().startsWith('http', 'must be an absolute http(s) URL'),
  kind: z.enum([
    'filing',
    'press-release',
    'transcript',
    'company-site',
    'regulator',
    'third-party',
  ]),
});

const proseBlockSchema = z.strictObject({
  type: z.literal('prose'),
  body: z.string().min(1),
});

const headingBlockSchema = z.strictObject({
  type: z.literal('heading'),
  text: z.string().min(1),
  eyebrow: z.string().min(1).optional(),
});

const scorecardBlockSchema = z.strictObject({
  type: z.literal('scorecard'),
  tickers: z.array(tickerSchema).min(2),
  caption: z.string().min(1).optional(),
  notes: z.record(tickerSchema, z.string().min(1)).optional(),
  groups: z
    .array(
      z.strictObject({
        label: z.string().min(1),
        tickers: z.array(tickerSchema).min(1),
      }),
    )
    .min(1)
    .optional(),
  sort: z.enum(['composite', 'moat', 'growth', 'valuation', 'given']).optional(),
});

const tableBlockSchema = z
  .strictObject({
    type: z.literal('table'),
    caption: z.string().min(1).optional(),
    // Static figures must be dated so a stale table is visibly stale.
    asOf: z.string().min(1),
    // ...and attributable: ids into the article's `sources`.
    sources: z.array(sourceIdSchema).min(1).optional(),
    columns: z.array(z.string().min(1)).min(2),
    rows: z.array(z.array(z.string())).min(1),
    highlightColumn: z.number().int().min(0).optional(),
  })
  .refine((t) => t.rows.every((r) => r.length === t.columns.length), {
    message: 'every row must have exactly as many cells as there are columns',
  })
  .refine((t) => t.highlightColumn === undefined || t.highlightColumn < t.columns.length, {
    message: 'highlightColumn is out of range',
  });

/**
 * Static time series. Same rule as `table` — company-reported figures only,
 * dated and attributable. A chart earns its place when the *shape* over time
 * is the argument (backlog outrunning capex, two growth rates diverging); a
 * single period belongs in a `table`.
 */
const chartBlockSchema = z
  .strictObject({
    type: z.literal('chart'),
    variant: z.enum(['line', 'bar']),
    caption: z.string().min(1).optional(),
    asOf: z.string().min(1),
    sources: z.array(sourceIdSchema).min(1).optional(),
    /** X-axis labels — usually reporting periods, e.g. "Q1 2025". */
    categories: z.array(z.string().min(1)).min(2),
    series: z
      .array(
        z.strictObject({
          name: z.string().min(1),
          /** One value per category; `null` for a period the company didn't report. */
          values: z.array(z.number().nullable()),
        }),
      )
      .min(1)
      .max(4),
    /** Unit suffix rendered on the axis and in tooltips, e.g. "%" or "B". */
    unit: z.string().max(4).optional(),
    /** Rendered before the unit, e.g. "$". */
    prefix: z.string().max(2).optional(),
    note: z.string().min(1).optional(),
  })
  .refine((c) => c.series.every((s) => s.values.length === c.categories.length), {
    message: 'every series must carry exactly one value per category',
  })
  .refine((c) => c.series.some((s) => s.values.some((v) => v !== null)), {
    message: 'a chart needs at least one non-null value',
  });

const calloutBlockSchema = z.strictObject({
  type: z.literal('callout'),
  tone: z.enum(['insight', 'risk', 'method']),
  title: z.string().min(1).optional(),
  body: z.string().min(1),
});

const statStripBlockSchema = z.strictObject({
  type: z.literal('stat-strip'),
  stats: z
    .array(
      z
        .strictObject({
          label: z.string().min(1),
          value: z.string().min(1).optional(),
          live: z
            .strictObject({
              ticker: tickerSchema,
              field: z.enum(['composite', 'moat', 'growth', 'valuation', 'price']),
            })
            .optional(),
          note: z.string().min(1).optional(),
        })
        .refine((s) => (s.value === undefined) !== (s.live === undefined), {
          message: 'a stat needs exactly one of `value` or `live`',
        }),
    )
    .min(2)
    .max(5),
});

const tenMoatKeySchema = z.enum([
  'learnedInterfaces',
  'businessLogic',
  'publicDataAccess',
  'talentScarcity',
  'bundling',
  'proprietaryData',
  'regulatoryLockIn',
  'networkEffects',
  'transactionEmbedding',
  'systemOfRecord',
]);

const moatMatrixBlockSchema = z.strictObject({
  type: z.literal('moat-matrix'),
  tickers: z.array(tickerSchema).min(2),
  moats: z.array(tenMoatKeySchema).min(1).max(5),
  caption: z.string().min(1).optional(),
  groups: z
    .array(
      z.strictObject({
        label: z.string().min(1),
        tickers: z.array(tickerSchema).min(1),
      }),
    )
    .min(1)
    .optional(),
});

const listBlockSchema = z.strictObject({
  type: z.literal('list'),
  ordered: z.boolean().optional(),
  items: z.array(z.string().min(1)).min(2),
});

const researchBlockSchema = z.union([
  proseBlockSchema,
  headingBlockSchema,
  scorecardBlockSchema,
  moatMatrixBlockSchema,
  tableBlockSchema,
  chartBlockSchema,
  calloutBlockSchema,
  statStripBlockSchema,
  listBlockSchema,
]);

/**
 * The claim that would prove the article wrong, and where it currently stands.
 *
 * The status is the point. A falsifiable claim nobody ever checks is decoration;
 * carrying it as data means `/review-research` can walk it, the page can show a
 * reader that the thesis has been re-tested, and a tripped thesis is visible
 * rather than quietly left standing.
 */
const falsifiableBySchema = z.strictObject({
  claim: z.string().min(1),
  status: z.enum(['holding', 'watch', 'tripped', 'retired']),
  /** What the latest data says about the claim. Required once it leaves `holding`. */
  note: z.string().min(1).optional(),
});

/** One entry in the article's visible revision log, newest first. */
const revisionSchema = z.strictObject({
  date: dateSchema,
  note: z.string().min(1),
});

export const researchArticleSchema = z.strictObject({
  slug: z
    .string()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'must be a lowercase kebab-case slug'),
  title: z.string().min(1).max(120),
  dek: z.string().min(1).max(320),
  published: dateSchema,
  lastReviewed: dateSchema,
  tickers: z.array(tickerSchema).min(1),
  tags: z.array(z.string().min(1)).min(1).max(6),
  summary: z.string().min(1),
  falsifiableBy: falsifiableBySchema.optional(),
  /** Primary documents behind the article's static figures. */
  sources: z.array(sourceSchema).min(1).optional(),
  /** What changed, and when — newest first. Written by a review, not a rewrite. */
  revisions: z.array(revisionSchema).min(1).optional(),
  blocks: z.array(researchBlockSchema).min(1),
})
  .refine((a) => !a.falsifiableBy || a.falsifiableBy.status === 'holding' || Boolean(a.falsifiableBy.note), {
    message: 'falsifiableBy.note is required once the status leaves "holding"',
    path: ['falsifiableBy', 'note'],
  });

export type ResearchArticleSchema = z.infer<typeof researchArticleSchema>;
