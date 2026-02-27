import { tenMoatsData } from "@/app/tenMoatsData";

const m = (ticker: string) => tenMoatsData[ticker].aiResilienceScore;

export const stockData = [
    { name: "Amazon", ticker: "AMZN", scores: [m("AMZN"), 88, 72], href: "/stocks/amazon", category: "Big Tech" },
    { name: "Meta", ticker: "META", scores: [m("META"), 85, 65], href: "/stocks/meta", category: "Big Tech" },
    { name: "Microsoft", ticker: "MSFT", scores: [m("MSFT"), 92, 68], href: "/stocks/msft", category: "Big Tech" },
    { name: "NVIDIA", ticker: "NVDA", scores: [m("NVDA"), 95, 65], href: "/stocks/nvda", category: "Big Tech" },
    { name: "AMD", ticker: "AMD", scores: [m("AMD"), 92, 58], href: "/stocks/amd", category: "Big Tech" },
    { name: "ASML", ticker: "ASML", scores: [m("ASML"), 85, 72], href: "/stocks/asml", category: "Big Tech" },
    { name: "Netflix", ticker: "NFLX", scores: [m("NFLX"), 88, 52], href: "/stocks/nflx", category: "Big Tech" },
    { name: "Tesla", ticker: "TSLA", scores: [m("TSLA"), 89, 55], href: "/stocks/tesla", category: "Big Tech" },
    { name: "Visa", ticker: "V", scores: [m("V"), 82, 75], href: "/stocks/visa", category: "Financials" },
    { name: "Mastercard", ticker: "MA", scores: [m("MA"), 88, 70], href: "/stocks/mastercard", category: "Financials" },
    { name: "Salesforce", ticker: "CRM", scores: [m("CRM"), 80, 68], href: "/stocks/crm", category: "Financials" },
    { name: "Adobe", ticker: "ADBE", scores: [m("ADBE"), 82, 64], href: "/stocks/adbe", category: "Financials" },
    { name: "S&P Global", ticker: "SPGI", scores: [m("SPGI"), 78, 75], href: "/stocks/spgi", category: "Financials" },
    { name: "Intuit", ticker: "INTU", scores: [m("INTU"), 84, 62], href: "/stocks/intuit", category: "Financials" },
    { name: "Gold", ticker: "XAU", scores: [m("XAU"), 50, 55], href: "/stocks/gold", category: "Hard Assets" },
    { name: "Bitcoin", ticker: "BTC", scores: [m("BTC"), 85, 50], href: "/stocks/btc", category: "Hard Assets" },
    { name: "K92 Mining", ticker: "KNT", scores: [m("KNT"), 90, 60], href: "/stocks/k92", category: "Hard Assets" },
];

export const getAverageScore = (scores: number[]) => {
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
};
