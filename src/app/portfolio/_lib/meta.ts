import { allCoverageData } from "../../stockData";

export const PORTFOLIO_THRESHOLD = 80;
export const MAX_PORTFOLIO = 25;
export const NEAR_TOP_COUNT = 10;
export const SCORE_BASELINE = 70;
export const MAX_WEIGHT_PCT = 10;

export type CoverageStock = (typeof allCoverageData)[number];

export type RankedStock = {
  ticker: string;
  name: string;
  slug: string;
  href: string;
  color: string;
  category: string;
  stock: CoverageStock;
  composite: number;
  rank: number;
};

export const stockMeta: Record<string, { color: string; category: string; exclusionReason?: string }> = {
  AMZN: { color: "#f59e0b", category: "Eco-System" },
  GOOGL: { color: "#4285f4", category: "Big Tech" },
  META:  { color: "#0082fb", category: "Big Tech" },
  MSFT:  { color: "#00a4ef", category: "Core SaaS" },
  NVDA:  { color: "#76b900", category: "AI Infrastructure" },
  AMD:   { color: "#ed1c24", category: "Big Tech",        exclusionReason: "Lowest moat score (52) in the Big Tech category. AMD's competitive edge is execution excellence, not structural lock-in. NVIDIA's CUDA software ecosystem creates switching costs that AMD simply cannot replicate. Strong cyclical growth (92) but no wide moat — a momentum play, not a compounder." },
  ASML:  { color: "#0071c5", category: "Lithography" },
  NFLX:  { color: "#e50914", category: "Big Tech",        exclusionReason: "Content creation is a non-durable moat requiring perpetual capital reinvestment. Worst valuation score (52) reflects an expensive multiple for a business in an intensely competitive streaming market with no decisive technological edge. AI moat score of 63 is weak for the price paid." },
  TSLA:  { color: "#e82127", category: "Clean Tech" },
  V:     { color: "#1a1f71", category: "Payments" },
  MA:    { color: "#eb001b", category: "Payments" },
  PLTR:  { color: "#7b5ea7", category: "AI Analytics" },
  CRWD:  { color: "#e8281b", category: "Cybersecurity" },
  CRM:   { color: "#00a1e0", category: "Enterprise SaaS" },
  ADBE:  { color: "#f44336", category: "Big Tech",        exclusionReason: "Second-lowest moat score (58) signals material AI disruption risk to Creative Cloud. Generative tools — Midjourney, Sora, Canva AI, and native OS features — directly attack Adobe's pricing power and switching costs. The structural moat that once defined this business is visibly weakening." },
  SPGI:  { color: "#cf102d", category: "Financials" },
  INTU:  { color: "#2ca01c", category: "FinTech" },
  XAU:   { color: "#ffd700", category: "Hard Assets",     exclusionReason: "Lowest overall score (57) driven by weak growth (50) and poor valuation basis (55). Gold produces no earnings or cash flows, making intrinsic value impossible to anchor. Valid as a macro fear hedge in a separate allocation, but has no place in a quality-focused compounder portfolio." },
  HG:    { color: "#b87333", category: "Hard Assets" },
  XAG:   { color: "#c0c0c0", category: "Hard Assets" },
  U:     { color: "#d4c419", category: "Hard Assets" },
  BTC:   { color: "#f7931a", category: "Digital Assets" },
  KNT:   { color: "#8b7355", category: "Hard Assets",     exclusionReason: "Weakest moat score in the entire coverage universe (42). Mining is a commodity business with no pricing power, no network effects, and no switching costs. High growth (85) reflects production expansion upside — not the scalable, capital-light compounding this portfolio targets." },
  FCX:   { color: "#b8732d", category: "Hard Assets",     exclusionReason: "Commodity copper producer with no pricing power — FCX sells at LME spot price regardless of asset quality. Indonesia sovereign risk at Grasberg, competition from major miners (Codelco, BHP, Glencore), and earnings volatility disqualify it from a portfolio targeting structural moats and durable compounding." },
  TSM:   { color: "#0071c5", category: "Foundry" },
  MU:    { color: "#0099cc", category: "Memory" },
  ISRG:  { color: "#009688", category: "Healthcare" },
  AVGO:  { color: "#cc0000", category: "Semiconductors" },
  COST:  { color: "#005DAA", category: "Consumer Retail", exclusionReason: "Composite score falls below the portfolio threshold. Costco is a world-class business with an exceptional membership flywheel and 92.9% renewal rates, but a valuation score of 60 (48x+ forward P/E) reflects near-perfection already priced in, and a growth score of 70 is constrained by the pace of physical warehouse expansion. It ranks behind 20 higher-scoring compounders on a risk-adjusted basis." },
  ORCL:  { color: "#C74634", category: "Enterprise Software" },
  TDG:   { color: "#1a5276", category: "Industrials" },
  MSCI:  { color: "#c0392b", category: "Financial Data" },
  UNH:   { color: "#003087", category: "Healthcare" },
  MCO:   { color: "#23539A", category: "Financials" },
  MELI:  { color: "#ffe600", category: "Eco-System" },
  RACE:  { color: "#D40000", category: "Luxury" },
  CEG:   { color: "#0057a8", category: "Utilities" },
  SHOP:  { color: "#96bf48", category: "E-Commerce" },
  LLY:   { color: "#c8102e", category: "Healthcare" },
  ETH:   { color: "#627eea", category: "Digital Assets" },
  SOL:   { color: "#9945ff", category: "Digital Assets" },
  SOFI:  { color: "#6366f1", category: "FinTech" },
  FANUY: { color: "#f59e0b", category: "Robotics" },
  AAPL:  { color: "#a8a8a8", category: "Big Tech" },
  ANET:  { color: "#ff6900", category: "AI Infrastructure" },
  APP:   { color: "#e8341c", category: "AdTech" },
  ARM:   { color: "#0091bd", category: "Semiconductors" },
  AXON:  { color: "#fbbf24", category: "Industrials" },
  CCJ:   { color: "#8b5e3c", category: "Hard Assets" },
  COIN:  { color: "#0052ff", category: "Digital Assets" },
  DIS:   { color: "#1f3572", category: "Media" },
  FICO:  { color: "#c0392b", category: "Financial Data" },
  FIG:   { color: "#f24e1e", category: "Enterprise SaaS" },
  GEV:   { color: "#0066b1", category: "Utilities" },
  ICE:   { color: "#1a3a6b", category: "Financials" },
  LMT:   { color: "#1d4b8f", category: "Industrials" },
  MSTR:  { color: "#ff8c00", category: "Digital Assets" },
  NEE:   { color: "#00aeef", category: "Utilities" },
  NET:   { color: "#f38020", category: "Cybersecurity" },
  NOW:   { color: "#62d84e", category: "Enterprise SaaS" },
  PANW:  { color: "#00c1d5", category: "Cybersecurity" },
  RDDT:  { color: "#ff4500", category: "Big Tech" },
  SE:    { color: "#ee2537", category: "Eco-System" },
  TTD:   { color: "#3363ff", category: "AdTech" },
};

