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
  calloutBlockSchema,
  statStripBlockSchema,
  listBlockSchema,
]);

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
  falsifiableBy: z.string().min(1).optional(),
  blocks: z.array(researchBlockSchema).min(1),
});

export type ResearchArticleSchema = z.infer<typeof researchArticleSchema>;
