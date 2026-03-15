export type MoatStatus = 'strong' | 'intact' | 'weakened' | 'destroyed';
export type RecommendationStatus = 'Strong Buy' | 'Accumulate' | 'Hold' | 'Speculative Buy';
export type ChipColor = 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

export interface StockMetric {
  title: string;
  value: string;
  label: string;
  icon: string;
  color: string;
}

export interface AnalysisPoint {
  title: string;
  text: string;
}

export interface Scenario {
  priceTarget: string;
  description: string;
  points: string[];
}

export interface MoatAssessmentData {
  status: MoatStatus;
  note: string;
}

export interface TenMoatsData {
  learnedInterfaces: MoatAssessmentData;
  businessLogic: MoatAssessmentData;
  publicDataAccess: MoatAssessmentData;
  talentScarcity: MoatAssessmentData;
  bundling: MoatAssessmentData;
  proprietaryData: MoatAssessmentData;
  regulatoryLockIn: MoatAssessmentData;
  networkEffects: MoatAssessmentData;
  transactionEmbedding: MoatAssessmentData;
  systemOfRecord: MoatAssessmentData;
  aiResilienceScore: number;
  verdict: string;
}

export interface GridCard {
  label: string;
  text: string;
}

export interface TimelineStat {
  label: string;
  value: string;
}

export interface ExtraSection {
  type: 'grid-cards' | 'production-timeline';
  title: string;
  accentColor?: string;
  gridHeader?: string;
  intro: string;
  cards?: GridCard[];
  stats?: TimelineStat[];
  closing?: string;
}

export interface StockAnalysisData {
  /** URL slug matching the /stocks/[ticker] route */
  slug: string;
  ticker: string;
  name: string;
  /** Month and year this analysis was last updated, e.g. "March 2026" */
  lastAnalyzed?: string;
  /** Optional hex colour applied to the page title */
  titleColor?: string;
  /** Ordered stats shown in the header (Ticker, Market Cap, Price, etc.) */
  headerStats: Array<{ label: string; value: string }>;
  chips: Array<{ label: string; color: ChipColor }>;
  recommendation: RecommendationStatus;
  metrics: StockMetric[];
  moat: {
    score: number;
    description: string;
    analysisTitle: string;
    analysisSummary: string;
    analysisPoints: AnalysisPoint[];
  };
  growth: {
    score: number;
    description: string;
    additionalNote?: {
      title: string;
      points: string[];
    };
    /** Structured growth analysis — required for new stocks, optional for legacy. */
    growthAnalysis?: {
      /** Blended 3–5 year revenue CAGR estimate, e.g. "15–20%". Anchors the score to the rubric. */
      cagrEstimate: string;
      /** Shows score derivation: base CAGR score + named adjustments = final. */
      scoreDerivation: string;
      /** Top 2–3 revenue drivers. */
      drivers: Array<{
        name: string;
        metric: string;
        trend: 'accelerating' | 'stable' | 'decelerating';
      }>;
      /** Whether this is a TAM expansion story, market share capture, or both. */
      primaryType: 'TAM expansion' | 'market share' | 'both';
      /** Specific, falsifiable risk with a named time horizon. */
      keyRisk: string;
      /** Operating margin direction — feeds the −5 margin compression adjustment. */
      marginTrend: 'expanding' | 'stable' | 'compressing';
    };
  };
  valuation: {
    score: number;
    description: string;
    valuationNote?: {
      text: string;
      fairValue: string;
    };
    peAnalysis?: {
      rows: Array<{
        label: string;
        value: string;
        note?: string;
      }>;
      summary: string;
      asOf?: string;
    };
  };
  scenarios: {
    bear: Scenario;
    base: Scenario;
    bull: Scenario;
  };
  tenMoats: TenMoatsData;
  extraSections?: ExtraSection[];
}
