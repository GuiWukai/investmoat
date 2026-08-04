/**
 * Display names for the moat pillars, and one way to walk whichever framework
 * an asset is scored against.
 *
 * The three frameworks (ten-moat for equities, five-pillar for crypto,
 * three-pillar for commodities) have different keys and different meanings, so
 * anything that renders pillars generically — the peer moat comparison, the
 * research moat matrix, the Markdown mirrors — needs both the label table and a
 * way to ask an asset which pillars it actually has.
 */
import type { MoatAssessmentData, MoatStatus, StockAnalysisData } from '@/types/stockAnalysis';
import type { TenMoatKey } from '@/types/research';

export const TEN_MOAT_LABELS: Record<TenMoatKey, string> = {
  learnedInterfaces: 'Learned Interfaces',
  businessLogic: 'Business Logic',
  publicDataAccess: 'Public Data',
  talentScarcity: 'Talent Scarcity',
  bundling: 'Bundling',
  proprietaryData: 'Proprietary Data',
  regulatoryLockIn: 'Regulatory Lock-In',
  networkEffects: 'Network Effects',
  transactionEmbedding: 'Transaction Embedding',
  systemOfRecord: 'System of Record',
};

export const CRYPTO_MOAT_LABELS: Record<string, string> = {
  networkEffects: 'Network Effects',
  schellingPoint: 'Schelling Point',
  credibleNeutrality: 'Credible Neutrality',
  regulatoryIncumbency: 'Regulatory Incumbency',
  securityBudget: 'Security Budget',
};

export const COMMODITY_MOAT_LABELS: Record<string, string> = {
  absoluteScarcity: 'Absolute Scarcity',
  monetaryHistory: 'Monetary History',
  industrialUtility: 'Industrial Utility',
};

export interface MoatPillar {
  key: string;
  label: string;
  status: MoatStatus;
  note: string;
}

/** Fields on the moat objects that are not pillars. */
const NON_PILLAR_KEYS = new Set(['verdict', 'primaryMoat']);

/**
 * The pillars an asset is actually scored on, in framework order. Returns an
 * empty list for an asset carrying no moat block at all.
 */
export function moatPillarsFor(data: StockAnalysisData): MoatPillar[] {
  const asRecord = (moats: object) => moats as unknown as Record<string, unknown>;
  const framework = data.tenMoats
    ? { moats: asRecord(data.tenMoats), labels: TEN_MOAT_LABELS as Record<string, string> }
    : data.cryptoMoats
      ? { moats: asRecord(data.cryptoMoats), labels: CRYPTO_MOAT_LABELS }
      : data.commodityMoats
        ? { moats: asRecord(data.commodityMoats), labels: COMMODITY_MOAT_LABELS }
        : null;
  if (!framework) return [];

  return Object.entries(framework.moats)
    .filter(([key, value]) => !NON_PILLAR_KEYS.has(key) && value && typeof value === 'object')
    .map(([key, value]) => {
      const assessment = value as MoatAssessmentData;
      return {
        key,
        label: framework.labels[key] ?? key,
        status: assessment.status,
        note: assessment.note,
      };
    });
}
