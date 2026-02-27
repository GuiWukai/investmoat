'use client';

import { MetricCard, ScoreGauge, ScoreTabsRow, AnalysisSection, ScenarioCard, RecommendationBadge, TenMoatsCard } from "@/components/AnalysisComponents";
import { tenMoatsData } from "@/app/tenMoatsData";
import { stockData, getAverageScore } from "@/app/stockData";
import { PenTool, Image, Zap } from "lucide-react";
import { Chip } from "@heroui/react";

export default function AdobePage() {
  const overallScore = getAverageScore(stockData.find(s => s.ticker === 'ADBE')!.scores);
  return (
    <div className="animate-fade-in pb-12">
      <header className="mb-8 space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Chip color="primary" variant="flat" size="sm">SaaS | Creative</Chip>
          <Chip color="success" variant="flat" size="sm">Quality Compounder</Chip>
        </div>
        <div>
          <h1 className="text-3xl md:text-5xl font-black mb-2 tracking-tight">Adobe Inc.</h1>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-white/40 font-medium text-sm">
            <span>Ticker: <strong className="text-white">ADBE</strong></span>
            <span>Market Cap: <strong className="text-white">$215B</strong></span>
            <span>Price: <strong className="text-white">$482.50</strong></span>
          </div>
        </div>
        <RecommendationBadge status="Accumulate" />
      </header>

      <div className="hidden md:grid grid-cols-3 gap-6">
        <MetricCard
          title="Digital Media ARR"
          value="$15.7B"
          label="Recurring Powerhouse"
          icon={<PenTool size={20} color="white" />}
          color="#ff0000"
        />
        <MetricCard
          title="Gross Margin"
          value="87.8%"
          label="Software Dominance"
          icon={<Zap size={20} color="white" />}
          color="#f7b600"
        />
        <MetricCard
          title="Creative Cloud Users"
          value="30M+"
          label="Market Standard"
          icon={<Image size={20} color="white" />}
          color="#3b82f6"
        />
      </div>

      <ScoreTabsRow overallScore={overallScore} tabs={[
        {
          label: "Moat",
          gauge: (<ScoreGauge score={tenMoatsData['ADBE'].aiResilienceScore} label="Moat Score" description="The Creative Cloud is the global industry standard for design, photo, and video." />),
          detail: (
            <div className="space-y-4">
              <div className="glass-card">
                <p style={{ marginBottom: '1rem' }}>Adobe&apos;s moat is built on <strong>Network Effects and Professional Reliance</strong>:</p>
                <ul style={{ paddingLeft: '1.5rem', color: 'rgba(255,255,255,0.6)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <li><strong style={{ color: 'white' }}>Industry Standard:</strong> Photoshop, Premiere, and Illustrator are taught in universities. Hiring a designer means hiring someone who speaks &quot;Adobe.&quot;</li>
                  <li><strong style={{ color: 'white' }}>Firefly AI Advantage:</strong> Adobe&apos;s AI is trained on licensed content (Adobe Stock), making it safe for commercial use—a critical differentiator for enterprise clients.</li>
                  <li><strong style={{ color: 'white' }}>Document Cloud:</strong> Acrobat and PDF standards Create a separate, massive moat in professional and business workflows.</li>
                </ul>
              </div>
              <TenMoatsCard data={tenMoatsData['ADBE']} />
            </div>
          ),
        },
        {
          label: "Growth",
          gauge: (<ScoreGauge score={82} label="Growth Score" description="Generative AI (Firefly) integration driving higher tiers and retention." />),
          detail: (
            <div className="space-y-4">
              <MetricCard
          title="Digital Media ARR"
          value="$15.7B"
          label="Recurring Powerhouse"
          icon={<PenTool size={20} color="white" />}
          color="#ff0000"
        />
              <MetricCard
          title="Gross Margin"
          value="87.8%"
          label="Software Dominance"
          icon={<Zap size={20} color="white" />}
          color="#f7b600"
        />
              <MetricCard
          title="Creative Cloud Users"
          value="30M+"
          label="Market Standard"
          icon={<Image size={20} color="white" />}
          color="#3b82f6"
        />
            </div>
          ),
        },
        {
          label: "Value",
          gauge: (<ScoreGauge score={64} label="Valuation Score" description="Reasonable multiple for a company with 30%+ net margins." />),
          detail: (
            <div className="space-y-4">
              <ScenarioCard
            type="Bear"
            priceTarget="$380"
            description="AI disruption from startups (Midjourney/Canva) erodes the 'low-end' market."
            points={[
              "New ARR growth slows to single digits",
              "Pricing pressure from 'good enough' AI tools",
              "Integration of Figma-replacement features fails to gain traction"
            ]}
          />
              <ScenarioCard
            type="Base"
            priceTarget="$550"
            description="Successful Firefly monetization and steady enterprise upgrades."
            points={[
              "Firefly adoption increases Creative Cloud ARPU by 5-8%",
              "Document Cloud continues to grow at high double digits",
              "Operating margins remain above 45% (non-GAAP)"
            ]}
          />
              <ScenarioCard
            type="Bull"
            priceTarget="$680"
            description="Adobe becomes the default generative AI platform for the enterprise."
            points={[
              "AI credit consumption drives massive revenue upside",
              "Complete automation of creative workflows attracts mass-market users",
              "Strategic partnership with major social media / ad platforms"
            ]}
          />
            </div>
          ),
        },
      ]} />

      <div className="hidden md:block"><AnalysisSection title="The Creative Standard Moat">
        <div className="space-y-6">
          <div className="glass-card">
            <p style={{ marginBottom: '1rem' }}>Adobe&apos;s moat is built on <strong>Network Effects and Professional Reliance</strong>:</p>
            <ul style={{ paddingLeft: '1.5rem', color: 'rgba(255,255,255,0.6)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <li><strong style={{ color: 'white' }}>Industry Standard:</strong> Photoshop, Premiere, and Illustrator are taught in universities. Hiring a designer means hiring someone who speaks &quot;Adobe.&quot;</li>
              <li><strong style={{ color: 'white' }}>Firefly AI Advantage:</strong> Adobe&apos;s AI is trained on licensed content (Adobe Stock), making it safe for commercial use—a critical differentiator for enterprise clients.</li>
              <li><strong style={{ color: 'white' }}>Document Cloud:</strong> Acrobat and PDF standards Create a separate, massive moat in professional and business workflows.</li>
            </ul>
          </div>
          <TenMoatsCard data={tenMoatsData['ADBE']} />
        </div>
      </AnalysisSection></div>

      <div className="hidden md:block"><AnalysisSection title="Price Scenarios (12-24 Months)">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ScenarioCard
            type="Bear"
            priceTarget="$380"
            description="AI disruption from startups (Midjourney/Canva) erodes the 'low-end' market."
            points={[
              "New ARR growth slows to single digits",
              "Pricing pressure from 'good enough' AI tools",
              "Integration of Figma-replacement features fails to gain traction"
            ]}
          />
          <ScenarioCard
            type="Base"
            priceTarget="$550"
            description="Successful Firefly monetization and steady enterprise upgrades."
            points={[
              "Firefly adoption increases Creative Cloud ARPU by 5-8%",
              "Document Cloud continues to grow at high double digits",
              "Operating margins remain above 45% (non-GAAP)"
            ]}
          />
          <ScenarioCard
            type="Bull"
            priceTarget="$680"
            description="Adobe becomes the default generative AI platform for the enterprise."
            points={[
              "AI credit consumption drives massive revenue upside",
              "Complete automation of creative workflows attracts mass-market users",
              "Strategic partnership with major social media / ad platforms"
            ]}
          />
        </div>
      </AnalysisSection></div>

    </div>
  );
}
