/**
 * Peer groups — the comparison set behind every stock page's Industry
 * Comparison section.
 *
 * WHY THIS EXISTS. A moat score of 74 means nothing on its own. The rubric is
 * calibrated against the whole coverage universe (see PILLAR_CALIBRATION in
 * valuationScore.ts), so a score says where an asset sits among 131 unrelated
 * names — which is the wrong question when the reader is choosing between two
 * chipmakers. A 74 that is the best network-effects score any semicap vendor
 * can earn reads very differently from a 74 that is the worst in enterprise
 * software. The group supplies that missing denominator.
 *
 * WHY NOT THE EXISTING CATEGORY FIELD. `category` in src/app/stockData.ts has
 * six values and exists to draw filter pills; "Big Tech" holds 52 names that
 * share nothing a comparison could rest on. Peer groups are deliberately
 * narrow: each is a set of businesses that face the same customers, the same
 * substitution threat, or the same commodity, so that a pillar-by-pillar
 * difference between two members is a claim about the businesses rather than
 * an artefact of comparing a miner with a payment network.
 *
 * RULES (enforced by `npm run validate:stocks`):
 *   • Every ticker in allCoverageData belongs to exactly one group.
 *   • No group references a ticker that is not in coverage.
 *   • Groups hold at least MIN_PEER_GROUP_SIZE members — two names make a
 *     coin-flip, not a distribution.
 *   • Every member of a group shares one assetClass. Scores are not comparable
 *     across the equity / crypto / commodity frameworks (see AssetClass in
 *     src/types/stockAnalysis.ts), so a group that mixes them would rank a
 *     protocol's monetary moat against a company's pricing power.
 *
 * `basis` is the editorial part: it states what the group claims its members
 * have in common, so a reader can reject the comparison rather than absorb it.
 */

export interface PeerGroup {
  /** Stable identifier — safe to use in URLs and analytics. */
  id: string;
  /** Display name, e.g. "Semiconductors & Compute". */
  label: string;
  /** One sentence on what makes these names comparable. Shown to the reader. */
  basis: string;
  tickers: string[];
}

/** Below three members a "rank" and a "group median" are noise. */
export const MIN_PEER_GROUP_SIZE = 3;

