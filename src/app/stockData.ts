// All three scores and the bear/base/bull targets are derived from each
// stock's JSON file — single source of truth, no manual sync required.
//
//   m(json)  →  moat score      computed from tenMoats via Ten Moats formula
//   g(json)  →  growth score    read from json.growth.score
//   v(json)  →  valuation score read from json.valuation.score
//   t(json)  →  { bearTarget, baseTarget, bullTarget } from json.scenarios
//
// RULES (enforced dynamically below):
//   • Maximum 20 stocks in the portfolio
//   • Minimum average score of 75 required for inclusion
//
// To add a new stock: import its JSON, add an entry to allCoverageData.
// All scores and targets will be derived automatically.

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
import disneyData  from '@/data/stocks/disney.json';
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
import nowData     from '@/data/stocks/now.json';
import msftData    from '@/data/stocks/msft.json';
import nflxData    from '@/data/stocks/nflx.json';
import nvdaData    from '@/data/stocks/nvda.json';
import orclData    from '@/data/stocks/orcl.json';
import pltrData    from '@/data/stocks/pltr.json';
import raceData    from '@/data/stocks/race.json';
import shopData    from '@/data/stocks/shop.json';
import mstrData    from '@/data/stocks/mstr.json';
import sofiData    from '@/data/stocks/sofi.json';
import solanaData  from '@/data/stocks/solana.json';
import spgiData    from '@/data/stocks/spgi.json';
import fanucData   from '@/data/stocks/fanuc.json';
import tdgData     from '@/data/stocks/tdg.json';
import teslaData   from '@/data/stocks/tesla.json';
import lmtData     from '@/data/stocks/lmt.json';
import neeData     from '@/data/stocks/nee.json';
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

/** Compute moat score from a stock JSON's tenMoats field. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const m = (json: { tenMoats: any }) => computeMoatScore(json.tenMoats);

/** Read growth score from a stock JSON. */
const g = (json: { growth: { score: number } }) => json.growth.score;

/** Read valuation score from a stock JSON. */
const v = (json: { valuation: { score: number } }) => json.valuation.score;

/** Read bear/base/bull price targets from a stock JSON. */
const t = (json: { scenarios: { bear: { priceTarget: string }; base: { priceTarget: string }; bull: { priceTarget: string } } }) => ({
    bearTarget: json.scenarios.bear.priceTarget,
    baseTarget: json.scenarios.base.priceTarget,
    bullTarget: json.scenarios.bull.priceTarget,
});

