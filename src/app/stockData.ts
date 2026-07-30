// All three scores and the bear/base/bull targets are derived from each
// stock's JSON file — single source of truth, no manual sync required.
//
//   m(json)  →  moat score      dispatched on assetClass (10-moat / crypto / commodity)
//   g(json)  →  growth score    derived from json.growth.growthAnalysis
//   v(json)  →  valuation score read from json.valuation.score
//   t(json)  →  { bearTarget, baseTarget, bullTarget } from json.scenarios
//
// RULES (enforced dynamically below — see MAX_PORTFOLIO / MIN_AVG_SCORE):
//   • Maximum 25 stocks in the portfolio
//   • Minimum composite score of 80 required for inclusion
//
// To add a new stock: import its JSON, add an entry to allCoverageData.
// All scores and targets will be derived automatically.

import { computeAssetMoatScore, computeGrowthScore, computeCompositeRaw, type GrowthAnalysisInput } from '@/lib/valuationScore';
import type { RiskFactor } from '@/lib/riskFactors';
import type { StockAnalysisData } from '@/types/stockAnalysis';

import aaplData    from '@/data/stocks/aapl.json';
import adbeData    from '@/data/stocks/adbe.json';
import amazonData  from '@/data/stocks/amazon.json';
import amdData     from '@/data/stocks/amd.json';
import asmlData    from '@/data/stocks/asml.json';
import avgoData    from '@/data/stocks/avgo.json';
import btcData     from '@/data/stocks/btc.json';
import cegData     from '@/data/stocks/ceg.json';
import gevData     from '@/data/stocks/gev.json';
import ccjData     from '@/data/stocks/ccj.json';
import leuData     from '@/data/stocks/leu.json';
import nxeData     from '@/data/stocks/nxe.json';
import uecData     from '@/data/stocks/uec.json';
import kapData     from '@/data/stocks/kap.json';
import costcoData  from '@/data/stocks/costco.json';
import disneyData  from '@/data/stocks/disney.json';
import crmData     from '@/data/stocks/crm.json';
import crowdstrikeData from '@/data/stocks/crowdstrike.json';
import ethereumData from '@/data/stocks/ethereum.json';
import fcxData     from '@/data/stocks/fcx.json';
import goldData    from '@/data/stocks/gold.json';
import copperData  from '@/data/stocks/copper.json';
import silverData  from '@/data/stocks/silver.json';
import spacexData  from '@/data/stocks/spacex.json';
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
import figData     from '@/data/stocks/fig.json';
import anetData    from '@/data/stocks/anet.json';
import appData     from '@/data/stocks/applovin.json';
import ficoData    from '@/data/stocks/fico.json';
import panwData    from '@/data/stocks/panw.json';
import ttdData     from '@/data/stocks/ttd.json';
import armData     from '@/data/stocks/arm.json';
import iceData     from '@/data/stocks/ice.json';
import axonData    from '@/data/stocks/axon.json';
import coinData    from '@/data/stocks/coin.json';
import netData     from '@/data/stocks/net.json';
import rddtData    from '@/data/stocks/rddt.json';
import seaData     from '@/data/stocks/sea.json';
import oktaData    from '@/data/stocks/okta.json';
import duolingoData from '@/data/stocks/duolingo.json';
import hoodData     from '@/data/stocks/hood.json';
import vstData      from '@/data/stocks/vst.json';
import tmoData      from '@/data/stocks/tmo.json';
import klacData     from '@/data/stocks/klac.json';
import lngData      from '@/data/stocks/lng.json';
import smciData     from '@/data/stocks/smci.json';
import vrtData      from '@/data/stocks/vrt.json';
import dellData     from '@/data/stocks/dell.json';
import crdoData     from '@/data/stocks/crdo.json';
import nvoData      from '@/data/stocks/nvo.json';
import himsData     from '@/data/stocks/hims.json';
import spotData     from '@/data/stocks/spot.json';
import uberData     from '@/data/stocks/uber.json';
import abnbData     from '@/data/stocks/abnb.json';
import keysData     from '@/data/stocks/keys.json';
import keyenceData  from '@/data/stocks/keyence.json';
import catData      from '@/data/stocks/cat.json';
import deData       from '@/data/stocks/de.json';
import etnData      from '@/data/stocks/etn.json';
import nkeData      from '@/data/stocks/nke.json';
import luluData     from '@/data/stocks/lulu.json';
import elData       from '@/data/stocks/el.json';
import babaData     from '@/data/stocks/baba.json';
import pddData      from '@/data/stocks/pdd.json';
import biduData     from '@/data/stocks/bidu.json';
import snowData     from '@/data/stocks/snow.json';
import ddogData     from '@/data/stocks/ddog.json';
import mdbData      from '@/data/stocks/mdb.json';
import snpsData     from '@/data/stocks/snps.json';
import cdnsData     from '@/data/stocks/cdns.json';
import crwvData     from '@/data/stocks/crwv.json';
import nbisData     from '@/data/stocks/nbis.json';
import jpmData      from '@/data/stocks/jpm.json';
import bxData       from '@/data/stocks/bx.json';
import kkrData      from '@/data/stocks/kkr.json';
import gsData       from '@/data/stocks/gs.json';
import msData       from '@/data/stocks/ms.json';
import pwrData      from '@/data/stocks/pwr.json';
import ttData       from '@/data/stocks/tt.json';
import honData      from '@/data/stocks/hon.json';
import qcomData     from '@/data/stocks/qcom.json';
import elvData      from '@/data/stocks/elv.json';
import vrtxData     from '@/data/stocks/vrtx.json';
import regnData     from '@/data/stocks/regn.json';
import dashData     from '@/data/stocks/dash.json';
import rblxData     from '@/data/stocks/rblx.json';
import soxxData     from '@/data/stocks/soxx.json';
import vooData      from '@/data/stocks/voo.json';
import inioData     from '@/data/stocks/inio.json';
import rklbData     from '@/data/stocks/rklb.json';
import amkrData     from '@/data/stocks/amkr.json';
import zetaData     from '@/data/stocks/zeta.json';
import samsungData  from '@/data/stocks/samsung.json';
import rokData      from '@/data/stocks/rok.json';
import terData      from '@/data/stocks/ter.json';
import harmonicData from '@/data/stocks/harmonic.json';
import ionqData     from '@/data/stocks/ionq.json';
import rgtiData     from '@/data/stocks/rgti.json';
import qbtsData     from '@/data/stocks/qbts.json';
import qubtData     from '@/data/stocks/qubt.json';
import beData       from '@/data/stocks/be.json';

