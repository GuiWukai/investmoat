// Moat scores are sourced from each stock's JSON file (src/data/stocks/*.json).
// The scores array is [moatScore, growthScore, valuationScore].

export const stockData = [
    { name: "Amazon",     ticker: "AMZN", scores: [80, 88, 72], href: "/stocks/amazon",     category: "Big Tech"    },
    { name: "Meta",       ticker: "META", scores: [73, 85, 68], href: "/stocks/meta",       category: "Big Tech"    },
    { name: "Microsoft",  ticker: "MSFT", scores: [84, 92, 68], href: "/stocks/msft",       category: "Big Tech"    },
    { name: "NVIDIA",     ticker: "NVDA", scores: [85, 95, 65], href: "/stocks/nvda",       category: "Big Tech"    },
    { name: "AMD",        ticker: "AMD",  scores: [52, 92, 58], href: "/stocks/amd",        category: "Big Tech"    },
    { name: "ASML",       ticker: "ASML", scores: [94, 85, 72], href: "/stocks/asml",       category: "Big Tech"    },
    { name: "Netflix",    ticker: "NFLX", scores: [63, 88, 52], href: "/stocks/nflx",       category: "Big Tech"    },
    { name: "Tesla",      ticker: "TSLA", scores: [74, 89, 55], href: "/stocks/tesla",      category: "Big Tech"    },
    { name: "Visa",       ticker: "V",    scores: [90, 82, 75], href: "/stocks/visa",       category: "Financials"  },
    { name: "Mastercard", ticker: "MA",   scores: [88, 88, 70], href: "/stocks/mastercard", category: "Financials"  },
    { name: "Palantir",   ticker: "PLTR", scores: [78, 88, 48], href: "/stocks/pltr",       category: "Big Tech"    },
    { name: "Salesforce", ticker: "CRM",  scores: [78, 80, 88], href: "/stocks/crm",        category: "Financials"  },
    { name: "Adobe",      ticker: "ADBE", scores: [58, 82, 64], href: "/stocks/adbe",       category: "Financials"  },
    { name: "S&P Global", ticker: "SPGI", scores: [88, 78, 75], href: "/stocks/spgi",       category: "Financials"  },
    { name: "Intuit",     ticker: "INTU", scores: [80, 84, 62], href: "/stocks/intuit",     category: "Financials"  },
    { name: "Gold",       ticker: "XAU",  scores: [67, 50, 55], href: "/stocks/gold",       category: "Hard Assets" },
    { name: "Bitcoin",    ticker: "BTC",  scores: [76, 85, 50], href: "/stocks/btc",        category: "Hard Assets" },
    { name: "K92 Mining", ticker: "KNT",  scores: [42, 85, 60], href: "/stocks/k92",        category: "Hard Assets" },
];

export const getAverageScore = (scores: number[]) => {
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
};