// ─── All analyzed stocks (single source of truth) ─────────────────────────────
// scores = [computedMoatScore, growthScore, valuationScore]
// All three scores and targets derive from the stock's JSON — edit the JSON, not this file.
const allCoverageData = [
    { name: "MercadoLibre",      ticker: "MELI",  slug: "meli",        scores: [m(meliData),        g(meliData),        v(meliData)],        href: "/stocks/meli",        category: "Other",       ...t(meliData)        },
    { name: "Ferrari",           ticker: "RACE",  slug: "race",        scores: [m(raceData),        g(raceData),        v(raceData)],        href: "/stocks/race",        category: "Other",       ...t(raceData)        },
    { name: "Constellation Energy", ticker: "CEG", slug: "ceg",       scores: [m(cegData),         g(cegData),         v(cegData)],         href: "/stocks/ceg",         category: "Other",       ...t(cegData)         },
    { name: "UnitedHealth",      ticker: "UNH",   slug: "unh",         scores: [m(unhData),         g(unhData),         v(unhData)],         href: "/stocks/unh",         category: "Healthcare",  ...t(unhData)         },
    { name: "Moody's",           ticker: "MCO",   slug: "mco",         scores: [m(mcoData),         g(mcoData),         v(mcoData)],         href: "/stocks/mco",         category: "Financials",  ...t(mcoData)         },
    { name: "Microsoft",         ticker: "MSFT",  slug: "msft",        scores: [m(msftData),        g(msftData),        v(msftData)],        href: "/stocks/msft",        category: "Big Tech",    ...t(msftData)        },
    { name: "Mastercard",        ticker: "MA",    slug: "mastercard",  scores: [m(mastercardData),  g(mastercardData),  v(mastercardData)],  href: "/stocks/mastercard",  category: "Financials",  ...t(mastercardData)  },
    { name: "ASML",              ticker: "ASML",  slug: "asml",        scores: [m(asmlData),        g(asmlData),        v(asmlData)],        href: "/stocks/asml",        category: "Big Tech",    ...t(asmlData)        },
    { name: "NVIDIA",            ticker: "NVDA",  slug: "nvda",        scores: [m(nvdaData),        g(nvdaData),        v(nvdaData)],        href: "/stocks/nvda",        category: "Big Tech",    ...t(nvdaData)        },
    { name: "Amazon",            ticker: "AMZN",  slug: "amazon",      scores: [m(amazonData),      g(amazonData),      v(amazonData)],      href: "/stocks/amazon",      category: "Big Tech",    ...t(amazonData)      },
    { name: "S&P Global",        ticker: "SPGI",  slug: "spgi",        scores: [m(spgiData),        g(spgiData),        v(spgiData)],        href: "/stocks/spgi",        category: "Financials",  ...t(spgiData)        },
    { name: "Visa",              ticker: "V",     slug: "visa",        scores: [m(visaData),        g(visaData),        v(visaData)],        href: "/stocks/visa",        category: "Financials",  ...t(visaData)        },
    { name: "Google",            ticker: "GOOGL", slug: "google",      scores: [m(googleData),      g(googleData),      v(googleData)],      href: "/stocks/google",      category: "Big Tech",    ...t(googleData)      }, // Bear $215 / Base $350 / Bull $450
    { name: "TSMC",              ticker: "TSM",   slug: "tsm",         scores: [m(tsmData),         g(tsmData),         v(tsmData)],         href: "/stocks/tsm",         category: "Big Tech",    ...t(tsmData)         },
    { name: "Intuit",            ticker: "INTU",  slug: "intuit",      scores: [m(intuitData),      g(intuitData),      v(intuitData)],      href: "/stocks/intuit",      category: "Financials",  ...t(intuitData)      },
    { name: "Shopify",           ticker: "SHOP",  slug: "shop",        scores: [m(shopData),        g(shopData),        v(shopData)],        href: "/stocks/shop",        category: "Big Tech",    ...t(shopData)        },
    { name: "Bitcoin",           ticker: "BTC",   slug: "btc",         scores: [m(btcData),         g(btcData),         v(btcData)],         href: "/stocks/btc",         category: "Hard Assets", ...t(btcData)         },
    { name: "Ethereum",          ticker: "ETH",   slug: "ethereum",    scores: [m(ethereumData),    g(ethereumData),    v(ethereumData)],    href: "/stocks/ethereum",    category: "Hard Assets", ...t(ethereumData)    },
    { name: "Solana",            ticker: "SOL",   slug: "solana",      scores: [m(solanaData),      g(solanaData),      v(solanaData)],      href: "/stocks/solana",      category: "Hard Assets", ...t(solanaData)      },
    { name: "Palantir",          ticker: "PLTR",  slug: "pltr",        scores: [m(pltrData),        g(pltrData),        v(pltrData)],        href: "/stocks/pltr",        category: "Big Tech",    ...t(pltrData)        },
    { name: "Salesforce",        ticker: "CRM",   slug: "crm",         scores: [m(crmData),         g(crmData),         v(crmData)],         href: "/stocks/crm",         category: "Financials",  ...t(crmData)         },
    { name: "Broadcom",          ticker: "AVGO",  slug: "avgo",        scores: [m(avgoData),        g(avgoData),        v(avgoData)],        href: "/stocks/avgo",        category: "Big Tech",    ...t(avgoData)        },
    { name: "CrowdStrike",       ticker: "CRWD",  slug: "crowdstrike", scores: [m(crowdstrikeData), g(crowdstrikeData), v(crowdstrikeData)], href: "/stocks/crowdstrike", category: "Big Tech",    ...t(crowdstrikeData) },
    { name: "Meta",              ticker: "META",  slug: "meta",        scores: [m(metaData),        g(metaData),        v(metaData)],        href: "/stocks/meta",        category: "Big Tech",    ...t(metaData)        },
    { name: "Apple",             ticker: "AAPL",  slug: "aapl",        scores: [m(aaplData),        g(aaplData),        v(aaplData)],        href: "/stocks/aapl",        category: "Big Tech",    ...t(aaplData)        },
    { name: "Tesla",             ticker: "TSLA",  slug: "tesla",       scores: [m(teslaData),       g(teslaData),       v(teslaData)],       href: "/stocks/tesla",       category: "Big Tech",    ...t(teslaData)       },
    { name: "Micron",            ticker: "MU",    slug: "micron",      scores: [m(micronData),      g(micronData),      v(micronData)],      href: "/stocks/micron",      category: "Big Tech",    ...t(micronData)      },
    { name: "FANUC Corporation", ticker: "FANUY", slug: "fanuc",       scores: [m(fanucData),       g(fanucData),       v(fanucData)],       href: "/stocks/fanuc",       category: "Industrials", ...t(fanucData)       },
    { name: "Intuitive Surgical",ticker: "ISRG",  slug: "isrg",        scores: [m(isrgData),        g(isrgData),        v(isrgData)],        href: "/stocks/isrg",        category: "Healthcare",  ...t(isrgData)        },
    { name: "Eli Lilly",         ticker: "LLY",   slug: "lly",         scores: [m(llyData),         g(llyData),         v(llyData)],         href: "/stocks/lly",         category: "Healthcare",  ...t(llyData)         },
    { name: "Netflix",           ticker: "NFLX",  slug: "nflx",        scores: [m(nflxData),        g(nflxData),        v(nflxData)],        href: "/stocks/nflx",        category: "Big Tech",    ...t(nflxData)        },
    { name: "Adobe",             ticker: "ADBE",  slug: "adbe",        scores: [m(adbeData),        g(adbeData),        v(adbeData)],        href: "/stocks/adbe",        category: "Financials",  ...t(adbeData)        },
    { name: "AMD",               ticker: "AMD",   slug: "amd",         scores: [m(amdData),         g(amdData),         v(amdData)],         href: "/stocks/amd",         category: "Big Tech",    ...t(amdData)         },
    { name: "K92 Mining",        ticker: "KNT",   slug: "k92",         scores: [m(k92Data),         g(k92Data),         v(k92Data)],         href: "/stocks/k92",         category: "Hard Assets", ...t(k92Data)         },
    { name: "Freeport-McMoRan",  ticker: "FCX",   slug: "fcx",         scores: [m(fcxData),         g(fcxData),         v(fcxData)],         href: "/stocks/fcx",         category: "Hard Assets", ...t(fcxData)         },
    { name: "Gold",              ticker: "XAU",   slug: "gold",        scores: [m(goldData),        g(goldData),        v(goldData)],        href: "/stocks/gold",        category: "Hard Assets", ...t(goldData)        },
    { name: "Costco",            ticker: "COST",  slug: "costco",      scores: [m(costcoData),      g(costcoData),      v(costcoData)],      href: "/stocks/costco",      category: "Financials",  ...t(costcoData)      },
    { name: "Walt Disney",       ticker: "DIS",   slug: "disney",      scores: [m(disneyData),      g(disneyData),      v(disneyData)],      href: "/stocks/disney",      category: "Other",       ...t(disneyData)      },
    { name: "ServiceNow",        ticker: "NOW",   slug: "now",         scores: [m(nowData),         g(nowData),         v(nowData)],         href: "/stocks/now",         category: "Big Tech",    ...t(nowData)         },
    { name: "Oracle",            ticker: "ORCL",  slug: "orcl",        scores: [m(orclData),        g(orclData),        v(orclData)],        href: "/stocks/orcl",        category: "Big Tech",    ...t(orclData)        },
    { name: "TransDigm",         ticker: "TDG",   slug: "tdg",         scores: [m(tdgData),         g(tdgData),         v(tdgData)],         href: "/stocks/tdg",         category: "Industrials", ...t(tdgData)         },
    { name: "Lockheed Martin",   ticker: "LMT",   slug: "lmt",         scores: [m(lmtData),         g(lmtData),         v(lmtData)],         href: "/stocks/lmt",         category: "Industrials", ...t(lmtData)         },
    { name: "NextEra Energy",    ticker: "NEE",   slug: "nee",         scores: [m(neeData),         g(neeData),         v(neeData)],         href: "/stocks/nee",         category: "Other",       ...t(neeData)         },
    { name: "MSCI",              ticker: "MSCI",  slug: "msci",        scores: [m(msciData),        g(msciData),        v(msciData)],        href: "/stocks/msci",        category: "Financials",  ...t(msciData)        },
    { name: "SoFi Technologies", ticker: "SOFI",  slug: "sofi",        scores: [m(sofiData),        g(sofiData),        v(sofiData)],        href: "/stocks/sofi",        category: "Financials",  ...t(sofiData)        },
    { name: "Strategy Inc.",     ticker: "MSTR",  slug: "mstr",        scores: [m(mstrData),        g(mstrData),        v(mstrData)],        href: "/stocks/mstr",        category: "Hard Assets", ...t(mstrData)        },
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
