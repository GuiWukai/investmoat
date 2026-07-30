/**
 * Shared risk factors — the controlled vocabulary behind correlation-aware
 * position sizing.
 *
 * WHY THIS EXISTS. The composite scores each name on its own merits and the
 * weighting scheme then sizes positions by score. Nothing in that pipeline can
 * see that several high-scoring names are the *same bet*. In the July 2026 book
 * the top ten holdings resolved to one variable — whether AI capital
 * expenditure holds — in eight cases out of ten, yet they were sized as ten
 * independent 4–5% positions. A 10% per-name cap does not constrain a portfolio
 * whose names move together; it just splits one oversized bet across more
 * tickers and reports a lower number for each.
 *
 * WHAT COUNTS AS A FACTOR. A factor is a *common driver* whose realisation hits
 * every member at once. It is not a common *shape*. "Single-asset execution
 * risk" is a shape: NexGen's Rook I schedule and Rocket Lab's Neutron schedule
 * are both binary project risks, and they are uncorrelated — one slipping says
 * nothing about the other. "AI capital expenditure" is a driver: if hyperscaler
 * capex is cut, ASML, KLA, Vertiv and Constellation all re-rate together and
 * so do the hyperscalers doing the cutting. Only drivers belong here, because
 * only drivers justify a haircut.
 *
 * DIRECTION IS DELIBERATELY IGNORED. `ai-capex` covers both the companies that
 * sell into the buildout and the hyperscalers whose free cash flow it consumes.
 * On the fundamentals those are opposite signs — a capex cut helps Microsoft's
 * FCF and hurts KLA's bookings. On the tape they are one trade: the June–July
 * 2026 AI de-rating took both down together. Factors here model what moves
 * prices together, which is the only thing position sizing can act on.
 *
 * DELIBERATELY COARSE. Seventeen factors over ~130 names means most names carry
 * one to three. A finer vocabulary would push the average membership toward one
 * name per factor, at which point nothing clusters and the cap never binds —
 * the failure mode of factor models built to avoid ever disagreeing with the
 * portfolio they score.
 *
 * AN EMPTY LIST IS A REAL ANSWER. A name whose key risk has no shared driver in
 * this vocabulary carries `[]`, and the field is required precisely so that
 * saying so is a deliberate act rather than an omission. Inventing a label to
 * avoid an empty array would fabricate the correlation the mechanism exists to
 * measure.
 */

export const RISK_FACTORS = {
  'ai-capex': {
    label: 'AI capex cycle',
    description:
      'Hyperscaler AI capital expenditure. Covers both sides: suppliers whose bookings depend on it ' +
      'and the hyperscalers whose free cash flow it consumes.',
  },
  'semiconductor-cycle': {
    label: 'Semiconductor cycle',
    description:
      'Foundry, memory and wafer-fab-equipment cyclicality, node transitions, and export-control ' +
      'exposure — distinct from AI capex, which is only one source of demand.',
  },
  'software-displacement': {
    label: 'Software displacement',
    description:
      'An incumbent platform or an AI-native substitute absorbing a software franchise — hyperscaler ' +
      'bundling and generative-AI commoditisation, which erode switching costs the same way.',
  },
  'digital-advertising': {
    label: 'Digital advertising',
    description: 'The level of digital ad spend and the platform dynamics that route it.',
  },
  'consumer-spending': {
    label: 'Consumer spending',
    description:
      'Discretionary consumer demand and the volumes that ride on it — predominantly US, but any ' +
      'consumer-facing franchise whose units turn on household budgets.',
  },
  'china-demand': {
    label: 'China demand & policy',
    description:
      'Chinese end-demand plus the policy and geopolitical apparatus around it — tariffs, entity ' +
      'listings, export controls, domestic-champion substitution.',
  },
  'industrial-capex': {
    label: 'Industrial capex',
    description: 'Factory automation, grid, and general industrial capital spending cycles.',
  },
  'interest-rates': {
    label: 'Interest rates',
    description: 'The level and direction of rates, and the volumes and multiples that key off them.',
  },
  'credit-cycle': {
    label: 'Credit cycle',
    description: 'Corporate and consumer credit losses, issuance volumes, and reserve builds.',
  },
  'equity-market-level': {
    label: 'Equity market level',
    description: 'Fee and AUM streams that scale directly with broad equity market levels.',
  },
  'crypto-cycle': {
    label: 'Crypto cycle',
    description: 'Crypto asset prices and the transaction volumes they drive.',
  },
  'commodity-price': {
    label: 'Commodity price',
    description: 'The realised price of a mined or produced commodity the business is a price-taker on.',
  },
  'platform-regulation': {
    label: 'Platform regulation',
    description:
      'Antitrust, app-store, interchange, privacy and marketplace regulation aimed at platform economics.',
  },
  'healthcare-policy': {
    label: 'Healthcare policy',
    description: 'CMS, FDA and reimbursement policy, and enforcement against delivery models.',
  },
  'drug-competition': {
    label: 'Drug competition',
    description: 'Head-to-head clinical readouts and commercial share shifts between therapeutics.',
  },
  'defense-budget': {
    label: 'Defense & security budgets',
    description: 'Government defence, public-safety and national-security appropriations.',
  },
  'quantum-commercialisation': {
    label: 'Quantum commercialisation',
    description:
      'Whether fault-tolerant quantum computing arrives on the roadmaps the sector is priced against. ' +
      'A single scaling or error-correction disappointment re-rates every listed name at once.',
  },
} as const;

export type RiskFactor = keyof typeof RISK_FACTORS;

export const RISK_FACTOR_KEYS = Object.keys(RISK_FACTORS) as RiskFactor[];

export function isRiskFactor(value: string): value is RiskFactor {
  return Object.prototype.hasOwnProperty.call(RISK_FACTORS, value);
}

export function riskFactorLabel(factor: string): string {
  return isRiskFactor(factor) ? RISK_FACTORS[factor].label : factor;
}
