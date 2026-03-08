// Moat scores are computed dynamically from each stock's tenMoats data in
// src/data/stocks/*.json using the Ten Moats formula (60% AI-resilient,
// 40% AI-vulnerable). Growth and valuation scores remain manually curated.
//
// RULES (enforced dynamically below):
//   • Maximum 20 stocks in the portfolio
//   • Minimum average score of 75 required for inclusion
//
// To add a new stock: import its JSON, add an entry to allCoverageData,
// and the moat score will be derived automatically.

import { computeMoatScore } from '@/lib/valuationScore';

import aaplData    from '@/data/stocks/aapl.json';
import adbeData    from '@/data/stocks/adbe.json';
import amazonData  from '@/data/stocks/amazon.json';
import amdData     from '@/data/stocks/amd.json';
import asmlData    from '@/data/stocks/asml.json';
import avgoData    from '@/data/stocks/avgo.json';
import btcData     from '@/data/stocks/btc.json';
import cegData     from '@/data/stocks/ceg.json';
import costcoData  from '@/data/stocks/costco.json';
import crmData     from '@/data/stocks/crm.json';
import crowdstrikeData from '@/data/stocks/crowdstrike.json';
import ethereumData from '@/data/stocks/ethereum.json';
import fcxData     from '@/data/stocks/fcx.json';
import goldData    from '@/data/stocks/gold.json';
import googleData  from '@/data/stocks/google.json';
import intuitData  from '@/data/stocks/intuit.json';
import isrgData    from '@/data/stocks/isrg.json';
import k92Data     from '@/data/stocks/k92.json';
import llyData     from '@/data/stocks/lly.json';
import mastercardData from '@/data/stocks/mastercard.json';
import mcoData     from '@/data/stocks/mco.json';
import meliData    from '@/data/stocks/meli.json';
import metaData    from '@/data/stocks/meta.json';
import micronData  from '@/data/stocks/micron.json';
import msciData    from '@/data/stocks/msci.json';
import msftData    from '@/data/stocks/msft.json';
import nflxData    from '@/data/stocks/nflx.json';
import nvdaData    from '@/data/stocks/nvda.json';
import orclData    from '@/data/stocks/orcl.json';
import pltrData    from '@/data/stocks/pltr.json';
import raceData    from '@/data/stocks/race.json';
import shopData    from '@/data/stocks/shop.json';
import sofiData    from '@/data/stocks/sofi.json';
import solanaData  from '@/data/stocks/solana.json';
import spgiData    from '@/data/stocks/spgi.json';
import tdgData     from '@/data/stocks/tdg.json';
import teslaData   from '@/data/stocks/tesla.json';
import tsmData     from '@/data/stocks/tsm.json';
import unhData     from '@/data/stocks/unh.json';
import visaData    from '@/data/stocks/visa.json';

// Weighted composite: Moat 40% · Growth 35% · Valuation 25%
// scores = [moatScore, growthScore, valuationScore]
// Returns a float for precise sorting/comparison; callers round for display.
export const getAverageScore = ([moat, growth, valuation]: number[]) =>
    moat * 0.40 + growth * 0.35 + valuation * 0.25;

const MAX_PORTFOLIO  = 20;
const MIN_AVG_SCORE  = 75;

