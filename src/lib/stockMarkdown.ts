import type { StockAnalysisData } from '@/types/stockAnalysis';
import {
  computeAssetMoatScore,
  computeGrowthScore,
  computeComposite,
  computeRecommendation,
} from '@/lib/valuationScore';
import { buildPeerComparison, notableMoatGaps, rankLabel } from '@/lib/peerComparison';

const SITE_URL = 'https://investmoat.com';

export interface StockScores {
  moat: number;
  growth: number;
  valuation: number;
  composite: number;
  recommendation: string;
}

/** Compute the four headline scores + recommendation for a stock. */
export function computeStockScores(data: StockAnalysisData): StockScores {
  const moat = computeAssetMoatScore(data);
  const growth = computeGrowthScore(data.growth.growthAnalysis) ?? 0;
  const valuation = data.valuation.score;
  return {
    moat,
    growth,
    valuation,
    composite: computeComposite(moat, growth, valuation),
    recommendation: computeRecommendation(moat, growth, valuation),
  };
}

/**
 * The peer-group section, mirroring the Industry Comparison on the page.
 *
 * Scores here are the static ones — this document is cacheable and has no live
 * prices — so the valuation column is the JSON figure for every name in the
 * group, which keeps the comparison internally consistent even though the page
 * will show fresher numbers.
 */
function peerSection(data: StockAnalysisData): string[] {
  const model = buildPeerComparison(data.ticker, {});
  if (!model) return [];

  const composite = model.standings[0];
  const lines: string[] = [];

  lines.push(`## Peer group — ${model.group.label}`);
  lines.push('');
  lines.push(model.group.basis);
  lines.push('');
  lines.push(
    `${data.ticker} ranks **${rankLabel(composite)}** in this group on composite score, against a group ` +
      `median of ${composite.median}.`,
  );
  lines.push('');

  lines.push('| Ticker | Name | Moat | Growth | Valuation | Composite | Recommendation |');
  lines.push('| --- | --- | --- | --- | --- | --- | --- |');
  for (const r of model.rows) {
    const mark = r.ticker === data.ticker ? '**' : '';
    lines.push(
      `| ${mark}${r.ticker}${mark} | ${r.name} | ${r.moat} | ${r.growth} | ${r.valuation} | ${r.composite} | ${r.recommendation} |`,
    );
  }
  lines.push('');

  const { stronger, weaker } = notableMoatGaps(model.moatGaps);
  if (stronger.length || weaker.length) {
    lines.push('Moat pillars where this asset is assessed differently from most of its group:');
    lines.push('');
    for (const gap of stronger) {
      lines.push(`- **Ahead — ${gap.label}:** ${gap.status} (${gap.peersBelow} peer(s) rate it lower).`);
    }
    for (const gap of weaker) {
      lines.push(`- **Behind — ${gap.label}:** ${gap.status} (${gap.peersAbove} peer(s) rate it higher).`);
    }
    lines.push('');
  }

  lines.push(
    'Peer groups are defined in src/data/peerGroups.ts. Every member shares one asset class, so the ' +
      'scores in this table rank against each other.',
  );
  lines.push('');

  return lines;
}

function moatVerdict(data: StockAnalysisData): string | undefined {
  return (
    data.tenMoats?.verdict ??
    data.cryptoMoats?.verdict ??
    data.commodityMoats?.verdict
  );
}

/**
 * Render a single stock analysis as clean, self-contained Markdown intended
 * for LLM/agent consumption. This mirrors the visual /stocks/[slug] page but
 * strips all interactive chrome so an agent gets the underwriting thesis, the
 * derived scores, and the bear/base/bull scenarios in one linear document.
 */