// Delegates to computeCompositeRaw in valuationScore.ts — the single source of
// truth for the composite formula. Returns a float for precise sorting; callers
// round for display.
export const getAverageScore = ([moat, growth, valuation]: number[]) =>
    computeCompositeRaw(moat, growth, valuation);

const MAX_PORTFOLIO  = 25;
const MIN_AVG_SCORE  = 80;

/**
 * Compute moat score by dispatching on the JSON's assetClass.
 * Defaults to the equity 10-moat framework when assetClass is unset.
 */
const m = (json: unknown) => computeAssetMoatScore(json as StockAnalysisData);

/**
 * Resolve a stock's growth score from its growthAnalysis fields. The derived
 * formula in src/lib/valuationScore.ts:computeGrowthScore is the sole source of
 * truth — there is no longer an author-set fallback. parseCagrEstimate and
 * keyRiskSeverity are required by the schema, so a null derived score implies
 * malformed data and we surface it loudly.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = (json: { slug: string; assetClass?: any; growth: { growthAnalysis: any } }): number => {
  const derived = computeGrowthScore(
    json.growth.growthAnalysis as GrowthAnalysisInput,
    json.assetClass ?? 'equity',
  );
  if (derived == null) {
    throw new Error(`computeGrowthScore returned null for ${json.slug} — check cagrEstimate parseability`);
  }
  return derived;
};

/** Read valuation score from a stock JSON. */
const v = (json: { valuation: { score: number } }) => json.valuation.score;

/**
 * Per-entry fields lifted straight off the stock JSON with no derivation:
 * the scenario ladder, the review date, and the shared risk factors.
 *
 * `lastAnalyzed` is here because the composite needs it — computeLiveComposite
 * damps a live price move by how stale the review behind the frozen moat and
 * growth pillars is (see src/lib/reviewFreshness.ts). `riskFactors` is here
 * because position sizing needs it (see src/lib/portfolioWeights.ts). Both are
 * spread into every entry below, so neither can be forgotten for a new stock.
 */
const entryMeta = (json: {
  scenarios: { bear: { priceTarget: string }; base: { priceTarget: string }; bull: { priceTarget: string } };
  lastAnalyzed?: string;
  growth: { growthAnalysis: { riskFactors?: readonly string[] } };
}) => ({
    bearTarget: json.scenarios.bear.priceTarget,
    baseTarget: json.scenarios.base.priceTarget,
    bullTarget: json.scenarios.bull.priceTarget,
    lastAnalyzed: json.lastAnalyzed,
    riskFactors: (json.growth.growthAnalysis.riskFactors ?? []) as RiskFactor[],
});

