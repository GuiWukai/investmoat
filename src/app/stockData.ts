// Moat scores are sourced from each stock's JSON file (src/data/stocks/*.json).
// The scores array is [moatScore, growthScore, valuationScore].
// bearTarget/baseTarget/bullTarget mirror the scenarios in each stock's JSON.
//
// RULES (enforced dynamically below):
//   • Maximum 20 stocks in the portfolio
//   • Minimum average score of 75 required for inclusion
//
// To add a new stock: add it to allCoverageData. Portfolio/excluded are derived automatically.

// Weighted composite: Moat 40% · Growth 35% · Valuation 25%
// scores = [moatScore, growthScore, valuationScore]
// Returns a float for precise sorting/comparison; callers round for display.
export const getAverageScore = ([moat, growth, valuation]: number[]) =>
    moat * 0.40 + growth * 0.35 + valuation * 0.25;

const MAX_PORTFOLIO  = 20;
const MIN_AVG_SCORE  = 75;

// ─── All analyzed stocks (single source of truth) ─────────────────────────────
const allCoverageData = [
    { name: "MercadoLibre",      ticker: "MELI", slug: "meli",        scores: [78, 90, 78], href: "/stocks/meli",        category: "Other",       bearTarget: "$1,000",    baseTarget: "$2,200",    bullTarget: "$3,500"    },
    { name: "Ferrari",           ticker: "RACE", slug: "race",        scores: [82, 67, 78], href: "/stocks/race",        category: "Other",       bearTarget: "$280",      baseTarget: "$480",      bullTarget: "$700"      },
    { name: "Constellation Energy", ticker: "CEG", slug: "ceg",      scores: [76, 72, 71], href: "/stocks/ceg",         category: "Other",       bearTarget: "$200",      baseTarget: "$420",      bullTarget: "$650"      },
    { name: "UnitedHealth",      ticker: "UNH",  slug: "unh",         scores: [88, 75, 78], href: "/stocks/unh",         category: "Healthcare",  bearTarget: "$200",      baseTarget: "$380",      bullTarget: "$600"      },
    { name: "Moody's",           ticker: "MCO",  slug: "mco",         scores: [90, 80, 76], href: "/stocks/mco",         category: "Financials",  bearTarget: "$340",      baseTarget: "$560",      bullTarget: "$750"      },
    { name: "Microsoft",         ticker: "MSFT", slug: "msft",        scores: [84, 88, 74], href: "/stocks/msft",        category: "Big Tech",    bearTarget: "$300",      baseTarget: "$450",      bullTarget: "$580"      },
    { name: "Mastercard",        ticker: "MA",   slug: "mastercard",  scores: [88, 88, 71], href: "/stocks/mastercard",  category: "Financials",  bearTarget: "$400",      baseTarget: "$555",      bullTarget: "$700"      },
    { name: "ASML",              ticker: "ASML", slug: "asml",        scores: [94, 80, 83], href: "/stocks/asml",        category: "Big Tech",    bearTarget: "$900",      baseTarget: "$1,500",    bullTarget: "$2,200"    },
    { name: "NVIDIA",            ticker: "NVDA", slug: "nvda",        scores: [85, 95, 65], href: "/stocks/nvda",        category: "Big Tech",    bearTarget: "$100",      baseTarget: "$175",      bullTarget: "$280"      },
    { name: "Amazon",            ticker: "AMZN", slug: "amazon",      scores: [80, 88, 76], href: "/stocks/amazon",      category: "Big Tech",    bearTarget: "$145",      baseTarget: "$225",      bullTarget: "$310"      },
    { name: "S&P Global",        ticker: "SPGI", slug: "spgi",        scores: [88, 78, 78], href: "/stocks/spgi",        category: "Financials",  bearTarget: "$400",      baseTarget: "$500",      bullTarget: "$610"      },
    { name: "Visa",              ticker: "V",    slug: "visa",        scores: [90, 82, 71], href: "/stocks/visa",        category: "Financials",  bearTarget: "$245",      baseTarget: "$335",      bullTarget: "$420"      },
    { name: "Google",            ticker: "GOOGL",slug: "google",      scores: [88, 82, 72], href: "/stocks/google",      category: "Big Tech",    bearTarget: "$130",      baseTarget: "$200",      bullTarget: "$270"      },
    { name: "TSMC",              ticker: "TSM",  slug: "tsm",         scores: [90, 82, 70], href: "/stocks/tsm",         category: "Big Tech",    bearTarget: "$120",      baseTarget: "$200",      bullTarget: "$280"      },
    { name: "Intuit",            ticker: "INTU", slug: "intuit",      scores: [80, 84, 75], href: "/stocks/intuit",      category: "Financials",  bearTarget: "$300",      baseTarget: "$480",      bullTarget: "$650"      },
    { name: "Shopify",           ticker: "SHOP", slug: "shop",        scores: [78, 88, 73], href: "/stocks/shop",        category: "Big Tech",    bearTarget: "$80",       baseTarget: "$160",      bullTarget: "$240"      },
    { name: "Bitcoin",           ticker: "BTC",  slug: "btc",         scores: [76, 85, 77], href: "/stocks/btc",         category: "Hard Assets", bearTarget: "$45,000",   baseTarget: "$120,000",  bullTarget: "$300,000+" },
    { name: "Ethereum",          ticker: "ETH",  slug: "ethereum",    scores: [72, 80, 65], href: "/stocks/ethereum",    category: "Hard Assets", bearTarget: "$1,200",    baseTarget: "$5,500",    bullTarget: "$12,000"   },
    { name: "Solana",            ticker: "SOL",  slug: "solana",      scores: [58, 82, 62], href: "/stocks/solana",      category: "Hard Assets", bearTarget: "$55",       baseTarget: "$350",      bullTarget: "$800"      },
    { name: "Palantir",          ticker: "PLTR", slug: "pltr",        scores: [78, 88, 71], href: "/stocks/pltr",        category: "Big Tech",    bearTarget: "$80",       baseTarget: "$155",      bullTarget: "$260"      },
    { name: "Salesforce",        ticker: "CRM",  slug: "crm",         scores: [78, 80, 79], href: "/stocks/crm",         category: "Financials",  bearTarget: "$150",      baseTarget: "$250",      bullTarget: "$350"      },
    { name: "Broadcom",          ticker: "AVGO", slug: "avgo",        scores: [82, 88, 65], href: "/stocks/avgo",        category: "Big Tech",    bearTarget: "$120",      baseTarget: "$210",      bullTarget: "$320"      },
    { name: "CrowdStrike",       ticker: "CRWD", slug: "crowdstrike", scores: [85, 87, 60], href: "/stocks/crowdstrike", category: "Big Tech",    bearTarget: "$200",      baseTarget: "$380",      bullTarget: "$600"      },
    { name: "Meta",              ticker: "META", slug: "meta",        scores: [79, 85, 72], href: "/stocks/meta",        category: "Big Tech",    bearTarget: "$460",      baseTarget: "$720",      bullTarget: "$950"      },
    { name: "Apple",             ticker: "AAPL", slug: "aapl",        scores: [88, 72, 68], href: "/stocks/aapl",        category: "Big Tech",    bearTarget: "$155",      baseTarget: "$240",      bullTarget: "$350"      },
    { name: "Tesla",             ticker: "TSLA", slug: "tesla",       scores: [74, 87, 65], href: "/stocks/tesla",       category: "Big Tech",    bearTarget: "$150",      baseTarget: "$400",      bullTarget: "$550"      },
    { name: "Micron",            ticker: "MU",   slug: "micron",      scores: [62, 87, 76], href: "/stocks/micron",      category: "Big Tech",    bearTarget: "$55",       baseTarget: "$120",      bullTarget: "$200"      },
    { name: "Intuitive Surgical",ticker: "ISRG", slug: "isrg",        scores: [88, 82, 62], href: "/stocks/isrg",        category: "Healthcare",  bearTarget: "$280",      baseTarget: "$520",      bullTarget: "$750"      },
    { name: "Eli Lilly",          ticker: "LLY",  slug: "lly",         scores: [82, 90, 75], href: "/stocks/lly",         category: "Healthcare",  bearTarget: "$650",      baseTarget: "$1,200",    bullTarget: "$1,750"    },
    { name: "Netflix",           ticker: "NFLX", slug: "nflx",        scores: [63, 88, 71], href: "/stocks/nflx",        category: "Big Tech",    bearTarget: "$65",       baseTarget: "$105",      bullTarget: "$160"      },
    { name: "Adobe",             ticker: "ADBE", slug: "adbe",        scores: [58, 82, 77], href: "/stocks/adbe",        category: "Financials",  bearTarget: "$200",      baseTarget: "$320",      bullTarget: "$450"      },
    { name: "AMD",               ticker: "AMD",  slug: "amd",         scores: [52, 92, 71], href: "/stocks/amd",         category: "Big Tech",    bearTarget: "$110",      baseTarget: "$230",      bullTarget: "$320"      },
    { name: "K92 Mining",        ticker: "KNT",  slug: "k92",         scores: [52, 85, 80], href: "/stocks/k92",         category: "Hard Assets", bearTarget: "$17.00 CAD", baseTarget: "$38.00 CAD", bullTarget: "$65.00 CAD" },
    { name: "Freeport-McMoRan",  ticker: "FCX",  slug: "fcx",         scores: [60, 75, 68], href: "/stocks/fcx",         category: "Hard Assets", bearTarget: "$22",       baseTarget: "$48",       bullTarget: "$80"       },
    { name: "Gold",              ticker: "XAU",  slug: "gold",        scores: [67, 50, 68], href: "/stocks/gold",        category: "Hard Assets", bearTarget: "$3,800/oz", baseTarget: "$5,500/oz", bullTarget: "$7,500+/oz"},
    { name: "Costco",            ticker: "COST", slug: "costco",      scores: [82, 70, 60], href: "/stocks/costco",      category: "Financials",  bearTarget: "$700",      baseTarget: "$1,050",    bullTarget: "$1,400"    },
    { name: "Oracle",            ticker: "ORCL", slug: "orcl",        scores: [85, 80, 65], href: "/stocks/orcl",        category: "Big Tech",    bearTarget: "$120",      baseTarget: "$185",      bullTarget: "$280"      },
    { name: "TransDigm",         ticker: "TDG",  slug: "tdg",         scores: [86, 75, 70], href: "/stocks/tdg",         category: "Industrials", bearTarget: "$850",      baseTarget: "$1,350",    bullTarget: "$1,900"    },
    { name: "MSCI",              ticker: "MSCI", slug: "msci",        scores: [91, 75, 71], href: "/stocks/msci",        category: "Financials",  bearTarget: "$420",      baseTarget: "$620",      bullTarget: "$850"      },
];

// ─── All coverage (exported for the stocks list page) ────────────────────────
export { allCoverageData };

// ─── Portfolio: top MAX_PORTFOLIO stocks with avg >= MIN_AVG_SCORE ────────────
export const stockData = [...allCoverageData]
    .sort((a, b) => getAverageScore(b.scores) - getAverageScore(a.scores))
    .filter(s => getAverageScore(s.scores) >= MIN_AVG_SCORE)
    .slice(0, MAX_PORTFOLIO);

// ─── Excluded: all analyzed stocks not in the portfolio ───────────────────────
const portfolioTickers = new Set(stockData.map(s => s.ticker));
export const excludedStockData = allCoverageData.filter(s => !portfolioTickers.has(s.ticker));