export function stockToMarkdown(data: StockAnalysisData): string {
  const s = computeStockScores(data);
  const assetClass = data.assetClass ?? 'equity';
  const url = `${SITE_URL}/stocks/${data.slug}`;
  const lines: string[] = [];

  lines.push(`# ${data.name} (${data.ticker}) — InvestMoat Analysis`);
  lines.push('');
  if (data.lastAnalyzed) lines.push(`_Last analyzed: ${data.lastAnalyzed}_`);
  lines.push(`_Asset class: ${assetClass} · Canonical page: ${url}_`);
  lines.push('');

  lines.push('## Scores');
  lines.push('');
  lines.push('| Dimension | Score (0–100) |');
  lines.push('| --- | --- |');
  lines.push(`| Moat durability | ${s.moat} |`);
  lines.push(`| Growth trajectory | ${s.growth} |`);
  lines.push(`| Valuation | ${s.valuation} |`);
  lines.push(`| **Composite** | **${s.composite}** |`);
  lines.push(`| **Recommendation** | **${s.recommendation}** |`);
  lines.push('');
  lines.push(
    'Scores are computed deterministically from this asset’s data by the ' +
      'InvestMoat formula (see https://investmoat.com/llms.txt for methodology). ' +
      'Scores are not directly comparable across asset classes.',
  );
  lines.push('');

  lines.push(...peerSection(data));

  if (data.headerStats?.length) {
    lines.push('## Key stats');
    lines.push('');
    for (const stat of data.headerStats) {
      lines.push(`- **${stat.label}:** ${stat.value}`);
    }
    lines.push('');
  }

  // ─── Moat ───────────────────────────────────────────────────────────────
  lines.push('## Moat');
  lines.push('');
  if (data.moat.description) {
    lines.push(data.moat.description);
    lines.push('');
  }
  if (data.moat.analysisSummary) {
    lines.push(`### ${data.moat.analysisTitle || 'Moat analysis'}`);
    lines.push('');
    lines.push(data.moat.analysisSummary);
    lines.push('');
  }
  for (const point of data.moat.analysisPoints ?? []) {
    lines.push(`- **${point.title}:** ${point.text}`);
  }
  if (data.moat.analysisPoints?.length) lines.push('');
  const verdict = moatVerdict(data);
  if (verdict) {
    lines.push(`**Moat verdict:** ${verdict}`);
    lines.push('');
  }

  // ─── Growth ─────────────────────────────────────────────────────────────
  lines.push('## Growth');
  lines.push('');
  if (data.growth.description) {
    lines.push(data.growth.description);
    lines.push('');
  }
  const g = data.growth.growthAnalysis;
  if (g) {
    lines.push(`- **Revenue CAGR estimate:** ${g.cagrEstimate}`);
    lines.push(`- **Primary type:** ${g.primaryType}`);
    lines.push(`- **Margin trend:** ${g.marginTrend}`);
    lines.push(`- **Key risk (${g.keyRiskSeverity}):** ${g.keyRisk}`);
    if (g.drivers?.length) {
      lines.push('- **Drivers:**');
      for (const d of g.drivers) {
        lines.push(`  - ${d.name} — ${d.metric} (${d.trend})`);
      }
    }
    lines.push(`- **Score derivation:** ${g.scoreDerivation}`);
    lines.push('');
  }

  // ─── Valuation ──────────────────────────────────────────────────────────
  lines.push('## Valuation');
  lines.push('');
  if (data.valuation.description) {
    lines.push(data.valuation.description);
    lines.push('');
  }
  if (data.valuation.valuationNote) {
    lines.push(
      `**Fair value:** ${data.valuation.valuationNote.fairValue} — ${data.valuation.valuationNote.text}`,
    );
    lines.push('');
  }
  if (data.valuation.peAnalysis?.rows?.length) {
    const pe = data.valuation.peAnalysis;
    lines.push('| Multiple | Value | Note |');
    lines.push('| --- | --- | --- |');
    for (const row of pe.rows) {
      lines.push(`| ${row.label} | ${row.value} | ${row.note ?? ''} |`);
    }
    lines.push('');
    if (pe.summary) {
      lines.push(pe.summary + (pe.asOf ? ` _(as of ${pe.asOf})_` : ''));
      lines.push('');
    }
  }

  // ─── Scenarios ──────────────────────────────────────────────────────────
  lines.push('## Price scenarios');
  lines.push('');
  const scenarioOrder: Array<['bear' | 'base' | 'bull', string]> = [
    ['bear', 'Bear'],
    ['base', 'Base'],
    ['bull', 'Bull'],
  ];
  for (const [key, label] of scenarioOrder) {
    const sc = data.scenarios?.[key];
    if (!sc) continue;
    lines.push(`### ${label} — ${sc.priceTarget}`);
    lines.push('');
    if (sc.description) {
      lines.push(sc.description);
      lines.push('');
    }
    for (const p of sc.points ?? []) lines.push(`- ${p}`);
    lines.push('');
  }

  lines.push('---');
  lines.push('');
  lines.push(
    'InvestMoat is an open-source research and education framework. Nothing ' +
      'here is financial advice. Past performance does not guarantee future results.',
  );
  lines.push('');

  return lines.join('\n');
}
