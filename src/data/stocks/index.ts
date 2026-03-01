import type { StockAnalysisData } from '@/types/stockAnalysis';

import amazon from './amazon.json';
import google from './google.json';
import msft from './msft.json';
import nvda from './nvda.json';
import meta from './meta.json';
import asml from './asml.json';
import amd from './amd.json';
import nflx from './nflx.json';
import tesla from './tesla.json';
import visa from './visa.json';
import mastercard from './mastercard.json';
import crm from './crm.json';
import adbe from './adbe.json';
import spgi from './spgi.json';
import intuit from './intuit.json';
import gold from './gold.json';
import btc from './btc.json';
import k92 from './k92.json';
import pltr from './pltr.json';

const stocksMap: Record<string, StockAnalysisData> = {
  amazon: amazon as StockAnalysisData,
  google: google as StockAnalysisData,
  msft: msft as StockAnalysisData,
  nvda: nvda as StockAnalysisData,
  meta: meta as StockAnalysisData,
  asml: asml as StockAnalysisData,
  amd: amd as StockAnalysisData,
  nflx: nflx as StockAnalysisData,
  tesla: tesla as StockAnalysisData,
  visa: visa as StockAnalysisData,
  mastercard: mastercard as StockAnalysisData,
  crm: crm as StockAnalysisData,
  adbe: adbe as StockAnalysisData,
  spgi: spgi as StockAnalysisData,
  intuit: intuit as StockAnalysisData,
  gold: gold as StockAnalysisData,
  btc: btc as StockAnalysisData,
  k92: k92 as StockAnalysisData,
  pltr: pltr as StockAnalysisData,
};

export function getStockData(slug: string): StockAnalysisData | null {
  return stocksMap[slug.toLowerCase()] ?? null;
}

export function getAllSlugs(): string[] {
  return Object.keys(stocksMap);
}
