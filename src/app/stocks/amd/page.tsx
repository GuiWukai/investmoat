'use client';

import { MetricCard, ScoreGauge, ScoreTabsRow, AnalysisSection, ScenarioCard, RecommendationBadge, TenMoatsCard } from "@/components/AnalysisComponents";
import { tenMoatsData } from "@/app/tenMoatsData";
import { Cpu, Layers, Zap } from "lucide-react";
import { Chip } from "@heroui/react";

export default function AmdPage() {
  return (
    <div className="animate-fade-in pb-12">
      <header className="mb-8 space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Chip color="primary" variant="flat" size="sm">Semiconductors | AI</Chip>
          <Chip color="success" variant="flat" size="sm">Growth Compounder</Chip>
        </div>
        <div>
          <h1 className="text-3xl md:text-5xl font-black mb-2 tracking-tight">Advanced Micro Devices</h1>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-white/40 font-medium text-sm">
            <span>Ticker: <strong className="text-white">AMD</strong></span>
            <span>Market Cap: <strong className="text-white">$280B</strong></span>
            <span>Price: <strong className="text-white">$172.40</strong></span>
          </div>
        </div>
        <RecommendationBadge status="Accumulate" />
      </header>

      <div className="hidden md:grid grid-cols-3 gap-6">
        <MetricCard
          title="Data Center Rev"
          value="$2.3B"
          label="80% YoY Growth"
          icon={<Cpu size={20} color="white" />}
          color="#ed1c24"
        />
        <MetricCard
          title="Instinct Pipeline"
          value="$4.0B+"
          label="MI300 Series Momentum"
          icon={<Zap size={20} color="white" />}
          color="#00a4ef"
        />
        <MetricCard
          title="Client Segment"
          value="46%"
          label="Ryzen Market Share (Q4)"
          icon={<Layers size={20} color="white" />}
          color="#10b981"
        />
      </div>

      <ScoreTabsRow tabs={[
        {
          label: "Moat",
          gauge: (<ScoreGauge score={tenMoatsData['AMD'].aiResilienceScore} label="Moat Score" description="Strong positioning as the primary x86 alternative and growing software (ROCm) ecosystem." />),
          detail: <TenMoatsCard data={tenMoatsData['AMD']} />,
        },
        {
          label: "Growth",
          gauge: (<ScoreGauge score={92} label="Growth Score" description="Catching up rapidly in the AI accelerator market with chiplet architectures." />),
          detail: (
            <div className="space-y-4">
              <MetricCard
          title="Data Center Rev"
          value="$2.3B"
          label="80% YoY Growth"
          icon={<Cpu size={20} color="white" />}
          color="#ed1c24"
        />
              <MetricCard
          title="Instinct Pipeline"
          value="$4.0B+"
          label="MI300 Series Momentum"
          icon={<Zap size={20} color="white" />}
          color="#00a4ef"
        />
              <MetricCard
          title="Client Segment"
          value="46%"
          label="Ryzen Market Share (Q4)"
          icon={<Layers size={20} color="white" />}
          color="#10b981"
        />
            </div>
          ),
        },
        {
          label: "Value",
          gauge: (<ScoreGauge score={58} label="Valuation Score" description="High P/E (45x) requires high execution to justify multiple." />),
          detail: (
            <div className="space-y-4">
              <ScenarioCard
            type="Bear"
            priceTarget="$120"
            description="Intel re-captures server market and MI300 series adoption stalls."
            points={[
              "Intel's 18A process node beats expectations",
              "ROCm software fails to achieve critical developer weight",
              "PC market recovery significantly underwhelms"
            ]}
          />
              <ScenarioCard
            type="Base"
            priceTarget="$210"
            description="Continued steady EPYC share gains and $5B+ in AI revenue."
            points={[
              "AI GPU revenue meets or exceeds raised guidance",
              "Server market share reaches 35%+",
              "Client PC segment returns to mid-single digit growth"
            ]}
          />
              <ScenarioCard
            type="Bull"
            priceTarget="$280"
            description="AMD becomes the true 'Second Source' for global AI infrastructure."
            points={[
              "MI350/400 series achieve performance parity with Nvidia",
              "Substantial licensing of ROCm by major cloud providers",
              "Strategic acquisition of a major networking or software player"
            ]}
          />
            </div>
          ),
        },
      ]} />

      <AnalysisSection title="The Chiplet Moat">
        <div className="glass-card">
          <p style={{ marginBottom: '1rem' }}>AMD&apos;s advantage lies in <strong>Architectural Efficiency</strong>:</p>
          <ul style={{ paddingLeft: '1.5rem', color: 'rgba(255,255,255,0.6)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <li><strong style={{ color: 'white' }}>Chiplet Innovation:</strong> AMD led the transition to chiplets, allowing for higher yields and more flexible SKU creation compared to monolithic designs.</li>
            <li><strong style={{ color: 'white' }}>x86 Market Share Capture:</strong> Continues to erode Intel&apos;s dominance in the server (EPYC) and consumer (Ryzen) markets.</li>
            <li><strong style={{ color: 'white' }}>Open Ecosystem:</strong> ROCm software suite is becoming a viable open-source alternative to Nvidia&apos;s proprietary CUDA, attracting hyperscalers looking for vendor flexibility.</li>
          </ul>
        </div>
      </AnalysisSection>

      <div className="hidden md:block"><AnalysisSection title="Price Scenarios (12-24 Months)">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ScenarioCard
            type="Bear"
            priceTarget="$120"
            description="Intel re-captures server market and MI300 series adoption stalls."
            points={[
              "Intel's 18A process node beats expectations",
              "ROCm software fails to achieve critical developer weight",
              "PC market recovery significantly underwhelms"
            ]}
          />
          <ScenarioCard
            type="Base"
            priceTarget="$210"
            description="Continued steady EPYC share gains and $5B+ in AI revenue."
            points={[
              "AI GPU revenue meets or exceeds raised guidance",
              "Server market share reaches 35%+",
              "Client PC segment returns to mid-single digit growth"
            ]}
          />
          <ScenarioCard
            type="Bull"
            priceTarget="$280"
            description="AMD becomes the true 'Second Source' for global AI infrastructure."
            points={[
              "MI350/400 series achieve performance parity with Nvidia",
              "Substantial licensing of ROCm by major cloud providers",
              "Strategic acquisition of a major networking or software player"
            ]}
          />
        </div>
      </AnalysisSection></div>

      <div className="hidden md:block"><AnalysisSection title="Ten Moats Framework">
        <TenMoatsCard data={tenMoatsData['AMD']} />
      </AnalysisSection></div>
    </div>
  );
}