export const peerGroups: PeerGroup[] = [
  {
    id: 'mega-cap-platforms',
    label: 'Mega-Cap Platforms',
    basis:
      'Platforms that own a distribution surface — an OS, a search box, a feed, a storefront — and monetise everything that crosses it.',
    tickers: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META'],
  },
  {
    id: 'ai-cloud-capacity',
    label: 'AI Cloud Capacity',
    basis:
      'Sellers of contracted compute. Each carries the capital cost of the fleet up front and earns it back over contract lives it does not control.',
    tickers: ['ORCL', 'CRWV', 'NBIS'],
  },
  {
    id: 'ai-systems-and-networking',
    label: 'AI Systems & Networking',
    basis:
      'The box, the rack and the fabric around the accelerator — businesses whose volumes track datacentre build-out and whose margins depend on how much of the system they own.',
    tickers: ['DELL', 'SMCI', 'ANET'],
  },
  {
    id: 'semiconductors-compute',
    label: 'Semiconductors & Compute',
    basis:
      'Chip designers competing on architecture and the software ecosystem around it, all of them fabless and all of them exposed to the same foundry.',
    tickers: ['NVDA', 'AMD', 'AVGO', 'QCOM', 'ARM', 'CRDO'],
  },
  {
    id: 'semiconductor-manufacturing',
    label: 'Semiconductor Manufacturing',
    basis:
      'Fabs, memory lines and packaging — capital-intensive capacity where the moat question is process lead and utilisation, not product.',
    tickers: ['TSM', 'MU', '005930.KS', 'AMKR'],
  },
  {
    id: 'semiconductor-equipment',
    label: 'Semiconductor Equipment & Test',
    basis:
      'Tool and instrument vendors selling into the same fab capex budget, each defended by qualification cycles that make switching a multi-year project.',
    tickers: ['ASML', 'KLAC', 'TER', 'KEYS'],
  },
  {
    id: 'design-software',
    label: 'Design & Engineering Software',
    basis:
      'Tools whose moat is a trained user base, a file format and a certified flow — the cost of leaving is retraining, not licence price.',
    tickers: ['SNPS', 'CDNS', 'ADBE', 'FIG'],
  },
  {
    id: 'cybersecurity',
    label: 'Cybersecurity & Edge',
    basis:
      'Security platforms sold to the same CISO budget, consolidating point products and competing on how much of the estate one agent or edge can cover.',
    tickers: ['CRWD', 'PANW', 'OKTA', 'NET'],
  },
  {
    id: 'data-platforms',
    label: 'Data & Analytics Platforms',
    basis:
      'Consumption-billed platforms that hold the data or the model of the business — revenue follows workload, so the moat claim is that the workload cannot be moved.',
    tickers: ['SNOW', 'DDOG', 'MDB', 'PLTR'],
  },
  {
    id: 'enterprise-applications',
    label: 'Enterprise Applications',
    basis:
      'Seat-billed systems of record. Each owns a workflow the customer runs the business on, and each faces the same question about what a seat is worth once agents do the work.',
    tickers: ['CRM', 'NOW', 'INTU'],
  },
  {
    id: 'digital-advertising',
    label: 'Digital Advertising',
    basis:
      'Businesses paid for conversions they can prove. All of them depend on signal they either own or rent, and all of them are priced off the same ad budget.',
    tickers: ['APP', 'TTD', 'ZETA', 'RDDT'],
  },
  {
    id: 'consumer-subscription-media',
    label: 'Consumer Subscription & Media',
    basis:
      'Direct consumer relationships billed monthly. The moat lives in retention and content economics, not in switching cost — cancelling takes one click.',
    tickers: ['NFLX', 'SPOT', 'DIS', 'RBLX', 'DUOL'],
  },
  {
    id: 'local-marketplaces',
    label: 'Local & Travel Marketplaces',
    basis:
      'Two-sided marketplaces for physical supply, where liquidity is local: a network advantage in one city does not transfer to the next.',
    tickers: ['UBER', 'DASH', 'ABNB'],
  },
  {
    id: 'commerce-and-retail',
    label: 'Commerce & Retail',
    basis:
      'Businesses that own the retail transaction, whether the storefront is a warehouse, a marketplace or an API.',
    tickers: ['COST', 'SHOP', 'MELI', 'SE'],
  },
  {
    id: 'china-internet',
    label: 'China Internet',
    basis:
      'Chinese platforms sharing one regulator, one domestic demand cycle and one listing-structure discount, which dominate any per-company difference.',
    tickers: ['BABA', 'PDD', 'BIDU'],
  },
  {
    id: 'exchanges-and-payment-rails',
    label: 'Exchanges & Payment Rails',
    basis:
      'Toll booths on transaction flow. They take a fee per event, carry no inventory risk, and their volumes rise with activity rather than with price levels.',
    tickers: ['ICE', 'V', 'MA'],
  },
  {
    id: 'financial-data-and-ratings',
    label: 'Financial Data & Ratings',
    basis:
      'Sellers of a benchmark or an opinion embedded in someone else\u2019s mandate — the product is cited by contract, which is what makes the pricing stick.',
    tickers: ['SPGI', 'MCO', 'MSCI', 'FICO'],
  },
  {
    id: 'capital-markets',
    label: 'Banks & Capital Markets',
    basis:
      'Balance-sheet businesses earning on advice, financing and fee streams, all marked to the same rate cycle and the same capital rules.',
    tickers: ['JPM', 'GS', 'MS', 'BX', 'KKR'],
  },
  {
    id: 'consumer-fintech',
    label: 'Consumer Fintech',
    basis:
      'Retail-facing financial apps monetising trading, spread and interest on customer balances — earnings track engagement and rates, not contracted revenue.',
    tickers: ['SOFI', 'HOOD', 'COIN'],
  },
  {
    id: 'asset-vehicles',
    label: 'Listed Asset Vehicles',
    basis:
      'Wrappers rather than operating businesses. The scores describe what each vehicle holds, so read them as a claim about the holdings.',
    tickers: ['VOO', 'SOXX', 'MSTR'],
  },
  {
    id: 'pharmaceuticals',
    label: 'Pharmaceuticals & Biotech',
    basis:
      'Patent-cliff businesses. Every moat here has an expiry date printed on it, so the comparison is really about what replaces the current franchise.',
    tickers: ['LLY', 'NVO', 'VRTX', 'REGN'],
  },
  {
    id: 'healthcare-delivery-and-tools',
    label: 'Healthcare Delivery & Tools',
    basis:
      'The delivery side of healthcare — benefits, care, instruments and the consumables around them — all priced against reimbursement rather than a free market.',
    tickers: ['UNH', 'ELV', 'HIMS', 'TMO', 'ISRG'],
  },
  {
    id: 'aerospace-defense',
    label: 'Aerospace, Defense & Space',
    basis:
      'Programme businesses selling to governments and certified fleets, where the moat is a qualification or a launch cadence competitors cannot buy.',
    tickers: ['LMT', 'TDG', 'SPCX', 'RKLB', 'AXON'],
  },
  {
    id: 'electrification-and-building-systems',
    label: 'Electrification & Building Systems',
    basis:
      'Suppliers of the electrical and thermal plumbing behind the grid and datacentre build-out, all constrained by the same backlog and lead times.',
    tickers: ['ETN', 'TT', 'HON', 'PWR', 'VRT'],
  },
  {
    id: 'industrial-machinery',
    label: 'Industrial Machinery & Automation',
    basis:
      'Capital equipment sold into industrial capex cycles, defended by dealer networks, installed base and aftermarket rather than by product spec.',
    tickers: ['CAT', 'DE', 'FANUY', '6861.T', 'ROK', 'HSYDF'],
  },
  {
    id: 'power-producers',
    label: 'Power Producers & Utilities',
    basis:
      'Owners of generation selling into the same load growth, where returns are set by rate cases and contracted offtake rather than by pricing power.',
    tickers: ['CEG', 'VST', 'NEE'],
  },
  {
    id: 'energy-equipment-and-fuels',
    label: 'Energy Equipment & Fuels',
    basis:
      'Turbines, engines, cells and export terminals — the hardware and infrastructure the energy build-out is bought with, all cycle-exposed and backlog-driven.',
    tickers: ['GEV', 'BE', 'INIO', 'LNG'],
  },
  {
    id: 'mining-and-fuel-cycle',
    label: 'Mining & Nuclear Fuel Cycle',
    basis:
      'Ore bodies and enrichment capacity. None of them sets its selling price, so the moat questions are reserve quality, cost-curve position and permits.',
    tickers: ['FCX', 'KNT', 'CCJ', 'KAP', 'NXE', 'UEC', 'LEU'],
  },
  {
    id: 'brand-led-consumer',
    label: 'Brand-Led Consumer',
    basis:
      'Manufacturers whose stated moat is the badge: buyers pay a premium for the brand, so the test is whether pricing holds when volumes stall.',
    tickers: ['RACE', 'TSLA', 'NKE', 'LULU', 'EL'],
  },
  {
    id: 'quantum-computing',
    label: 'Quantum Computing',
    basis:
      'Pre-commercial hardware bets. Revenue is immaterial for all of them, so the scores compare research position and funding runway, not businesses.',
    tickers: ['IONQ', 'QBTS', 'RGTI', 'QUBT'],
  },
  {
    id: 'crypto-protocols',
    label: 'Crypto Protocols',
    basis:
      'Monetary and settlement networks scored on the five-pillar protocol framework — comparable to each other and to nothing else in coverage.',
    tickers: ['BTC', 'ETH', 'SOL'],
  },
  {
    id: 'commodities',
    label: 'Commodities',
    basis:
      'Physical assets scored on the three-pillar commodity framework: scarcity, monetary history and industrial demand.',
    tickers: ['XAU', 'XAG', 'HG'],
  },
];

const groupByTicker: Record<string, PeerGroup> = Object.fromEntries(
  peerGroups.flatMap((group) => group.tickers.map((ticker) => [ticker, group] as const)),
);

/** The peer group a ticker belongs to, or null if it has not been assigned one. */
export function getPeerGroup(ticker: string): PeerGroup | null {
  return groupByTicker[ticker] ?? null;
}

/** The other members of a ticker's group, in declaration order. */
export function getPeers(ticker: string): string[] {
  return getPeerGroup(ticker)?.tickers.filter((t) => t !== ticker) ?? [];
}
