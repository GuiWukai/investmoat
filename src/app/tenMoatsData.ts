// Types and utility for the Ten Moats framework.
// Moat assessment data now lives in src/data/stocks/*.json

export type MoatStatus = 'strong' | 'intact' | 'weakened' | 'destroyed';

export type CitationType = 'filing' | 'earnings-call' | 'press' | 'research' | 'data' | 'regulator';

export interface Citation {
  label: string;
  url?: string;
  type: CitationType;
  quote?: string;
  asOf?: string;
}

export interface MoatAssessment {
  status: MoatStatus;
  note: string;
  citations?: Citation[];
}

export interface TenMoatsAssessment {
  // AI-Vulnerable Moats (weakened or destroyed by AI)
  learnedInterfaces: MoatAssessment;
  businessLogic: MoatAssessment;
  publicDataAccess: MoatAssessment;
  talentScarcity: MoatAssessment;
  bundling: MoatAssessment;
  // AI-Resilient Moats (intact or stronger with AI)
  proprietaryData: MoatAssessment;
  regulatoryLockIn: MoatAssessment;
  networkEffects: MoatAssessment;
  transactionEmbedding: MoatAssessment;
  systemOfRecord: MoatAssessment;
  // Summary
  verdict: string;
}
