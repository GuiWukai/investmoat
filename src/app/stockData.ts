export const stockData = [
    { name: "Amazon", ticker: "AMZN", scores: [95, 88, 72], href: "/stocks/amazon", category: "Big Tech" },
    { name: "Meta", ticker: "META", scores: [92, 85, 65], href: "/stocks/meta", category: "Big Tech" },
    { name: "Microsoft", ticker: "MSFT", scores: [98, 92, 68], href: "/stocks/msft", category: "Big Tech" },
    { name: "NVIDIA", ticker: "NVDA", scores: [97, 95, 65], href: "/stocks/nvda", category: "Big Tech" },
    { name: "AMD", ticker: "AMD", scores: [88, 92, 58], href: "/stocks/amd", category: "Big Tech" },
    { name: "Tesla", ticker: "TSLA", scores: [82, 89, 55], href: "/stocks/tesla", category: "Big Tech" },
    { name: "Visa", ticker: "V", scores: [99, 82, 75], href: "/stocks/visa", category: "Financials" },
    { name: "Mastercard", ticker: "MA", scores: [98, 88, 70], href: "/stocks/mastercard", category: "Financials" },
    { name: "S&P Global", ticker: "SPGI", scores: [97, 78, 75], href: "/stocks/spgi", category: "Financials" },
    { name: "Intuit", ticker: "INTU", scores: [94, 84, 62], href: "/stocks/intuit", category: "Financials" },
    { name: "Bitcoin", ticker: "BTC", scores: [99, 85, 50], href: "/stocks/btc", category: "Hard Assets" },
    { name: "K92 Mining", ticker: "KNT", scores: [60, 95, 82], href: "/stocks/k92", category: "Hard Assets" },
];

export const getAverageScore = (scores: number[]) => {
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
};
