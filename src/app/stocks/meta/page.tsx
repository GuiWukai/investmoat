'use client';

import { MetricCard, ScoreGauge, AnalysisSection, ScenarioCard, RecommendationBadge } from "@/components/AnalysisComponents";
import { Users, Cpu, Share2, DollarSign } from "lucide-react";
import { Card, CardBody, Chip } from "@heroui/react";

export default function MetaPage() {
  return (
    <div className="animate-fade-in space-y-12 pb-12">
      <header className="space-y-6">
        <div className="flex items-center gap-3">
          <Chip color="primary" variant="flat" size="sm">Communication Services | AI</Chip>
          <Chip color="success" variant="flat" size="sm">Quality Yield</Chip>
        </div>
        <div>
          <h1 className="text-6xl font-black mb-2 tracking-tight">Meta Platforms Inc.</h1>
          <div className="flex gap-6 text-white/40 font-medium">
            <span>Ticker: <strong className="text-white">META</strong></span>
            <span>Market Cap: <strong className="text-white">$1.25T</strong></span>
            <span>Current Price: <strong className="text-white">$492.30</strong></span>
          </div>
        </div>
        <RecommendationBadge status="Accumulate" />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard 
          title="Daily Active People" 
          value="3.24B" 
          label="Family of Apps (7% YoY)" 
          icon={<Users size={20} className="text-white" />} 
          color="#1877F2"
        />
        <MetricCard 
          title="Ad Impressions" 
          value="+21%" 
          label="Sustained CPM growth" 
          icon={<Share2 size={20} className="text-white" />} 
          color="#050505"
        />
        <MetricCard 
          title="Capex (AI)" 
          value="$35B" 
          label="Infrastructure investment" 
          icon={<Cpu size={20} className="text-white" />} 
          color="#3b82f6"
        />
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <ScoreGauge score={92} label="Moat Score" description="Unrivaled social network effect and massive proprietary data for AI training." />
        <ScoreGauge score={85} label="Growth Score" description="Advancements in Llama AI and monetization of Reels/Threads." />
        <ScoreGauge score={65} label="Valuation Score" description="Attractive P/E relative to growth, but high capex intensive." />
      </div>

      <AnalysisSection title="The Advertising Moat">
        <Card className="bg-white/5 border-none backdrop-blur-md">
          <CardBody className="p-8">
            <p className="mb-4">Meta's moat is built on <strong>Attention and Data</strong>:</p>
            <ul className="list-disc pl-6 space-y-4 text-white/60">
              <li><strong className="text-white">Social Graph Network Effect:</strong> Every new user on Instagram or WhatsApp increases the value for existing users. Breaking this flywheel requires a multi-billion person migration.</li>
              <li><strong className="text-white">AI Content Flywheel:</strong> AI-driven recommendations are significantly increasing time-spent on Reels, which directly translates to more ad-inventory.</li>
              <li><strong className="text-white">Vertical Integration of AI:</strong> By owning the compute, the models (Llama), and the distribution (FB/IG), Meta controls the entire AI value chain.</li>
            </ul>
          </CardBody>
        </Card>
      </AnalysisSection>

      <AnalysisSection title="Price Scenarios (12-24 Months)">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ScenarioCard 
            type="Bear" 
            priceTarget="$380" 
            description="Regulatory fines and a shift in user engagement to newer platforms."
            points={[
              "EU privacy laws severely impact targeting precision",
              "Reality Labs losses exceed $20B annually",
              "Ad-market recession hits digital spend"
            ]}
          />
          <ScenarioCard 
            type="Base" 
            priceTarget="$520" 
            description="Steady ad-revenue growth and AI-driven efficiency gains."
            points={[
              "Ad revenue grows 12-15% annually",
              "Reels monetization achieves parity with Feed",
              "Share buybacks continue at $50B+ clip"
            ]}
          />
          <ScenarioCard 
            type="Bull" 
            priceTarget="$650" 
            description="Llama becomes the industry standard and WhatsApp monetization explodes."
            points={[
              "WhatsApp business messaging becomes a $10B high-margin pillar",
              "Generative AI ad-creation tools lower barriers for small biz",
              "Reality Labs reaches an 'iPhone moment' with AR glasses"
            ]}
          />
        </div>
      </AnalysisSection>
    </div>
  );
}
