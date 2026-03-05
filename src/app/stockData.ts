// Moat scores are sourced from each stock's JSON file (src/data/stocks/*.json).
// The scores array is [moatScore, growthScore, valuationScore].
// bearTarget/baseTarget/bullTarget mirror the scenarios in each stock's JSON.
// RULE: Maximum 20 stocks in the portfolio — ranked by average score across all three dimensions.
// RULE: Minimum average score of 75 required for inclusion.

export const stockData = [
    { name: "Microsoft",  ticker: "MSFT", slug: "msft",       scores: [84, 92, 75], href: "/stocks/msft",       category: "Big Tech",    bearTarget: "$300",        baseTarget: "$450",        bullTarget: "$580"         },
    { name: "Mastercard", ticker: "MA",   slug: "mastercard", scores: [88, 88, 71], href: "/stocks/mastercard", category: "Financials",  bearTarget: "$400",        baseTarget: "$555",        bullTarget: "$700"         },
    { name: "ASML",       ticker: "ASML", slug: "asml",       scores: [94, 85, 67], href: "/stocks/asml",       category: "Big Tech",    bearTarget: "$900",        baseTarget: "$1,500",      bullTarget: "$2,200"       },
    { name: "NVIDIA",     ticker: "NVDA", slug: "nvda",       scores: [85, 95, 65], href: "/stocks/nvda",       category: "Big Tech",    bearTarget: "$100",        baseTarget: "$175",        bullTarget: "$280"         },
    { name: "Amazon",     ticker: "AMZN", slug: "amazon",     scores: [80, 88, 76], href: "/stocks/amazon",     category: "Big Tech",    bearTarget: "$145",        baseTarget: "$225",        bullTarget: "$310"         },
    { name: "S&P Global", ticker: "SPGI", slug: "spgi",       scores: [88, 78, 78], href: "/stocks/spgi",       category: "Financials",  bearTarget: "$400",        baseTarget: "$500",        bullTarget: "$610"         },
    { name: "Visa",       ticker: "V",    slug: "visa",       scores: [90, 82, 71], href: "/stocks/visa",       category: "Financials",  bearTarget: "$245",        baseTarget: "$335",        bullTarget: "$420"         },
    { name: "Google",     ticker: "GOOGL", slug: "google",   scores: [88, 82, 72], href: "/stocks/google",     category: "Big Tech",    bearTarget: "$130",        baseTarget: "$200",        bullTarget: "$270"         },
    { name: "TSMC",       ticker: "TSM",  slug: "tsm",        scores: [90, 82, 70], href: "/stocks/tsm",        category: "Big Tech",    bearTarget: "$120",        baseTarget: "$200",        bullTarget: "$280"         },
    { name: "Intuit",     ticker: "INTU", slug: "intuit",     scores: [80, 84, 75], href: "/stocks/intuit",     category: "Financials",  bearTarget: "$300",        baseTarget: "$480",        bullTarget: "$650"         },
    { name: "Bitcoin",    ticker: "BTC",  slug: "btc",        scores: [76, 85, 77], href: "/stocks/btc",        category: "Hard Assets", bearTarget: "$45,000",     baseTarget: "$120,000",    bullTarget: "$300,000+"    },
    { name: "Palantir",   ticker: "PLTR", slug: "pltr",       scores: [78, 88, 71], href: "/stocks/pltr",       category: "Big Tech",    bearTarget: "$80",         baseTarget: "$155",        bullTarget: "$260"         },
    { name: "Salesforce", ticker: "CRM",  slug: "crm",        scores: [78, 80, 79], href: "/stocks/crm",        category: "Financials",  bearTarget: "$150",        baseTarget: "$250",        bullTarget: "$350"         },
    { name: "Broadcom",   ticker: "AVGO", slug: "avgo",       scores: [82, 88, 65], href: "/stocks/avgo",       category: "Big Tech",    bearTarget: "$120",        baseTarget: "$210",        bullTarget: "$320"         },
    { name: "CrowdStrike", ticker: "CRWD", slug: "crowdstrike", scores: [85, 87, 60], href: "/stocks/crowdstrike", category: "Big Tech", bearTarget: "$200",        baseTarget: "$380",        bullTarget: "$600"         },
    { name: "Meta",       ticker: "META", slug: "meta",       scores: [73, 85, 72], href: "/stocks/meta",       category: "Big Tech",    bearTarget: "$460",        baseTarget: "$720",        bullTarget: "$950"         },
    { name: "Apple",      ticker: "AAPL", slug: "aapl",       scores: [88, 72, 68], href: "/stocks/aapl",       category: "Big Tech",    bearTarget: "$155",        baseTarget: "$240",        bullTarget: "$350"         },
    { name: "Tesla",      ticker: "TSLA", slug: "tesla",      scores: [74, 87, 65], href: "/stocks/tesla",      category: "Big Tech",    bearTarget: "$150",        baseTarget: "$400",        bullTarget: "$550"         },
    { name: "Micron",     ticker: "MU",   slug: "micron",     scores: [62, 87, 76], href: "/stocks/micron",     category: "Big Tech",    bearTarget: "$55",         baseTarget: "$120",        bullTarget: "$200"         },
    { name: "Intuitive Surgical", ticker: "ISRG", slug: "isrg", scores: [88, 82, 62], href: "/stocks/isrg",   category: "Healthcare",  bearTarget: "$280",        baseTarget: "$520",        bullTarget: "$750"         },
];

export const getAverageScore = (scores: number[]) => {
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
};
