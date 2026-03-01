// Moat scores are sourced from each stock's JSON file (src/data/stocks/*.json).
// The scores array is [moatScore, growthScore, valuationScore].
// bearTarget/baseTarget/bullTarget mirror the scenarios in each stock's JSON.

export const stockData = [
    { name: "Amazon",     ticker: "AMZN", slug: "amazon",     scores: [80, 88, 72], href: "/stocks/amazon",     category: "Big Tech",    bearTarget: "$140",        baseTarget: "$210",        bullTarget: "$265"         },
    { name: "Google",     ticker: "GOOGL", slug: "google",    scores: [88, 82, 72], href: "/stocks/google",     category: "Big Tech",    bearTarget: "$130",        baseTarget: "$200",        bullTarget: "$270"         },
    { name: "Meta",       ticker: "META", slug: "meta",       scores: [73, 85, 68], href: "/stocks/meta",       category: "Big Tech",    bearTarget: "$380",        baseTarget: "$520",        bullTarget: "$650"         },
    { name: "Microsoft",  ticker: "MSFT", slug: "msft",       scores: [84, 92, 68], href: "/stocks/msft",       category: "Big Tech",    bearTarget: "$350",        baseTarget: "$450",        bullTarget: "$550"         },
    { name: "NVIDIA",     ticker: "NVDA", slug: "nvda",       scores: [85, 95, 65], href: "/stocks/nvda",       category: "Big Tech",    bearTarget: "$600",        baseTarget: "$950",        bullTarget: "$1,200"       },
    { name: "AMD",        ticker: "AMD",  slug: "amd",        scores: [52, 92, 58], href: "/stocks/amd",        category: "Big Tech",    bearTarget: "$120",        baseTarget: "$210",        bullTarget: "$280"         },
    { name: "ASML",       ticker: "ASML", slug: "asml",       scores: [94, 85, 72], href: "/stocks/asml",       category: "Big Tech",    bearTarget: "$750",        baseTarget: "$1,100",      bullTarget: "$1,400"       },
    { name: "Netflix",    ticker: "NFLX", slug: "nflx",       scores: [63, 88, 52], href: "/stocks/nflx",       category: "Big Tech",    bearTarget: "$450",        baseTarget: "$680",        bullTarget: "$850"         },
    { name: "Tesla",      ticker: "TSLA", slug: "tesla",      scores: [74, 89, 55], href: "/stocks/tesla",      category: "Big Tech",    bearTarget: "$100",        baseTarget: "$220",        bullTarget: "$450"         },
    { name: "Visa",       ticker: "V",    slug: "visa",       scores: [90, 82, 75], href: "/stocks/visa",       category: "Financials",  bearTarget: "$240",        baseTarget: "$320",        bullTarget: "$380"         },
    { name: "Mastercard", ticker: "MA",   slug: "mastercard", scores: [88, 88, 70], href: "/stocks/mastercard", category: "Financials",  bearTarget: "$390",        baseTarget: "$520",        bullTarget: "$610"         },
    { name: "Palantir",   ticker: "PLTR", slug: "pltr",       scores: [78, 88, 48], href: "/stocks/pltr",       category: "Big Tech",    bearTarget: "$55",         baseTarget: "$120",        bullTarget: "$200"         },
    { name: "Salesforce", ticker: "CRM",  slug: "crm",        scores: [78, 80, 88], href: "/stocks/crm",        category: "Financials",  bearTarget: "$240",        baseTarget: "$330",        bullTarget: "$400"         },
    { name: "Adobe",      ticker: "ADBE", slug: "adbe",       scores: [58, 82, 64], href: "/stocks/adbe",       category: "Financials",  bearTarget: "$380",        baseTarget: "$550",        bullTarget: "$680"         },
    { name: "S&P Global", ticker: "SPGI", slug: "spgi",       scores: [88, 78, 75], href: "/stocks/spgi",       category: "Financials",  bearTarget: "$350",        baseTarget: "$480",        bullTarget: "$560"         },
    { name: "Intuit",     ticker: "INTU", slug: "intuit",     scores: [80, 84, 62], href: "/stocks/intuit",     category: "Financials",  bearTarget: "$520",        baseTarget: "$700",        bullTarget: "$850"         },
    { name: "Gold",       ticker: "XAU",  slug: "gold",       scores: [67, 50, 55], href: "/stocks/gold",       category: "Hard Assets", bearTarget: "$2,200",      baseTarget: "$3,200",      bullTarget: "$4,500"       },
    { name: "Bitcoin",    ticker: "BTC",  slug: "btc",        scores: [76, 85, 50], href: "/stocks/btc",        category: "Hard Assets", bearTarget: "$45,000",     baseTarget: "$95,000",     bullTarget: "$250,000"     },
    { name: "K92 Mining", ticker: "KNT",  slug: "k92",        scores: [42, 85, 60], href: "/stocks/k92",        category: "Hard Assets", bearTarget: "$16",         baseTarget: "$30",         bullTarget: "$45"          },
];

export const getAverageScore = (scores: number[]) => {
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
};
