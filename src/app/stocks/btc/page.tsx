'use client';

import { MetricCard, ScoreGauge, ScoreTabsRow, AnalysisSection, ScenarioCard, RecommendationBadge, TenMoatsCard } from "@/components/AnalysisComponents";
import { tenMoatsData } from "@/app/tenMoatsData";
import { stockData, getAverageScore } from "@/app/stockData";
import { Coins, Shield, Globe, Lock } from "lucide-react";
import { Card, CardBody, Chip } from "@heroui/react";

export default function BitcoinPage() {
  const overallScore = getAverageScore(stockData.find(s => s.ticker === 'BTC')!.scores);
  return (
    <div className="animate-fade-in space-y-12 pb-12">
      <header className="space-y-6">
        <div className="flex items-center flex-wrap gap-3">
          <Chip color="warning" variant="flat" size="sm">Digital Asset | Hard Money</Chip>
          <Chip color="success" variant="flat" size="sm">Digital Gold</Chip>
        </div>
        <div>
          <h1 className="text-3xl md:text-6xl font-black mb-2 tracking-tight text-[#f7931a]">Bitcoin</h1>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-white/40 font-medium text-sm md:text-base">
            <span>Ticker: <strong className="text-white">BTC</strong></span>
            <span>Market Cap: <strong className="text-white">$1.3T</strong></span>
            <span>Circulating Supply: <strong className="text-white">19.7M / 21M</strong></span>
          </div>
        </div>
        <RecommendationBadge status="Strong Buy" />
      </header>

      <div className="hidden md:grid grid-cols-3 gap-6">
        <MetricCard 
          title="Hash Rate" 
          value="650 EH/s" 
          label="Network Security Standard" 
          icon={<Lock size={20} className="text-white" />} 
          color="#f7931a"
        />
        <MetricCard 
          title="Exchange Balance" 
          value="1.8M BTC" 
          label="Multi-year Lows (Illicit Supply)" 
          icon={<Shield size={20} className="text-white" />} 
          color="#3b82f6"
        />
        <MetricCard 
          title="Address Count" 
          value="52.4M" 
          label="Unique Holders Worldwide" 
          icon={<Globe size={20} className="text-white" />} 
          color="#10b981"
        />
      </div>

      <ScoreTabsRow overallScore={overallScore} tabs={[
        {
          label: "Moat",
          gauge: (<ScoreGauge score={tenMoatsData['BTC'].aiResilienceScore} label="Moat Score" description="Absolute scarcity and the largest decentralized network effect in history." />),
          detail: (
            <div className="space-y-4">
              <Card className="bg-white/5 border-none backdrop-blur-md">
                <CardBody className="p-4 md:p-8">
                  <p className="mb-4">Bitcoin's moat is built on <strong>Math and Decentralization</strong>:</p>
                  <ul className="list-disc pl-6 space-y-4 text-white/60">
                    <li><strong className="text-white">Absolute Scarcity:</strong> Only 21 million will ever exist. Unlike fiat or even gold, the supply curve is perfectly inelastic to demand.</li>
                    <li><strong className="text-white">Network Effect:</strong> As the first and largest crypto asset, Bitcoin has the most liquidity, securest chain, and widest institutional support.</li>
                    <li><strong className="text-white">Property Rights:</strong> A global, permissionless system for storing value that is independent of any central bank or government.</li>
                  </ul>
                </CardBody>
              </Card>
              <TenMoatsCard data={tenMoatsData['BTC']} />
            </div>
          ),
        },
        {
          label: "Growth",
          gauge: (<ScoreGauge score={85} label="Growth Score" description="Institutional adoption via ETFs and sovereign treasury integration." />),
          detail: (
            <div className="space-y-4">
              <MetricCard 
          title="Hash Rate" 
          value="650 EH/s" 
          label="Network Security Standard" 
          icon={<Lock size={20} className="text-white" />} 
          color="#f7931a"
        />
              <MetricCard 
          title="Exchange Balance" 
          value="1.8M BTC" 
          label="Multi-year Lows (Illicit Supply)" 
          icon={<Shield size={20} className="text-white" />} 
          color="#3b82f6"
        />
              <MetricCard 
          title="Address Count" 
          value="52.4M" 
          label="Unique Holders Worldwide" 
          icon={<Globe size={20} className="text-white" />} 
          color="#10b981"
        />
            </div>
          ),
        },
        {
          label: "Value",
          gauge: (<ScoreGauge score={50} label="Valuation Score" description="Relative to M2 money supply and gold market cap parity." />),
          detail: (
            <div className="space-y-4">
              <ScenarioCard
            type="Bear"
            priceTarget="$45,000"
            description="Severe regulatory crackdown and a mass-market risk-off event."
            points={[
              "Banning of self-custody wallets in major jurisdictions",
              "Major ETF provider liquidation due to insolvency",
              "Recession leads to liquidations across all risk assets"
            ]}
          />
              <ScenarioCard
            type="Base"
            priceTarget="$95,000"
            description="Continued ETF inflows and steady adoption as a gold alternative."
            points={[
              "Institutional weighting increases to 1-2% in traditional portfolios",
              "Inflation remains sticky, driving demand for hard assets",
              "Development of Bitcoin Layer 2s increases network utility"
            ]}
          />
              <ScenarioCard
            type="Bull"
            priceTarget="$250,000+"
            description="Sovereign nation adoption and global currency volatility."
            points={[
              "Global central banks begin adding BTC to reserves",
              "Major Fortune 500 companies follow MicroStrategy's treasury model",
              "Hyper-inflation in G7 currencies triggers global flight to safety"
            ]}
          />
            </div>
          ),
        },
      ]} />

      <div className="hidden md:block"><AnalysisSection title="The Scarcity Moat">
        <div className="space-y-6">
          <Card className="bg-white/5 border-none backdrop-blur-md">
            <CardBody className="p-4 md:p-8">
              <p className="mb-4">Bitcoin's moat is built on <strong>Math and Decentralization</strong>:</p>
              <ul className="list-disc pl-6 space-y-4 text-white/60">
                <li><strong className="text-white">Absolute Scarcity:</strong> Only 21 million will ever exist. Unlike fiat or even gold, the supply curve is perfectly inelastic to demand.</li>
                <li><strong className="text-white">Network Effect:</strong> As the first and largest crypto asset, Bitcoin has the most liquidity, securest chain, and widest institutional support.</li>
                <li><strong className="text-white">Property Rights:</strong> A global, permissionless system for storing value that is independent of any central bank or government.</li>
              </ul>
            </CardBody>
          </Card>
          <TenMoatsCard data={tenMoatsData['BTC']} />
        </div>
      </AnalysisSection></div>

      <div className="hidden md:block"><AnalysisSection title="Price Scenarios (12-24 Months)">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ScenarioCard
            type="Bear"
            priceTarget="$45,000"
            description="Severe regulatory crackdown and a mass-market risk-off event."
            points={[
              "Banning of self-custody wallets in major jurisdictions",
              "Major ETF provider liquidation due to insolvency",
              "Recession leads to liquidations across all risk assets"
            ]}
          />
          <ScenarioCard
            type="Base"
            priceTarget="$95,000"
            description="Continued ETF inflows and steady adoption as a gold alternative."
            points={[
              "Institutional weighting increases to 1-2% in traditional portfolios",
              "Inflation remains sticky, driving demand for hard assets",
              "Development of Bitcoin Layer 2s increases network utility"
            ]}
          />
          <ScenarioCard
            type="Bull"
            priceTarget="$250,000+"
            description="Sovereign nation adoption and global currency volatility."
            points={[
              "Global central banks begin adding BTC to reserves",
              "Major Fortune 500 companies follow MicroStrategy's treasury model",
              "Hyper-inflation in G7 currencies triggers global flight to safety"
            ]}
          />
        </div>
      </AnalysisSection></div>

    </div>
  );
}