// ─── All analyzed stocks (single source of truth) ─────────────────────────────
// scores = [computedMoatScore, growthScore, valuationScore]
// All three scores and targets derive from the stock's JSON — edit the JSON, not this file.
const allCoverageData = [
    { name: "GE Vernova",        ticker: "GEV",   slug: "gev",         scores: [m(gevData),         g(gevData),         v(gevData)],         href: "/stocks/gev",         category: "Industrials", ...entryMeta(gevData)         },
    { name: "Cameco",            ticker: "CCJ",   slug: "ccj",         scores: [m(ccjData),         g(ccjData),         v(ccjData)],         href: "/stocks/ccj",         category: "Hard Assets", ...entryMeta(ccjData)         },
    { name: "MercadoLibre",      ticker: "MELI",  slug: "meli",        scores: [m(meliData),        g(meliData),        v(meliData)],        href: "/stocks/meli",        category: "Other",       ...entryMeta(meliData)        },
    { name: "Ferrari",           ticker: "RACE",  slug: "race",        scores: [m(raceData),        g(raceData),        v(raceData)],        href: "/stocks/race",        category: "Other",       ...entryMeta(raceData)        },
    { name: "Constellation Energy", ticker: "CEG", slug: "ceg",       scores: [m(cegData),         g(cegData),         v(cegData)],         href: "/stocks/ceg",         category: "Other",       ...entryMeta(cegData)         },
    { name: "Vistra Corp.",         ticker: "VST", slug: "vst",        scores: [m(vstData),         g(vstData),         v(vstData)],         href: "/stocks/vst",         category: "Other",       ...entryMeta(vstData)         },
    { name: "UnitedHealth",      ticker: "UNH",   slug: "unh",         scores: [m(unhData),         g(unhData),         v(unhData)],         href: "/stocks/unh",         category: "Healthcare",  ...entryMeta(unhData)         },
    { name: "Moody's",           ticker: "MCO",   slug: "mco",         scores: [m(mcoData),         g(mcoData),         v(mcoData)],         href: "/stocks/mco",         category: "Financials",  ...entryMeta(mcoData)         },
    { name: "Intercontinental Exchange", ticker: "ICE", slug: "ice",  scores: [m(iceData),         g(iceData),         v(iceData)],         href: "/stocks/ice",         category: "Financials",  ...entryMeta(iceData)         },
    { name: "Microsoft",         ticker: "MSFT",  slug: "msft",        scores: [m(msftData),        g(msftData),        v(msftData)],        href: "/stocks/msft",        category: "Big Tech",    ...entryMeta(msftData)        },
    { name: "Mastercard",        ticker: "MA",    slug: "mastercard",  scores: [m(mastercardData),  g(mastercardData),  v(mastercardData)],  href: "/stocks/mastercard",  category: "Financials",  ...entryMeta(mastercardData)  },
    { name: "ASML",              ticker: "ASML",  slug: "asml",        scores: [m(asmlData),        g(asmlData),        v(asmlData)],        href: "/stocks/asml",        category: "Big Tech",    ...entryMeta(asmlData)        },
    { name: "NVIDIA",            ticker: "NVDA",  slug: "nvda",        scores: [m(nvdaData),        g(nvdaData),        v(nvdaData)],        href: "/stocks/nvda",        category: "Big Tech",    ...entryMeta(nvdaData)        },
    { name: "Amazon",            ticker: "AMZN",  slug: "amazon",      scores: [m(amazonData),      g(amazonData),      v(amazonData)],      href: "/stocks/amazon",      category: "Big Tech",    ...entryMeta(amazonData)      },
    { name: "S&P Global",        ticker: "SPGI",  slug: "spgi",        scores: [m(spgiData),        g(spgiData),        v(spgiData)],        href: "/stocks/spgi",        category: "Financials",  ...entryMeta(spgiData)        },
    { name: "Visa",              ticker: "V",     slug: "visa",        scores: [m(visaData),        g(visaData),        v(visaData)],        href: "/stocks/visa",        category: "Financials",  ...entryMeta(visaData)        },
    { name: "Google",            ticker: "GOOGL", slug: "google",      scores: [m(googleData),      g(googleData),      v(googleData)],      href: "/stocks/google",      category: "Big Tech",    ...entryMeta(googleData)      }, // Bear $235 / Base $420 / Bull $560
    { name: "TSMC",              ticker: "TSM",   slug: "tsm",         scores: [m(tsmData),         g(tsmData),         v(tsmData)],         href: "/stocks/tsm",         category: "Big Tech",    ...entryMeta(tsmData)         },
    { name: "Intuit",            ticker: "INTU",  slug: "intuit",      scores: [m(intuitData),      g(intuitData),      v(intuitData)],      href: "/stocks/intuit",      category: "Financials",  ...entryMeta(intuitData)      },
    { name: "Shopify",           ticker: "SHOP",  slug: "shop",        scores: [m(shopData),        g(shopData),        v(shopData)],        href: "/stocks/shop",        category: "Big Tech",    ...entryMeta(shopData)        },
    { name: "Bitcoin",           ticker: "BTC",   slug: "btc",         scores: [m(btcData),         g(btcData),         v(btcData)],         href: "/stocks/btc",         category: "Hard Assets", ...entryMeta(btcData)         },
    { name: "Ethereum",          ticker: "ETH",   slug: "ethereum",    scores: [m(ethereumData),    g(ethereumData),    v(ethereumData)],    href: "/stocks/ethereum",    category: "Hard Assets", ...entryMeta(ethereumData)    },
    { name: "Solana",            ticker: "SOL",   slug: "solana",      scores: [m(solanaData),      g(solanaData),      v(solanaData)],      href: "/stocks/solana",      category: "Hard Assets", ...entryMeta(solanaData)      },
    { name: "Palantir",          ticker: "PLTR",  slug: "pltr",        scores: [m(pltrData),        g(pltrData),        v(pltrData)],        href: "/stocks/pltr",        category: "Big Tech",    ...entryMeta(pltrData)        },
    { name: "Salesforce",        ticker: "CRM",   slug: "crm",         scores: [m(crmData),         g(crmData),         v(crmData)],         href: "/stocks/crm",         category: "Financials",  ...entryMeta(crmData)         },
    { name: "Broadcom",          ticker: "AVGO",  slug: "avgo",        scores: [m(avgoData),        g(avgoData),        v(avgoData)],        href: "/stocks/avgo",        category: "Big Tech",    ...entryMeta(avgoData)        },
    { name: "CrowdStrike",       ticker: "CRWD",  slug: "crowdstrike", scores: [m(crowdstrikeData), g(crowdstrikeData), v(crowdstrikeData)], href: "/stocks/crowdstrike", category: "Big Tech",    ...entryMeta(crowdstrikeData) },
    { name: "Meta",              ticker: "META",  slug: "meta",        scores: [m(metaData),        g(metaData),        v(metaData)],        href: "/stocks/meta",        category: "Big Tech",    ...entryMeta(metaData)        },
    { name: "Apple",             ticker: "AAPL",  slug: "aapl",        scores: [m(aaplData),        g(aaplData),        v(aaplData)],        href: "/stocks/aapl",        category: "Big Tech",    ...entryMeta(aaplData)        },
    { name: "Tesla",             ticker: "TSLA",  slug: "tesla",       scores: [m(teslaData),       g(teslaData),       v(teslaData)],       href: "/stocks/tesla",       category: "Big Tech",    ...entryMeta(teslaData)       },
    { name: "Micron",            ticker: "MU",    slug: "micron",      scores: [m(micronData),      g(micronData),      v(micronData)],      href: "/stocks/micron",      category: "Big Tech",    ...entryMeta(micronData)      },
    { name: "FANUC Corporation", ticker: "FANUY", slug: "fanuc",       scores: [m(fanucData),       g(fanucData),       v(fanucData)],       href: "/stocks/fanuc",       category: "Industrials", ...entryMeta(fanucData)       },
    { name: "Intuitive Surgical",ticker: "ISRG",  slug: "isrg",        scores: [m(isrgData),        g(isrgData),        v(isrgData)],        href: "/stocks/isrg",        category: "Healthcare",  ...entryMeta(isrgData)        },
    { name: "Eli Lilly",         ticker: "LLY",   slug: "lly",         scores: [m(llyData),         g(llyData),         v(llyData)],         href: "/stocks/lly",         category: "Healthcare",  ...entryMeta(llyData)         },
    { name: "Netflix",           ticker: "NFLX",  slug: "nflx",        scores: [m(nflxData),        g(nflxData),        v(nflxData)],        href: "/stocks/nflx",        category: "Big Tech",    ...entryMeta(nflxData)        },
    { name: "Figma",             ticker: "FIG",   slug: "fig",         scores: [m(figData),         g(figData),         v(figData)],         href: "/stocks/fig",         category: "Big Tech",    ...entryMeta(figData)         },
    { name: "Adobe",             ticker: "ADBE",  slug: "adbe",        scores: [m(adbeData),        g(adbeData),        v(adbeData)],        href: "/stocks/adbe",        category: "Financials",  ...entryMeta(adbeData)        },
    { name: "AMD",               ticker: "AMD",   slug: "amd",         scores: [m(amdData),         g(amdData),         v(amdData)],         href: "/stocks/amd",         category: "Big Tech",    ...entryMeta(amdData)         },
    { name: "K92 Mining",        ticker: "KNT",   slug: "k92",         scores: [m(k92Data),         g(k92Data),         v(k92Data)],         href: "/stocks/k92",         category: "Hard Assets", ...entryMeta(k92Data)         },
    { name: "Freeport-McMoRan",  ticker: "FCX",   slug: "fcx",         scores: [m(fcxData),         g(fcxData),         v(fcxData)],         href: "/stocks/fcx",         category: "Hard Assets", ...entryMeta(fcxData)         },
    { name: "Gold",              ticker: "XAU",   slug: "gold",        scores: [m(goldData),        g(goldData),        v(goldData)],        href: "/stocks/gold",        category: "Hard Assets", ...entryMeta(goldData)        },
    { name: "Copper",            ticker: "HG",    slug: "copper",      scores: [m(copperData),      g(copperData),      v(copperData)],      href: "/stocks/copper",      category: "Hard Assets", ...entryMeta(copperData)      },
    { name: "Silver",            ticker: "XAG",   slug: "silver",      scores: [m(silverData),      g(silverData),      v(silverData)],      href: "/stocks/silver",      category: "Hard Assets", ...entryMeta(silverData)      },
    { name: "Centrus Energy",    ticker: "LEU",   slug: "leu",         scores: [m(leuData),         g(leuData),         v(leuData)],         href: "/stocks/leu",         category: "Hard Assets", ...entryMeta(leuData)         },
    { name: "NexGen Energy",     ticker: "NXE",   slug: "nxe",         scores: [m(nxeData),         g(nxeData),         v(nxeData)],         href: "/stocks/nxe",         category: "Hard Assets", ...entryMeta(nxeData)         },
    { name: "Kazatomprom",       ticker: "KAP",   slug: "kap",         scores: [m(kapData),         g(kapData),         v(kapData)],         href: "/stocks/kap",         category: "Hard Assets", ...entryMeta(kapData)         },
    { name: "Uranium Energy",    ticker: "UEC",   slug: "uec",         scores: [m(uecData),         g(uecData),         v(uecData)],         href: "/stocks/uec",         category: "Hard Assets", ...entryMeta(uecData)         },
    { name: "Costco",            ticker: "COST",  slug: "costco",      scores: [m(costcoData),      g(costcoData),      v(costcoData)],      href: "/stocks/costco",      category: "Financials",  ...entryMeta(costcoData)      },
    { name: "Walt Disney",       ticker: "DIS",   slug: "disney",      scores: [m(disneyData),      g(disneyData),      v(disneyData)],      href: "/stocks/disney",      category: "Other",       ...entryMeta(disneyData)      },
    { name: "ServiceNow",        ticker: "NOW",   slug: "now",         scores: [m(nowData),         g(nowData),         v(nowData)],         href: "/stocks/now",         category: "Big Tech",    ...entryMeta(nowData)         },
    { name: "Oracle",            ticker: "ORCL",  slug: "orcl",        scores: [m(orclData),        g(orclData),        v(orclData)],        href: "/stocks/orcl",        category: "Big Tech",    ...entryMeta(orclData)        },
    { name: "TransDigm",         ticker: "TDG",   slug: "tdg",         scores: [m(tdgData),         g(tdgData),         v(tdgData)],         href: "/stocks/tdg",         category: "Industrials", ...entryMeta(tdgData)         },
    { name: "Lockheed Martin",   ticker: "LMT",   slug: "lmt",         scores: [m(lmtData),         g(lmtData),         v(lmtData)],         href: "/stocks/lmt",         category: "Industrials", ...entryMeta(lmtData)         },
    { name: "NextEra Energy",    ticker: "NEE",   slug: "nee",         scores: [m(neeData),         g(neeData),         v(neeData)],         href: "/stocks/nee",         category: "Other",       ...entryMeta(neeData)         },
    { name: "MSCI",              ticker: "MSCI",  slug: "msci",        scores: [m(msciData),        g(msciData),        v(msciData)],        href: "/stocks/msci",        category: "Financials",  ...entryMeta(msciData)        },
    { name: "SoFi Technologies", ticker: "SOFI",  slug: "sofi",        scores: [m(sofiData),        g(sofiData),        v(sofiData)],        href: "/stocks/sofi",        category: "Financials",  ...entryMeta(sofiData)        },
    { name: "Strategy Inc.",     ticker: "MSTR",  slug: "mstr",        scores: [m(mstrData),        g(mstrData),        v(mstrData)],        href: "/stocks/mstr",        category: "Hard Assets", ...entryMeta(mstrData)        },
    { name: "Cloudflare",        ticker: "NET",   slug: "net",         scores: [m(netData),         g(netData),         v(netData)],         href: "/stocks/net",         category: "Big Tech",    ...entryMeta(netData)         },
    { name: "Axon Enterprise",   ticker: "AXON",  slug: "axon",        scores: [m(axonData),        g(axonData),        v(axonData)],        href: "/stocks/axon",        category: "Industrials", ...entryMeta(axonData)        },
    { name: "AppLovin",          ticker: "APP",   slug: "applovin",    scores: [m(appData),         g(appData),         v(appData)],         href: "/stocks/applovin",    category: "Big Tech",    ...entryMeta(appData)         },
    { name: "Arista Networks",   ticker: "ANET",  slug: "anet",        scores: [m(anetData),        g(anetData),        v(anetData)],        href: "/stocks/anet",        category: "Big Tech",    ...entryMeta(anetData)        },
    { name: "Fair Isaac",        ticker: "FICO",  slug: "fico",        scores: [m(ficoData),        g(ficoData),        v(ficoData)],        href: "/stocks/fico",        category: "Financials",  ...entryMeta(ficoData)        },
    { name: "The Trade Desk",    ticker: "TTD",   slug: "ttd",         scores: [m(ttdData),         g(ttdData),         v(ttdData)],         href: "/stocks/ttd",         category: "Big Tech",    ...entryMeta(ttdData)         },
    { name: "Palo Alto Networks",ticker: "PANW",  slug: "panw",        scores: [m(panwData),        g(panwData),        v(panwData)],        href: "/stocks/panw",        category: "Big Tech",    ...entryMeta(panwData)        },
    { name: "Arm Holdings",      ticker: "ARM",   slug: "arm",         scores: [m(armData),         g(armData),         v(armData)],         href: "/stocks/arm",         category: "Big Tech",    ...entryMeta(armData)         },
    { name: "Coinbase Global",   ticker: "COIN",  slug: "coin",        scores: [m(coinData),        g(coinData),        v(coinData)],        href: "/stocks/coin",        category: "Financials",  ...entryMeta(coinData)        },
    { name: "Reddit",            ticker: "RDDT",  slug: "rddt",        scores: [m(rddtData),        g(rddtData),        v(rddtData)],        href: "/stocks/rddt",        category: "Big Tech",    ...entryMeta(rddtData)        },
    { name: "Sea Limited",       ticker: "SE",    slug: "sea",         scores: [m(seaData),         g(seaData),         v(seaData)],         href: "/stocks/sea",         category: "Other",       ...entryMeta(seaData)         },
    { name: "Okta",              ticker: "OKTA",  slug: "okta",        scores: [m(oktaData),        g(oktaData),        v(oktaData)],        href: "/stocks/okta",        category: "Big Tech",    ...entryMeta(oktaData)        },
    { name: "Duolingo",          ticker: "DUOL",  slug: "duolingo",    scores: [m(duolingoData),    g(duolingoData),    v(duolingoData)],    href: "/stocks/duolingo",    category: "Other",       ...entryMeta(duolingoData)    },
    { name: "Robinhood Markets", ticker: "HOOD",  slug: "hood",        scores: [m(hoodData),        g(hoodData),        v(hoodData)],        href: "/stocks/hood",        category: "Financials",  ...entryMeta(hoodData)        },
    { name: "Thermo Fisher Scientific", ticker: "TMO", slug: "tmo",    scores: [m(tmoData),         g(tmoData),         v(tmoData)],         href: "/stocks/tmo",         category: "Healthcare",  ...entryMeta(tmoData)         },
    { name: "KLA Corporation",   ticker: "KLAC",  slug: "klac",        scores: [m(klacData),        g(klacData),        v(klacData)],        href: "/stocks/klac",        category: "Big Tech",    ...entryMeta(klacData)        },
    { name: "Cheniere Energy",   ticker: "LNG",   slug: "lng",         scores: [m(lngData),         g(lngData),         v(lngData)],         href: "/stocks/lng",         category: "Other",       ...entryMeta(lngData)         },
    { name: "Super Micro Computer", ticker: "SMCI", slug: "smci",      scores: [m(smciData),        g(smciData),        v(smciData)],        href: "/stocks/smci",        category: "Big Tech",    ...entryMeta(smciData)        },
    { name: "Vertiv Holdings",   ticker: "VRT",   slug: "vrt",         scores: [m(vrtData),         g(vrtData),         v(vrtData)],         href: "/stocks/vrt",         category: "Industrials", ...entryMeta(vrtData)         },
    { name: "Dell Technologies", ticker: "DELL",  slug: "dell",        scores: [m(dellData),        g(dellData),        v(dellData)],        href: "/stocks/dell",        category: "Big Tech",    ...entryMeta(dellData)        },
    { name: "Credo Technology",  ticker: "CRDO",  slug: "crdo",        scores: [m(crdoData),        g(crdoData),        v(crdoData)],        href: "/stocks/crdo",        category: "Big Tech",    ...entryMeta(crdoData)        },
    { name: "Novo Nordisk",      ticker: "NVO",   slug: "nvo",         scores: [m(nvoData),         g(nvoData),         v(nvoData)],         href: "/stocks/nvo",         category: "Healthcare",  ...entryMeta(nvoData)         },
    { name: "Hims & Hers Health",ticker: "HIMS",  slug: "hims",        scores: [m(himsData),        g(himsData),        v(himsData)],        href: "/stocks/hims",        category: "Healthcare",  ...entryMeta(himsData)        },
    { name: "Spotify",           ticker: "SPOT",  slug: "spot",        scores: [m(spotData),        g(spotData),        v(spotData)],        href: "/stocks/spot",        category: "Big Tech",    ...entryMeta(spotData)        },
    { name: "Uber Technologies", ticker: "UBER",  slug: "uber",        scores: [m(uberData),        g(uberData),        v(uberData)],        href: "/stocks/uber",        category: "Big Tech",    ...entryMeta(uberData)        },
    { name: "Airbnb",            ticker: "ABNB",  slug: "abnb",        scores: [m(abnbData),        g(abnbData),        v(abnbData)],        href: "/stocks/abnb",        category: "Big Tech",    ...entryMeta(abnbData)        },
    { name: "Keysight Technologies", ticker: "KEYS", slug: "keys",     scores: [m(keysData),        g(keysData),        v(keysData)],        href: "/stocks/keys",        category: "Industrials", ...entryMeta(keysData)        },
    { name: "Keyence Corporation",ticker: "6861.T",slug: "keyence",    scores: [m(keyenceData),     g(keyenceData),     v(keyenceData)],     href: "/stocks/keyence",     category: "Industrials", ...entryMeta(keyenceData)     },
    { name: "Caterpillar",       ticker: "CAT",   slug: "cat",         scores: [m(catData),         g(catData),         v(catData)],         href: "/stocks/cat",         category: "Industrials", ...entryMeta(catData)         },
    { name: "Deere & Company",   ticker: "DE",    slug: "de",          scores: [m(deData),          g(deData),          v(deData)],          href: "/stocks/de",          category: "Industrials", ...entryMeta(deData)          },
    { name: "Eaton Corporation", ticker: "ETN",   slug: "etn",         scores: [m(etnData),         g(etnData),         v(etnData)],         href: "/stocks/etn",         category: "Industrials", ...entryMeta(etnData)         },
    { name: "Nike",              ticker: "NKE",   slug: "nke",         scores: [m(nkeData),         g(nkeData),         v(nkeData)],         href: "/stocks/nke",         category: "Other",       ...entryMeta(nkeData)         },
    { name: "Lululemon Athletica",ticker: "LULU", slug: "lulu",        scores: [m(luluData),        g(luluData),        v(luluData)],        href: "/stocks/lulu",        category: "Other",       ...entryMeta(luluData)        },
    { name: "Estée Lauder",      ticker: "EL",    slug: "el",          scores: [m(elData),          g(elData),          v(elData)],          href: "/stocks/el",          category: "Other",       ...entryMeta(elData)          },
    { name: "Alibaba Group",     ticker: "BABA",  slug: "baba",        scores: [m(babaData),        g(babaData),        v(babaData)],        href: "/stocks/baba",        category: "Big Tech",    ...entryMeta(babaData)        },
    { name: "PDD Holdings",      ticker: "PDD",   slug: "pdd",         scores: [m(pddData),         g(pddData),         v(pddData)],         href: "/stocks/pdd",         category: "Other",       ...entryMeta(pddData)         },
    { name: "Baidu",             ticker: "BIDU",  slug: "bidu",        scores: [m(biduData),        g(biduData),        v(biduData)],        href: "/stocks/bidu",        category: "Big Tech",    ...entryMeta(biduData)        },
    { name: "Snowflake",         ticker: "SNOW",  slug: "snow",        scores: [m(snowData),        g(snowData),        v(snowData)],        href: "/stocks/snow",        category: "Big Tech",    ...entryMeta(snowData)        },
    { name: "Datadog",           ticker: "DDOG",  slug: "ddog",        scores: [m(ddogData),        g(ddogData),        v(ddogData)],        href: "/stocks/ddog",        category: "Big Tech",    ...entryMeta(ddogData)        },
    { name: "MongoDB",           ticker: "MDB",   slug: "mdb",         scores: [m(mdbData),         g(mdbData),         v(mdbData)],         href: "/stocks/mdb",         category: "Big Tech",    ...entryMeta(mdbData)         },
    { name: "Synopsys",          ticker: "SNPS",  slug: "snps",        scores: [m(snpsData),        g(snpsData),        v(snpsData)],        href: "/stocks/snps",        category: "Big Tech",    ...entryMeta(snpsData)        },
    { name: "Cadence Design Systems", ticker: "CDNS", slug: "cdns",   scores: [m(cdnsData),        g(cdnsData),        v(cdnsData)],        href: "/stocks/cdns",        category: "Big Tech",    ...entryMeta(cdnsData)        },
    { name: "Bloom Energy",      ticker: "BE",    slug: "be",          scores: [m(beData),          g(beData),          v(beData)],          href: "/stocks/be",          category: "Industrials", ...entryMeta(beData)          },
    { name: "CoreWeave",         ticker: "CRWV",  slug: "crwv",        scores: [m(crwvData),        g(crwvData),        v(crwvData)],        href: "/stocks/crwv",        category: "Big Tech",    ...entryMeta(crwvData)        },
    { name: "Nebius Group",      ticker: "NBIS",  slug: "nbis",        scores: [m(nbisData),        g(nbisData),        v(nbisData)],        href: "/stocks/nbis",        category: "Big Tech",    ...entryMeta(nbisData)        },
    { name: "JPMorgan Chase",    ticker: "JPM",   slug: "jpm",         scores: [m(jpmData),         g(jpmData),         v(jpmData)],         href: "/stocks/jpm",         category: "Financials",  ...entryMeta(jpmData)         },
    { name: "Blackstone",        ticker: "BX",    slug: "bx",          scores: [m(bxData),          g(bxData),          v(bxData)],          href: "/stocks/bx",          category: "Financials",  ...entryMeta(bxData)          },
    { name: "KKR & Co",          ticker: "KKR",   slug: "kkr",         scores: [m(kkrData),         g(kkrData),         v(kkrData)],         href: "/stocks/kkr",         category: "Financials",  ...entryMeta(kkrData)         },
    { name: "Goldman Sachs",     ticker: "GS",    slug: "gs",          scores: [m(gsData),          g(gsData),          v(gsData)],          href: "/stocks/gs",          category: "Financials",  ...entryMeta(gsData)          },
    { name: "Morgan Stanley",    ticker: "MS",    slug: "ms",          scores: [m(msData),          g(msData),          v(msData)],          href: "/stocks/ms",          category: "Financials",  ...entryMeta(msData)          },
    { name: "Quanta Services",   ticker: "PWR",   slug: "pwr",         scores: [m(pwrData),         g(pwrData),         v(pwrData)],         href: "/stocks/pwr",         category: "Industrials", ...entryMeta(pwrData)         },
    { name: "Trane Technologies",ticker: "TT",    slug: "tt",          scores: [m(ttData),          g(ttData),          v(ttData)],          href: "/stocks/tt",          category: "Industrials", ...entryMeta(ttData)          },
    { name: "Honeywell",         ticker: "HON",   slug: "hon",         scores: [m(honData),         g(honData),         v(honData)],         href: "/stocks/hon",         category: "Industrials", ...entryMeta(honData)         },
    { name: "Qualcomm",          ticker: "QCOM",  slug: "qcom",        scores: [m(qcomData),        g(qcomData),        v(qcomData)],        href: "/stocks/qcom",        category: "Big Tech",    ...entryMeta(qcomData)        },
    { name: "Elevance Health",   ticker: "ELV",   slug: "elv",         scores: [m(elvData),         g(elvData),         v(elvData)],         href: "/stocks/elv",         category: "Healthcare",  ...entryMeta(elvData)         },
    { name: "Vertex Pharmaceuticals", ticker: "VRTX", slug: "vrtx",   scores: [m(vrtxData),        g(vrtxData),        v(vrtxData)],        href: "/stocks/vrtx",        category: "Healthcare",  ...entryMeta(vrtxData)        },
    { name: "Regeneron",         ticker: "REGN",  slug: "regn",        scores: [m(regnData),        g(regnData),        v(regnData)],        href: "/stocks/regn",        category: "Healthcare",  ...entryMeta(regnData)        },
    { name: "DoorDash",          ticker: "DASH",  slug: "dash",        scores: [m(dashData),        g(dashData),        v(dashData)],        href: "/stocks/dash",        category: "Other",       ...entryMeta(dashData)        },
    { name: "Roblox",            ticker: "RBLX",  slug: "rblx",        scores: [m(rblxData),        g(rblxData),        v(rblxData)],        href: "/stocks/rblx",        category: "Other",       ...entryMeta(rblxData)        },
    { name: "iShares Semiconductor ETF", ticker: "SOXX", slug: "soxx", scores: [m(soxxData),        g(soxxData),        v(soxxData)],        href: "/stocks/soxx",        category: "Big Tech",    ...entryMeta(soxxData)        },
    { name: "Vanguard S&P 500 ETF", ticker: "VOO",  slug: "voo",        scores: [m(vooData),         g(vooData),         v(vooData)],         href: "/stocks/voo",         category: "Other",       ...entryMeta(vooData)         },
    { name: "SpaceX",            ticker: "SPCX",  slug: "spacex",      scores: [m(spacexData),      g(spacexData),      v(spacexData)],      href: "/stocks/spacex",      category: "Industrials", ...entryMeta(spacexData)      },
    { name: "INNIO",             ticker: "INIO",  slug: "inio",        scores: [m(inioData),        g(inioData),        v(inioData)],        href: "/stocks/inio",        category: "Industrials", ...entryMeta(inioData)        },
    { name: "Rocket Lab",        ticker: "RKLB",  slug: "rklb",        scores: [m(rklbData),        g(rklbData),        v(rklbData)],        href: "/stocks/rklb",        category: "Industrials", ...entryMeta(rklbData)        },
    { name: "Amkor Technology",  ticker: "AMKR",  slug: "amkr",        scores: [m(amkrData),        g(amkrData),        v(amkrData)],        href: "/stocks/amkr",        category: "Big Tech",    ...entryMeta(amkrData)        },
    { name: "Zeta Global",       ticker: "ZETA",  slug: "zeta",        scores: [m(zetaData),        g(zetaData),        v(zetaData)],        href: "/stocks/zeta",        category: "Big Tech",    ...entryMeta(zetaData)        },
    { name: "Samsung Electronics", ticker: "005930.KS", slug: "samsung", scores: [m(samsungData),   g(samsungData),     v(samsungData)],     href: "/stocks/samsung",     category: "Big Tech",    ...entryMeta(samsungData)     },
    { name: "Rockwell Automation", ticker: "ROK",   slug: "rok",         scores: [m(rokData),         g(rokData),         v(rokData)],         href: "/stocks/rok",         category: "Industrials", ...entryMeta(rokData)         },
    { name: "Teradyne",          ticker: "TER",   slug: "ter",         scores: [m(terData),         g(terData),         v(terData)],         href: "/stocks/ter",         category: "Industrials", ...entryMeta(terData)         },
    { name: "Harmonic Drive",    ticker: "HSYDF", slug: "harmonic",    scores: [m(harmonicData),    g(harmonicData),    v(harmonicData)],    href: "/stocks/harmonic",    category: "Industrials", ...entryMeta(harmonicData)    },
    { name: "IonQ",              ticker: "IONQ",  slug: "ionq",        scores: [m(ionqData),        g(ionqData),        v(ionqData)],        href: "/stocks/ionq",        category: "Big Tech",    ...entryMeta(ionqData)        },
    { name: "D-Wave Quantum",    ticker: "QBTS",  slug: "qbts",        scores: [m(qbtsData),        g(qbtsData),        v(qbtsData)],        href: "/stocks/qbts",        category: "Big Tech",    ...entryMeta(qbtsData)        },
    { name: "Rigetti Computing", ticker: "RGTI",  slug: "rgti",        scores: [m(rgtiData),        g(rgtiData),        v(rgtiData)],        href: "/stocks/rgti",        category: "Big Tech",    ...entryMeta(rgtiData)        },
    { name: "Quantum Computing Inc.", ticker: "QUBT", slug: "qubt",    scores: [m(qubtData),        g(qubtData),        v(qubtData)],        href: "/stocks/qubt",        category: "Big Tech",    ...entryMeta(qubtData)        },
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