export const CATEGORY_STYLES: Record<string, string> = {
  "Core SaaS":           "bg-blue-500/10 text-blue-400 border-blue-500/15",
  "Enterprise SaaS":     "bg-blue-500/10 text-blue-400 border-blue-500/15",
  "Big Tech":            "bg-blue-500/10 text-blue-400 border-blue-500/15",
  "Enterprise Software": "bg-blue-500/10 text-blue-400 border-blue-500/15",
  "Payments":            "bg-emerald-500/10 text-emerald-400 border-emerald-500/15",
  "Financials":          "bg-emerald-500/10 text-emerald-400 border-emerald-500/15",
  "FinTech":             "bg-emerald-500/10 text-emerald-400 border-emerald-500/15",
  "Financial Data":      "bg-emerald-500/10 text-emerald-400 border-emerald-500/15",
  "AI Infrastructure":   "bg-amber-500/10 text-amber-400 border-amber-500/15",
  "Lithography":         "bg-amber-500/10 text-amber-400 border-amber-500/15",
  "AI Analytics":        "bg-amber-500/10 text-amber-400 border-amber-500/15",
  "Cybersecurity":       "bg-amber-500/10 text-amber-400 border-amber-500/15",
  "Foundry":             "bg-amber-500/10 text-amber-400 border-amber-500/15",
  "Memory":              "bg-amber-500/10 text-amber-400 border-amber-500/15",
  "Semiconductors":      "bg-amber-500/10 text-amber-400 border-amber-500/15",
  "Robotics":            "bg-amber-500/10 text-amber-400 border-amber-500/15",
  "Digital Assets":      "bg-violet-500/10 text-violet-400 border-violet-500/15",
  "Eco-System":          "bg-violet-500/10 text-violet-400 border-violet-500/15",
  "Clean Tech":          "bg-violet-500/10 text-violet-400 border-violet-500/15",
  "E-Commerce":          "bg-violet-500/10 text-violet-400 border-violet-500/15",
  "Hard Assets":         "bg-rose-500/10 text-rose-400 border-rose-500/15",
  "Luxury":              "bg-rose-500/10 text-rose-400 border-rose-500/15",
  "Utilities":           "bg-rose-500/10 text-rose-400 border-rose-500/15",
  "Industrials":         "bg-orange-500/10 text-orange-400 border-orange-500/15",
  "Healthcare":          "bg-teal-500/10 text-teal-400 border-teal-500/15",
  "AdTech":              "bg-orange-500/10 text-orange-400 border-orange-500/15",
  "Media":               "bg-violet-500/10 text-violet-400 border-violet-500/15",
  "Consumer Retail":     "bg-teal-500/10 text-teal-400 border-teal-500/15",
};

export const TECH_CATEGORIES = new Set([
  "Core SaaS", "Enterprise SaaS", "Big Tech",
  "AI Infrastructure", "Lithography", "AI Analytics",
  "Clean Tech", "Eco-System", "Cybersecurity", "Digital Assets",
  "Foundry", "Memory", "Semiconductors", "E-Commerce", "Enterprise Software",
]);
export const FIN_CATEGORIES = new Set(["Payments", "Financials", "FinTech", "Financial Data"]);

export function getScoreColor(s: number) {
  if (s >= 90) return "text-emerald-400";
  if (s >= 80) return "text-blue-400";
  if (s >= 70) return "text-amber-400";
  return "text-rose-400";
}