/** Shorthand: compute moat score from a stock JSON's tenMoats field. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const m = (json: { tenMoats: any }) => computeMoatScore(json.tenMoats);

// ─── All analyzed stocks (single source of truth) ─────────────────────────────
// scores = [computedMoatScore, growthScore, valuationScore]
// Moat score is derived from each stock's tenMoats data — do not edit manually.
const allCoverageData = [
    { name: "MercadoLibre",      ticker: "MELI", slug: "meli",        scores: [m(meliData),        90, 78], href: "/stocks/meli",        category: "Other",       bearTarget: "$1,000",    baseTarget: "$2,200",    bullTarget: "$3,500"    },
    { name: "Ferrari",           ticker: "RACE", slug: "race",        scores: [m(raceData),        67, 78], href: "/stocks/race",        category: "Other",       bearTarget: "$280",      baseTarget: "$480",      bullTarget: "$700"      },
    { name: "Constellation Energy", ticker: "CEG", slug: "ceg",      scores: [m(cegData),         72, 71], href: "/stocks/ceg",         category: "Other",       bearTarget: "$200",      baseTarget: "$420",      bullTarget: "$650"      },
    { name: "UnitedHealth",      ticker: "UNH",  slug: "unh",         scores: [m(unhData),         75, 78], href: "/stocks/unh",         category: "Healthcare",  bearTarget: "$200",      baseTarget: "$380",      bullTarget: "$600"      },
    { name: "Moody's",           ticker: "MCO",  slug: "mco",         scores: [m(mcoData),         80, 76], href: "/stocks/mco",         category: "Financials",  bearTarget: "$340",      baseTarget: "$560",      bullTarget: "$750"      },
    { name: "Microsoft",         ticker: "MSFT", slug: "msft",        scores: [m(msftData),        88, 74], href: "/stocks/msft",        category: "Big Tech",    bearTarget: "$300",      baseTarget: "$450",      bullTarget: "$580"      },
    { name: "Mastercard",        ticker: "MA",   slug: "mastercard",  scores: [m(mastercardData),  88, 71], href: "/stocks/mastercard",  category: "Financials",  bearTarget: "$400",      baseTarget: "$555",      bullTarget: "$700"      },
    { name: "ASML",              ticker: "ASML", slug: "asml",        scores: [m(asmlData),        80, 83], href: "/stocks/asml",        category: "Big Tech",    bearTarget: "$900",      baseTarget: "$1,500",    bullTarget: "$2,200"    },
    { name: "NVIDIA",            ticker: "NVDA", slug: "nvda",        scores: [m(nvdaData),        95, 65], href: "/stocks/nvda",        category: "Big Tech",    bearTarget: "$100",      baseTarget: "$175",      bullTarget: "$280"      },
    { name: "Amazon",            ticker: "AMZN", slug: "amazon",      scores: [m(amazonData),      88, 69], href: "/stocks/amazon",      category: "Big Tech",    bearTarget: "$145",      baseTarget: "$225",      bullTarget: "$320"      },
    { name: "S&P Global",        ticker: "SPGI", slug: "spgi",        scores: [m(spgiData),        78, 78], href: "/stocks/spgi",        category: "Financials",  bearTarget: "$400",      baseTarget: "$500",      bullTarget: "$610"      },
    { name: "Visa",              ticker: "V",    slug: "visa",        scores: [m(visaData),        82, 71], href: "/stocks/visa",        category: "Financials",  bearTarget: "$245",      baseTarget: "$335",      bullTarget: "$420"      },
    { name: "Google",            ticker: "GOOGL",slug: "google",      scores: [m(googleData),      82, 72], href: "/stocks/google",      category: "Big Tech",    bearTarget: "$130",      baseTarget: "$200",      bullTarget: "$270"      },
    { name: "TSMC",              ticker: "TSM",  slug: "tsm",         scores: [m(tsmData),         82, 70], href: "/stocks/tsm",         category: "Big Tech",    bearTarget: "$120",      baseTarget: "$200",      bullTarget: "$280"      },
    { name: "Intuit",            ticker: "INTU", slug: "intuit",      scores: [m(intuitData),      84, 75], href: "/stocks/intuit",      category: "Financials",  bearTarget: "$300",      baseTarget: "$480",      bullTarget: "$650"      },
    { name: "Shopify",           ticker: "SHOP", slug: "shop",        scores: [m(shopData),        88, 74], href: "/stocks/shop",        category: "Big Tech",    bearTarget: "$80",       baseTarget: "$160",      bullTarget: "$240"      },
    { name: "Bitcoin",           ticker: "BTC",  slug: "btc",         scores: [m(btcData),         85, 77], href: "/stocks/btc",         category: "Hard Assets", bearTarget: "$45,000",   baseTarget: "$120,000",  bullTarget: "$300,000+" },
    { name: "Ethereum",          ticker: "ETH",  slug: "ethereum",    scores: [m(ethereumData),    80, 65], href: "/stocks/ethereum",    category: "Hard Assets", bearTarget: "$1,200",    baseTarget: "$5,500",    bullTarget: "$12,000"   },
    { name: "Solana",            ticker: "SOL",  slug: "solana",      scores: [m(solanaData),      82, 62], href: "/stocks/solana",      category: "Hard Assets", bearTarget: "$55",       baseTarget: "$350",      bullTarget: "$800"      },
    { name: "Palantir",          ticker: "PLTR", slug: "pltr",        scores: [m(pltrData),        88, 71], href: "/stocks/pltr",        category: "Big Tech",    bearTarget: "$80",       baseTarget: "$155",      bullTarget: "$260"      },
    { name: "Salesforce",        ticker: "CRM",  slug: "crm",         scores: [m(crmData),         80, 79], href: "/stocks/crm",         category: "Financials",  bearTarget: "$150",      baseTarget: "$250",      bullTarget: "$350"      },
    { name: "Broadcom",          ticker: "AVGO", slug: "avgo",        scores: [m(avgoData),        88, 65], href: "/stocks/avgo",        category: "Big Tech",    bearTarget: "$120",      baseTarget: "$210",      bullTarget: "$320"      },
    { name: "CrowdStrike",       ticker: "CRWD", slug: "crowdstrike", scores: [m(crowdstrikeData), 87, 60], href: "/stocks/crowdstrike", category: "Big Tech",    bearTarget: "$200",      baseTarget: "$380",      bullTarget: "$600"      },
    { name: "Meta",              ticker: "META", slug: "meta",        scores: [m(metaData),        85, 72], href: "/stocks/meta",        category: "Big Tech",    bearTarget: "$460",      baseTarget: "$720",      bullTarget: "$950"      },
    { name: "Apple",             ticker: "AAPL", slug: "aapl",        scores: [m(aaplData),        72, 68], href: "/stocks/aapl",        category: "Big Tech",    bearTarget: "$155",      baseTarget: "$240",      bullTarget: "$350"      },
    { name: "Tesla",             ticker: "TSLA", slug: "tesla",       scores: [m(teslaData),       87, 65], href: "/stocks/tesla",       category: "Big Tech",    bearTarget: "$150",      baseTarget: "$400",      bullTarget: "$550"      },
    { name: "Micron",            ticker: "MU",   slug: "micron",      scores: [m(micronData),      87, 76], href: "/stocks/micron",      category: "Big Tech",    bearTarget: "$55",       baseTarget: "$120",      bullTarget: "$200"      },
    { name: "Intuitive Surgical",ticker: "ISRG", slug: "isrg",        scores: [m(isrgData),        82, 62], href: "/stocks/isrg",        category: "Healthcare",  bearTarget: "$280",      baseTarget: "$520",      bullTarget: "$750"      },
    { name: "Eli Lilly",          ticker: "LLY",  slug: "lly",         scores: [m(llyData),         90, 75], href: "/stocks/lly",         category: "Healthcare",  bearTarget: "$650",      baseTarget: "$1,200",    bullTarget: "$1,750"    },
    { name: "Netflix",           ticker: "NFLX", slug: "nflx",        scores: [m(nflxData),        88, 71], href: "/stocks/nflx",        category: "Big Tech",    bearTarget: "$65",       baseTarget: "$105",      bullTarget: "$160"      },
    { name: "Adobe",             ticker: "ADBE", slug: "adbe",        scores: [m(adbeData),        82, 77], href: "/stocks/adbe",        category: "Financials",  bearTarget: "$200",      baseTarget: "$320",      bullTarget: "$450"      },
    { name: "AMD",               ticker: "AMD",  slug: "amd",         scores: [m(amdData),         92, 71], href: "/stocks/amd",         category: "Big Tech",    bearTarget: "$110",      baseTarget: "$230",      bullTarget: "$320"      },
    { name: "K92 Mining",        ticker: "KNT",  slug: "k92",         scores: [m(k92Data),         85, 80], href: "/stocks/k92",         category: "Hard Assets", bearTarget: "$17.00 CAD", baseTarget: "$38.00 CAD", bullTarget: "$65.00 CAD" },
    { name: "Freeport-McMoRan",  ticker: "FCX",  slug: "fcx",         scores: [m(fcxData),         75, 68], href: "/stocks/fcx",         category: "Hard Assets", bearTarget: "$22",       baseTarget: "$48",       bullTarget: "$80"       },
    { name: "Gold",              ticker: "XAU",  slug: "gold",        scores: [m(goldData),        50, 68], href: "/stocks/gold",        category: "Hard Assets", bearTarget: "$3,800/oz", baseTarget: "$5,500/oz", bullTarget: "$7,500+/oz"},
    { name: "Costco",            ticker: "COST", slug: "costco",      scores: [m(costcoData),      70, 60], href: "/stocks/costco",      category: "Financials",  bearTarget: "$700",      baseTarget: "$1,050",    bullTarget: "$1,400"    },
    { name: "Oracle",            ticker: "ORCL", slug: "orcl",        scores: [m(orclData),        80, 65], href: "/stocks/orcl",        category: "Big Tech",    bearTarget: "$120",      baseTarget: "$185",      bullTarget: "$280"      },
    { name: "TransDigm",         ticker: "TDG",  slug: "tdg",         scores: [m(tdgData),         75, 70], href: "/stocks/tdg",         category: "Industrials", bearTarget: "$850",      baseTarget: "$1,350",    bullTarget: "$1,900"    },
    { name: "MSCI",              ticker: "MSCI", slug: "msci",        scores: [m(msciData),        75, 71], href: "/stocks/msci",        category: "Financials",  bearTarget: "$420",      baseTarget: "$620",      bullTarget: "$850"      },
    { name: "SoFi Technologies", ticker: "SOFI", slug: "sofi",        scores: [m(sofiData),        82, 79], href: "/stocks/sofi",        category: "Financials",  bearTarget: "$13",       baseTarget: "$26",       bullTarget: "$45"       },
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
