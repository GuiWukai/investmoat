export type MoatStatus = 'strong' | 'intact' | 'weakened' | 'destroyed';
export type RecommendationStatus = 'Strong Buy' | 'Accumulate' | 'Hold' | 'Speculative Buy' | 'Avoid';
export type ChipColor = 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

/**
 * Asset-class-aware moat framework. Equities are scored against the 10-moat
 * business framework (TenMoatsData); crypto protocols against a 5-pillar
 * monetary-moat framework (CryptoMoatsData); commodities against a 3-pillar
 * commodity framework (CommodityMoatsData). Scores are NOT directly comparable
 * across asset classes — a BTC moat of 100 measures protocol durability, not
 * the same thing as an equity moat of 100.
 */
export type AssetClass = 'equity' | 'crypto' | 'commodity';

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
  /**
   * Optional per-stock override of this moat's AI exposure group. When set,
   * the moat is routed to the specified bucket regardless of its default
   * classification — letting moats like CUDA (NVDA learnedInterfaces) or the
   * Palantir ontology (PLTR businessLogic) be recognised as AI-strengthened
   * rather than AI-vulnerable. Defaults preserve existing behaviour.
   */
  aiExposure?: 'resilient' | 'vulnerable';
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
  verdict: string;
  /** Authored hand-score; not currently consumed by the UI (moat score is computed from statuses). */
  aiResilienceScore?: number;
}

/**
 * Crypto-protocol moat framework. Five pillars that capture what makes a
 * monetary protocol durable rather than what makes a business durable.
 *  - networkEffects: Lindy / hashrate / liquidity / integration breadth
 *  - schellingPoint: default-choice status within its category
 *  - credibleNeutrality: resistance to capture by any controlling entity
 *  - regulatoryIncumbency: ETF / classification / sovereign-reserve standing
 *  - securityBudget: economic security from hashrate or staked capital
 *
 * primaryMoat declares which pillar is this protocol's *actual* moat. The
 * scoring function up-weights the primary pillar (50%) and down-weights the
 * other four (12.5% each) — so BTC scores on its credible neutrality, ETH on
 * its network effects, without being averaged through pillars that aren't
 * what makes each protocol durable.
 */
export type CryptoMoatPillar =
  | 'networkEffects'
  | 'schellingPoint'
  | 'credibleNeutrality'
  | 'regulatoryIncumbency'
  | 'securityBudget';

export interface CryptoMoatsData {
  networkEffects: MoatAssessmentData;
  schellingPoint: MoatAssessmentData;
  credibleNeutrality: MoatAssessmentData;
  regulatoryIncumbency: MoatAssessmentData;
  securityBudget: MoatAssessmentData;
  primaryMoat: CryptoMoatPillar;
  verdict: string;
}

/**
 * Commodity moat framework. Three pillars that capture the durability of a
 * physical store-of-value or industrial asset:
 *  - absoluteScarcity: supply-curve inelasticity to demand
 *  - monetaryHistory: Lindy as a store of value / institutional recognition
 *  - industrialUtility: real-world demand floor outside monetary use
 *
 * primaryMoat declares which pillar is this commodity's *actual* moat. The
 * scoring function up-weights the primary pillar (50%) and down-weights the
 * other two (25% each) — so gold scores on its monetary history without
 * being dragged by industrial demand, and copper scores on its industrial
 * utility without being dragged by its weak monetary history.
 */
export type CommodityMoatPillar = 'absoluteScarcity' | 'monetaryHistory' | 'industrialUtility';

export interface CommodityMoatsData {
  absoluteScarcity: MoatAssessmentData;
  monetaryHistory: MoatAssessmentData;
  industrialUtility: MoatAssessmentData;
  primaryMoat: CommodityMoatPillar;
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
  /**
   * Selects which moat framework scores this asset. Defaults to 'equity'.
   * When set to 'crypto', cryptoMoats must be present (tenMoats ignored);
   * when set to 'commodity', commodityMoats must be present.
   */
  assetClass?: AssetClass;
  /** Month and year this analysis was last updated, e.g. "March 2026" */
  lastAnalyzed?: string;
  /** Optional hex colour applied to the page title */
  titleColor?: string;
  /** Ordered stats shown in the header (Ticker, Market Cap, Price, etc.) */
  headerStats: Array<{ label: string; value: string }>;
  chips: Array<{ label: string; color: ChipColor }>;
  metrics: StockMetric[];
  moat: {
    /** Computed dynamically from tenMoats via computeMoatScore(); optional in JSON. */
    score?: number;
    description: string;
    analysisTitle: string;
    analysisSummary: string;
    analysisPoints: AnalysisPoint[];
  };
  growth: {
    description: string;
    additionalNote?: {
      title: string;
      points: string[];
    };
    /** Structured growth analysis — required. The growth score is derived from these fields via computeGrowthScore. */
    growthAnalysis: {
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
      /** Severity of keyRisk — feeds the risk-discount term in computeGrowthScore. */
      keyRiskSeverity: 'low' | 'moderate' | 'high' | 'severe';
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
  /** Equity moat framework. Required when assetClass is 'equity' (default). */
  tenMoats?: TenMoatsData;
  /** Crypto moat framework. Required when assetClass is 'crypto'. */
  cryptoMoats?: CryptoMoatsData;
  /** Commodity moat framework. Required when assetClass is 'commodity'. */
  commodityMoats?: CommodityMoatsData;
  extraSections?: ExtraSection[];
}
