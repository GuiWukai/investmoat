import { z } from 'zod';

// Runtime schema for stock JSON files in src/data/stocks/*.json.
// Kept in sync with src/types/stockAnalysis.ts — when one changes, update the other.

const moatStatusSchema = z.enum(['strong', 'intact', 'weakened', 'destroyed']);

const recommendationSchema = z.enum([
  'Strong Buy',
  'Accumulate',
  'Hold',
  'Speculative Buy',
  'Avoid',
]);

const chipColorSchema = z.enum(['primary', 'secondary', 'success', 'warning', 'danger']);

const headerStatSchema = z.strictObject({
  label: z.string().min(1),
  value: z.string().min(1),
});

const chipSchema = z.strictObject({
  label: z.string().min(1),
  color: chipColorSchema,
});

const stockMetricSchema = z.strictObject({
  title: z.string().min(1),
  value: z.string().min(1),
  label: z.string().min(1),
  icon: z.string().min(1),
  color: z.string().min(1),
});

const analysisPointSchema = z.strictObject({
  title: z.string().min(1),
  text: z.string().min(1),
});

const moatAssessmentSchema = z.strictObject({
  status: moatStatusSchema,
  note: z.string().min(1),
});

const score0to100 = z.number().int().min(0).max(100);

const tenMoatsSchema = z.strictObject({
  learnedInterfaces: moatAssessmentSchema,
  businessLogic: moatAssessmentSchema,
  publicDataAccess: moatAssessmentSchema,
  talentScarcity: moatAssessmentSchema,
  bundling: moatAssessmentSchema,
  proprietaryData: moatAssessmentSchema,
  regulatoryLockIn: moatAssessmentSchema,
  networkEffects: moatAssessmentSchema,
  transactionEmbedding: moatAssessmentSchema,
  systemOfRecord: moatAssessmentSchema,
  verdict: z.string().min(1),
  // Authored hand-score from earlier workflow; not currently consumed by the UI
  // (moat score is computed via computeMoatScore in src/lib/valuationScore.ts).
  aiResilienceScore: score0to100.optional(),
});

const scenarioSchema = z.strictObject({
  priceTarget: z.string().min(1),
  description: z.string().min(1),
  points: z.array(z.string().min(1)).min(1),
});

const growthAnalysisSchema = z.strictObject({
  cagrEstimate: z.string().min(1),
  scoreDerivation: z.string().min(1),
  drivers: z
    .array(
      z.strictObject({
        name: z.string().min(1),
        metric: z.string().min(1),
        trend: z.enum(['accelerating', 'stable', 'decelerating']),
      }),
    )
    .min(1),
  primaryType: z.enum(['TAM expansion', 'market share', 'both']),
  keyRisk: z.string().min(1),
  /** Severity of keyRisk — feeds the risk-discount term in computeGrowthScore. Optional for now to allow phased backfill. */
  keyRiskSeverity: z.enum(['low', 'moderate', 'high', 'severe']).optional(),
  marginTrend: z.enum(['expanding', 'stable', 'compressing']),
});

const additionalNoteSchema = z.strictObject({
  title: z.string().min(1),
  points: z.array(z.string().min(1)).min(1),
});

const valuationNoteSchema = z.strictObject({
  text: z.string().min(1),
  fairValue: z.string().min(1),
});

const peAnalysisSchema = z.strictObject({
  rows: z
    .array(
      z.strictObject({
        label: z.string().min(1),
        value: z.string().min(1),
        note: z.string().min(1).optional(),
      }),
    )
    .min(1),
  summary: z.string().min(1),
  asOf: z.string().min(1).optional(),
});

const gridCardSchema = z.strictObject({
  label: z.string().min(1),
  text: z.string().min(1),
});

const timelineStatSchema = z.strictObject({
  label: z.string().min(1),
  value: z.string().min(1),
});

const extraSectionSchema = z.strictObject({
  type: z.enum(['grid-cards', 'production-timeline']),
  title: z.string().min(1),
  accentColor: z.string().min(1).optional(),
  gridHeader: z.string().min(1).optional(),
  intro: z.string().min(1),
  cards: z.array(gridCardSchema).min(1).optional(),
  stats: z.array(timelineStatSchema).min(1).optional(),
  closing: z.string().min(1).optional(),
});

export const stockAnalysisSchema = z.strictObject({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, 'slug must be lowercase alphanumeric (hyphens allowed)'),
  ticker: z.string().min(1),
  name: z.string().min(1),
  lastAnalyzed: z.string().min(1).optional(),
  titleColor: z.string().min(1).optional(),
  headerStats: z.array(headerStatSchema).min(1),
  chips: z.array(chipSchema).min(1),
  recommendation: recommendationSchema,
  metrics: z.array(stockMetricSchema).min(1),
  moat: z.strictObject({
    score: score0to100.optional(),
    description: z.string().min(1),
    analysisTitle: z.string().min(1),
    analysisSummary: z.string().min(1),
    analysisPoints: z.array(analysisPointSchema).min(1),
  }),
  growth: z.strictObject({
    score: score0to100,
    description: z.string().min(1),
    additionalNote: additionalNoteSchema.optional(),
    growthAnalysis: growthAnalysisSchema.optional(),
  }),
  valuation: z.strictObject({
    score: score0to100,
    description: z.string().min(1),
    valuationNote: valuationNoteSchema.optional(),
    peAnalysis: peAnalysisSchema.optional(),
  }),
  scenarios: z.strictObject({
    bear: scenarioSchema,
    base: scenarioSchema,
    bull: scenarioSchema,
  }),
  tenMoats: tenMoatsSchema,
  extraSections: z.array(extraSectionSchema).min(1).optional(),
});

export type StockAnalysisSchema = z.infer<typeof stockAnalysisSchema>;
