import { getAverageScore } from "../../stockData";
import { computeValuationScore, parseScenarioPrice } from "@/lib/valuationScore";

export function liveCompositeScore(
  price: number | null | undefined,
  moat: number,
  growth: number,
  fallbackVal: number,
  bearTarget: string,
  baseTarget: string,
  bullTarget: string,
): number {
  const bear = parseScenarioPrice(bearTarget);
  const base = parseScenarioPrice(baseTarget);
  const bull = parseScenarioPrice(bullTarget);
  if (price != null && bear && base && bull) {
    const liveVal = computeValuationScore(price, bear, base, bull);
    return Math.round(getAverageScore([moat, growth, liveVal]));
  }
  return Math.round(getAverageScore([moat, growth, fallbackVal]));
}
