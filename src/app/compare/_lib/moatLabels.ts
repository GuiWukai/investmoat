import type { MoatStatus } from '@/types/stockAnalysis';

export const TEN_MOAT_KEYS = [
  'networkEffects',
  'proprietaryData',
  'systemOfRecord',
  'regulatoryLockIn',
  'transactionEmbedding',
  'businessLogic',
  'bundling',
  'learnedInterfaces',
  'talentScarcity',
  'publicDataAccess',
] as const;
export type TenMoatKey = (typeof TEN_MOAT_KEYS)[number];

export const MOAT_LABELS: Record<TenMoatKey, { label: string; weight: number; group: 'resilient' | 'vulnerable' }> = {
  networkEffects:       { label: 'Network Effects',       weight: 15, group: 'resilient'  },
  proprietaryData:      { label: 'Proprietary Data',      weight: 12, group: 'resilient'  },
  systemOfRecord:       { label: 'System of Record',      weight: 12, group: 'resilient'  },
  regulatoryLockIn:     { label: 'Regulatory Lock-In',    weight: 11, group: 'resilient'  },
  transactionEmbedding: { label: 'Transaction Embedding', weight: 10, group: 'resilient'  },
  businessLogic:        { label: 'Business Logic',        weight: 14, group: 'vulnerable' },
  bundling:             { label: 'Bundling',              weight: 10, group: 'vulnerable' },
  learnedInterfaces:    { label: 'Learned Interfaces',    weight:  8, group: 'vulnerable' },
  talentScarcity:       { label: 'Talent Scarcity',       weight:  5, group: 'vulnerable' },
  publicDataAccess:     { label: 'Public Data Access',    weight:  3, group: 'vulnerable' },
};

export const STATUS_STYLES: Record<MoatStatus, { label: string; text: string; bg: string; border: string }> = {
  strong:    { label: 'Strong',    text: 'text-emerald-300', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30' },
  intact:    { label: 'Intact',    text: 'text-blue-300',    bg: 'bg-blue-500/15',    border: 'border-blue-500/30'    },
  weakened:  { label: 'Weakened',  text: 'text-amber-300',   bg: 'bg-amber-500/15',   border: 'border-amber-500/30'   },
  destroyed: { label: 'Destroyed', text: 'text-rose-300',    bg: 'bg-rose-500/15',    border: 'border-rose-500/30'    },
};

export function scoreColor(s: number) {
  if (s >= 90) return 'text-emerald-400';
  if (s >= 80) return 'text-blue-400';
  if (s >= 70) return 'text-amber-400';
  return 'text-rose-400';
}

export function scoreBgColor(s: number) {
  if (s >= 90) return { text: '#10b981', bg: 'rgba(16, 185, 129, 0.1)',  border: 'rgba(16, 185, 129, 0.25)'  };
  if (s >= 80) return { text: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)',  border: 'rgba(59, 130, 246, 0.25)'  };
  if (s >= 70) return { text: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)',  border: 'rgba(245, 158, 11, 0.25)'  };
  return         { text: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)',   border: 'rgba(239, 68, 68, 0.25)'   };
}
