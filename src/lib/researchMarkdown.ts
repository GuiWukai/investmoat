import type { ResearchArticleData, ResearchBlock, TenMoatKey } from '@/types/research';
import type { StockAnalysisData } from '@/types/stockAnalysis';
import { getStockData } from '@/data/stocks';
import { allCoverageData } from '@/app/stockData';
import { computeStockScores } from '@/lib/stockMarkdown';

const SITE_URL = 'https://investmoat.com';

const MOAT_LABELS: Record<TenMoatKey, string> = {
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

const slugForTicker: Record<string, string> = Object.fromEntries(
  allCoverageData.map((s) => [s.ticker, s.slug]),
);

function dataForTicker(ticker: string): StockAnalysisData | null {
  const slug = slugForTicker[ticker];
  return slug ? getStockData(slug) : null;
}

/** Markdown table row helper. */
function row(cells: string[]): string {
  return `| ${cells.join(' | ')} |`;
}

function separator(count: number): string {
  return `|${' --- |'.repeat(count)}`;
}

function renderBlock(block: ResearchBlock, lines: string[]): void {
  switch (block.type) {
    case 'heading':
      lines.push(`## ${block.text}`, '');
      break;

    case 'prose':
      lines.push(block.body, '');
      break;

    case 'list':
      block.items.forEach((item, i) => {
        lines.push(block.ordered ? `${i + 1}. ${item}` : `- ${item}`);
      });
      lines.push('');
      break;

    case 'callout':
      lines.push(`> **${block.title ?? block.tone.toUpperCase()}** — ${block.body}`, '');
      break;

    case 'table':
      if (block.caption) lines.push(`**${block.caption}**`, '');
      lines.push(row(block.columns), separator(block.columns.length));
      block.rows.forEach((r) => lines.push(row(r)));
      lines.push('', `_Figures as of ${block.asOf}._`, '');
      break;

    case 'stat-strip': {
      const parts = block.stats.map((stat) => {
        if (stat.live) {
          const data = dataForTicker(stat.live.ticker);
          if (!data) return `${stat.label}: —`;
          if (stat.live.field === 'price') return `${stat.label}: (live)`;
          const scores = computeStockScores(data);
          return `${stat.label}: ${scores[stat.live.field]}`;
        }
        return `${stat.label}: ${stat.value}`;
      });
      lines.push(parts.join(' · '), '');
      break;
    }

    case 'scorecard': {
      if (block.caption) lines.push(`**${block.caption}**`, '');
      const columns = ['Ticker', 'Name', 'Moat', 'Growth', 'Valuation', 'Composite', 'Rec', 'Note'];
      lines.push(row(columns), separator(columns.length));

      const groups = block.groups ?? [{ label: '', tickers: block.tickers }];
      for (const group of groups) {
        if (group.label) lines.push(row([`**${group.label}**`, ...Array(7).fill('')]));
        const resolved = group.tickers
          .map((ticker) => {
            const data = dataForTicker(ticker);
            if (!data) return null;
            return { ticker, data, scores: computeStockScores(data) };
          })
          .filter((r): r is NonNullable<typeof r> => r !== null);

        if (block.sort && block.sort !== 'given') {
          const key = block.sort;
          resolved.sort((a, b) => b.scores[key] - a.scores[key]);
        }

        for (const { ticker, data, scores } of resolved) {
          lines.push(
            row([
              `[${ticker}](${SITE_URL}/stocks/${data.slug})`,
              data.name,
              String(scores.moat),
              String(scores.growth),
              String(scores.valuation),
              String(scores.composite),
              scores.recommendation,
              block.notes?.[ticker] ?? '',
            ]),
          );
        }
      }
      lines.push(
        '',
        '_Valuation and composite above use each asset\'s static valuation score; the live site recomputes them against the current market price._',
        '',
      );
      break;
    }

    case 'moat-matrix': {
      if (block.caption) lines.push(`**${block.caption}**`, '');
      const columns = ['Ticker', ...block.moats.map((m) => MOAT_LABELS[m])];
      lines.push(row(columns), separator(columns.length));

      const groups = block.groups ?? [{ label: '', tickers: block.tickers }];
      for (const group of groups) {
        if (group.label) {
          lines.push(row([`**${group.label}**`, ...Array(block.moats.length).fill('')]));
        }
        for (const ticker of group.tickers) {
          const data = dataForTicker(ticker);
          if (!data) continue;
          lines.push(
            row([
              `[${ticker}](${SITE_URL}/stocks/${data.slug})`,
              ...block.moats.map((m) => data.tenMoats?.[m]?.status ?? '—'),
            ]),
          );
        }
      }
      lines.push('');
      break;
    }
  }
}

/**
 * Render a research article as clean, self-contained Markdown for LLM/agent
 * consumption. Live blocks are resolved from the same stock data the visual
 * page uses, so the mirror never contradicts the article.
 */
export function researchToMarkdown(article: ResearchArticleData): string {
  const url = `${SITE_URL}/research/${article.slug}`;
  const lines: string[] = [];

  lines.push(`# ${article.title} — InvestMoat Research`);
  lines.push('');
  lines.push(`_${article.dek}_`);
  lines.push('');
  lines.push(
    `_Published: ${article.published} · Last reviewed: ${article.lastReviewed} · Canonical page: ${url}_`,
  );
  lines.push(`_Tags: ${article.tags.join(', ')}_`);
  lines.push(`_Covers: ${article.tickers.join(', ')}_`);
  lines.push('');

  lines.push('## Summary');
  lines.push('');
  lines.push(article.summary);
  lines.push('');

  if (article.falsifiableBy) {
    lines.push('## What would prove this wrong');
    lines.push('');
    lines.push(article.falsifiableBy);
    lines.push('');
  }

  lines.push('---');
  lines.push('');

  for (const block of article.blocks) {
    renderBlock(block, lines);
  }

  lines.push('---');
  lines.push('');
  lines.push(
    'Scores are computed deterministically from each asset\'s data file: composite = ' +
      'Moat^0.40 × Growth^0.30 × Valuation^0.30, scaled to 0–100. Recommendation bands: ' +
      'Strong Buy ≥ 82, Accumulate ≥ 75, Hold ≥ 68, Speculative Buy ≥ 60, otherwise Avoid.',
  );
  lines.push('');
  lines.push(
    `Full analyses for every name above: ${SITE_URL}/stocks. Site index for agents: ${SITE_URL}/llms.txt`,
  );
  lines.push('');
  lines.push(
    'InvestMoat is an open-source research and education framework. Nothing here is financial advice.',
  );

  return lines.join('\n');
}
