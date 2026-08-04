/**
 * Prints the industry comparison a stock page would render, using static
 * valuation scores (no live prices). Run: npx tsx scripts/preview-peer-comparison.ts NVDA
 */
import { buildPeerComparison, ordinal } from '../src/lib/peerComparison';

const ticker = (process.argv[2] ?? 'NVDA').toUpperCase();
const model = buildPeerComparison(ticker, {});
if (!model) {
  console.error(`No peer group for ${ticker}`);
  process.exit(1);
}

console.log(`\n${model.group.label} — ${model.group.tickers.length} names`);
console.log(model.group.basis + '\n');
for (const s of model.standings) {
  console.log(
    `${s.label.padEnd(10)} ${String(s.value).padStart(3)}  ${ordinal(s.rank)} of ${s.count}  ` +
      `median ${s.median}  range ${s.min}–${s.max}`,
  );
}
console.log('');
for (const r of model.rows) {
  const mark = r.ticker === ticker ? '→' : ' ';
  console.log(`${mark} ${r.ticker.padEnd(10)} m${r.moat} g${r.growth} v${r.valuation}  = ${r.composite}  ${r.recommendation}`);
}
console.log('\nMoat gaps vs peers:');
for (const g of model.moatGaps) {
  console.log(`  ${g.direction === 'stronger' ? '+' : '-'} ${g.label}: ${g.status} (peer typical ${g.peerTypical}, ${g.peersBelow} below / ${g.peersAbove} above)`);
}
