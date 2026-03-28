'use client';

import { useState } from "react";
import Link from "next/link";
import { ShieldCheck, TrendingUp, BarChart3, ChevronDown, ArrowRight, Brain, Target, CheckCircle2, Database, Lock, Network, CreditCard, BookMarked, MonitorSmartphone, Code2, Globe, GraduationCap, Layers, Zap } from "lucide-react";
import { Card, CardBody, Chip, Progress } from "@heroui/react";

// ─── FAQ Accordion ────────────────────────────────────────────────────────────
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/5 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left py-5 flex justify-between items-start gap-4 group"
      >
        <span className="font-semibold text-sm md:text-base text-white/90 group-hover:text-white transition-colors">
          {q}
        </span>
        <ChevronDown
          size={18}
          className={`text-white/30 group-hover:text-white/60 transition-all shrink-0 mt-0.5 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <p className="pb-5 text-white/60 leading-relaxed text-sm animate-fade-up stagger-fill-both">
          {a}
        </p>
      )}
    </div>
  );
}

const FAQS = [
  {
    q: "Why not just buy the S&P 500?",
    a: "The S&P 500 is 503 companies, market-cap weighted. You're forced to own every mediocre business proportionally alongside the great ones — your allocation to the 400th-best idea grows automatically as weak companies expand. Research consistently shows the top decile of public businesses generate the vast majority of all long-run equity returns. InvestMoat concentrates in that top decile, identified through systematic moat scoring rather than market capitalisation.",
  },
  {
    q: "Why not just buy the Magnificent 7?",
    a: "The Mag-7 are not equally moat-durable. We own Microsoft, Amazon, NVIDIA, and Alphabet — the four with the strongest AI-resilient moats from that group. Apple faces AI-era commoditisation risk as on-device intelligence shifts value to model providers. Meta has strong network effects but severe regulatory drag and no system-of-record moat. Tesla is an automotive manufacturer with execution dependency, not a compounding software business.",
  },
  {
    q: "Why is there crypto in the portfolio?",
    a: "Bitcoin, Ethereum, and Solana are scored on the same 10-moat framework as equities. Bitcoin scores on regulatory lock-in (Basel III Tier 1 recognition, spot ETF approval across 22+ jurisdictions), network effects (deepest liquidity in digital assets), and system-of-record status (immutable settlement layer). These are not speculative positions — they are network-effect assets evaluated the same rigorous way we evaluate Visa or Mastercard.",
  },
  {
    q: "Why no gold?",
    a: "Gold is fully analyzed and scores 62/100 — below the 75-point portfolio minimum. The constraint is its growth score of 50: gold produces no earnings, revenue, or cash flow and cannot compound. Bitcoin fulfills the same hard-money and inflation-hedge thesis with additional network effects, digital divisibility, and a stronger growth trajectory. Gold stays in our coverage universe and earns a portfolio position the moment its composite score clears 75.",
  },
  {
    q: "Why only 25 positions?",
    a: "Concentration is a feature, not a flaw. Diversifying into 50+ positions means your 47th-best idea receives the same capital as your best. Studies show 15-25 uncorrelated, high-conviction positions capture most of the risk-reduction benefit of diversification while keeping performance concentrated in quality. Every position in this portfolio competes against all others — a new stock must displace the weakest current holding by scoring higher.",
  },
  {
    q: "How is each stock scored?",
    a: "Three pillars, each scored 0-100. Moat (40%): fully computed from 10 individually-weighted moat types — each rated strong/intact/weakened/destroyed mapping to 100/75/50/10 points. Resilient moats (networkEffects w=15, proprietaryData w=15, systemOfRecord w=12, regulatoryLockIn w=10, transactionEmbedding w=8) total 60% of the moat score; vulnerable moats (businessLogic w=14, bundling w=10, learnedInterfaces w=8, talentScarcity w=5, publicDataAccess w=3) total 40%. A breadth bonus of +1 to +4 rewards moat diversification. Growth (35%): estimated 3-5 year revenue CAGR with named adjustments for margin trend, TAM expansion, and driver acceleration. Valuation (25%): live price vs. bear/base/bull scenario targets on a piecewise scale. Composite = Moat×40% + Growth×35% + Valuation×25%. Stocks scoring ≥75 are portfolio-eligible; the top 25 are included.",
  },
  {
    q: "What makes a moat 'AI-resilient'?",
    a: "AI-resilient moats are advantages AI cannot easily replicate or destroy: proprietary data that compounds privately over time, regulatory lock-in (government certifications, index inclusion, licensed access), network effects following Metcalfe's Law, transaction embedding (sitting in the payment layer of daily operations), and system-of-record status (the authoritative source of truth for critical decisions). AI-vulnerable moats — learned interfaces, talent scarcity, proprietary business logic — receive lower weighting because AI agents can increasingly substitute for them.",
  },
  {
    q: "Is this financial advice?",
    a: "No. InvestMoat is an open-source research and education framework. Everything here represents the maintainers' analysis, not professional investment advice. Consult a licensed financial adviser before making investment decisions. Past performance of moat-focused strategies does not guarantee future results.",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <div className="animate-fade-in space-y-24">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <header className="pt-4 md:pt-8">
        <div className="animate-fade-up stagger-fill-both" style={{ animationDelay: '0s' }}>
          <Chip size="sm" variant="flat" color="primary" className="mb-6">
            Open Source · AI-Era Portfolio
          </Chip>
          <h1 className="text-4xl md:text-6xl font-extrabold gradient-text-animated leading-tight mb-6">
            Invest in Moats,<br />Not Markets
          </h1>
          <p className="text-white/60 text-base md:text-xl max-w-2xl leading-relaxed mb-8">
            A high-conviction portfolio of 25 businesses with durable competitive advantages,
            scored systematically across moat strength, growth trajectory, and live valuation.
            Built to compound wealth in the AI era — not just track it.
          </p>
          <div className="flex flex-wrap gap-3 mb-12">
            <Link
              href="/portfolio"
              className="flex items-center gap-2 px-6 py-3 primary-gradient rounded-xl font-bold text-white text-sm hover:opacity-90 transition-opacity"
            >
              View Portfolio <ArrowRight size={16} />
            </Link>
            <Link
              href="/stocks"
              className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-white text-sm transition-colors"
            >
              Explore Coverage <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Stats row */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-up stagger-fill-both"
          style={{ animationDelay: '0.15s' }}
        >
          {[
            { value: "25", label: "Portfolio Holdings" },
            { value: "60+", label: "Stocks Analyzed" },
            { value: "≥ 75", label: "Score Required" },
            { value: "10%", label: "Max Position Weight" },
          ].map(({ value, label }) => (
            <Card key={label} className="bg-white/5 border-none backdrop-blur-lg">
              <CardBody className="p-4 text-center">
                <p className="text-2xl md:text-3xl font-extrabold gradient-text">{value}</p>
                <p className="text-white/40 text-xs font-medium mt-1">{label}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </header>

      {/* ── The Thesis ───────────────────────────────────────────────────── */}
      <section className="animate-fade-up stagger-fill-both" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-2xl md:text-3xl font-extrabold gradient-text">The Thesis</h2>
          <div className="h-px flex-1 bg-white/10" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/5 border-none backdrop-blur-lg">
            <CardBody className="p-6 flex flex-col gap-4">
              <div className="w-10 h-10 rounded-xl primary-gradient flex items-center justify-center">
                <ShieldCheck size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">Economic Moats Compound</h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  The best businesses become harder to compete with over time — not easier.
                  Pricing power, switching costs, and network effects strengthen as the business
                  scales, delivering above-market returns on capital for decades.
                </p>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-white/5 border-none backdrop-blur-lg">
            <CardBody className="p-6 flex flex-col gap-4">
              <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                <Brain size={20} className="text-secondary" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">AI Rewrites the Playbook</h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  Most competitive advantages are AI-vulnerable: interfaces, talent scarcity,
                  and embedded business logic can all be automated. We weight proprietary data,
                  regulatory lock-in, and network effects 60% more heavily — the moats
                  AI cannot replicate.
                </p>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-white/5 border-none backdrop-blur-lg">
            <CardBody className="p-6 flex flex-col gap-4">
              <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                <Target size={20} className="text-success" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">Concentration Beats Diversification</h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  Owning 500 companies means funding mediocrity at scale.
                  25 high-conviction positions, each earning its place by scoring ≥75/100,
                  concentrate capital where it compounds fastest.
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* ── The Framework ────────────────────────────────────────────────── */}
      <section className="animate-fade-up stagger-fill-both" style={{ animationDelay: '0.3s' }}>
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-2xl md:text-3xl font-extrabold gradient-text">The Scoring Framework</h2>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Moat */}
          <Card className="bg-white/5 border-none backdrop-blur-lg">
            <CardBody className="p-6 flex flex-col gap-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <ShieldCheck size={18} className="text-primary" />
                  <span className="font-bold">Moat</span>
                </div>
                <Chip size="sm" variant="flat" color="primary">40%</Chip>
              </div>
              <Progress value={40} color="primary" size="sm" aria-label="Moat weight 40%" />
              <div className="space-y-2 text-sm text-white/50">
                <p>Computed from 10 individually-weighted moat types. Resilient moats total 60%, vulnerable 40%. Breadth bonus up to +4 pts.</p>
                <div className="space-y-1.5 mt-2">
                  {[
                    { label: "Network Effects", w: 15 },
                    { label: "Proprietary Data", w: 15 },
                    { label: "System of Record", w: 12 },
                    { label: "Regulatory Lock-in", w: 10 },
                    { label: "Transaction Embedding", w: 8 },
                  ].map(({ label, w }) => (
                    <div key={label} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={12} className="text-primary shrink-0" />
                        <span className="text-xs">{label}</span>
                      </div>
                      <span className="text-[10px] text-primary/50 font-mono shrink-0">w={w}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Growth */}
          <Card className="bg-white/5 border-none backdrop-blur-lg">
            <CardBody className="p-6 flex flex-col gap-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <TrendingUp size={18} className="text-success" />
                  <span className="font-bold">Growth</span>
                </div>
                <Chip size="sm" variant="flat" color="success">35%</Chip>
              </div>
              <Progress value={35} color="success" size="sm" aria-label="Growth weight 35%" />
              <div className="space-y-2 text-sm text-white/50">
                <p>Estimated 3-5 year revenue CAGR with named adjustments:</p>
                <div className="space-y-1.5 mt-2">
                  {[
                    "≥30% CAGR → 90 base points",
                    "15-30% CAGR → 80 base points",
                    "8-15% CAGR → 70 base points",
                    "+5-10 pts for NRR > 110%",
                    "-5-10 pts for cyclicality",
                  ].map(m => (
                    <div key={m} className="flex items-center gap-2">
                      <CheckCircle2 size={12} className="text-success shrink-0" />
                      <span className="text-xs">{m}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Valuation */}
          <Card className="bg-white/5 border-none backdrop-blur-lg">
            <CardBody className="p-6 flex flex-col gap-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <BarChart3 size={18} className="text-warning" />
                  <span className="font-bold">Valuation</span>
                </div>
                <Chip size="sm" variant="flat" color="warning">25%</Chip>
              </div>
              <Progress value={25} color="warning" size="sm" aria-label="Valuation weight 25%" />
              <div className="space-y-2 text-sm text-white/50">
                <p>Price vs. scenario targets with live price feeds:</p>
                <div className="space-y-1.5 mt-2">
                  {[
                    "At Bear target → 90 pts",
                    "At Base (fair value) → 65 pts",
                    "At Bull target → 45 pts",
                    "Live price per stock",
                    "Scenarios refreshed quarterly",
                  ].map(m => (
                    <div key={m} className="flex items-center gap-2">
                      <CheckCircle2 size={12} className="text-warning shrink-0" />
                      <span className="text-xs">{m}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Composite score legend */}
        <Card className="bg-white/5 border-none backdrop-blur-lg">
          <CardBody className="p-5">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <span className="text-white/40 text-[10px] font-black uppercase tracking-widest shrink-0">
                Composite Score
              </span>
              <div className="flex flex-wrap gap-4">
                {[
                  { range: "≥ 82", label: "Strong Buy", color: "success" as const },
                  { range: "75 – 81", label: "Accumulate", color: "primary" as const },
                  { range: "68 – 74", label: "Hold", color: "warning" as const },
                  { range: "< 68", label: "Excluded from portfolio", color: "danger" as const },
                ].map(({ range, label, color }) => (
                  <div key={label} className="flex items-center gap-2">
                    <Chip size="sm" variant="flat" color={color}>{range}</Chip>
                    <span className="text-white/50 text-xs">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>
      </section>

      {/* ── The 10 Moat Model ────────────────────────────────────────────── */}
      <section className="animate-fade-up stagger-fill-both" style={{ animationDelay: '0.35s' }}>
        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-2xl md:text-3xl font-extrabold gradient-text">The 10 Moat Model</h2>
          <div className="h-px flex-1 bg-white/10" />
        </div>
        <p className="text-white/50 text-sm leading-relaxed max-w-3xl mb-10">
          Every business is scored across 10 specific competitive advantages. Not all moats are equal
          in the AI era — five are <span className="text-primary font-semibold">AI-resilient</span> (60% of the score, individually weighted by durability) because AI cannot easily replicate or destroy them,
          while five are <span className="text-warning font-semibold">AI-vulnerable</span> (40%, individually weighted by disruption risk) because intelligent agents can increasingly substitute for them.
          Each moat is rated <span className="text-white/70 font-medium">strong (100) · intact (75) · weakened (50) · destroyed (10)</span>, and
          a breadth bonus of +1 to +4 rewards businesses defended by more applicable moats.
        </p>

        {/* AI-Resilient Moats */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/15 border border-primary/20 rounded-lg">
              <Zap size={14} className="text-primary" />
              <span className="text-primary text-xs font-bold uppercase tracking-wider">AI-Resilient Moats</span>
            </div>
            <span className="text-white/30 text-xs">60% of moat score · weights: 15 / 15 / 12 / 10 / 8</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: <Network size={18} className="text-primary" />,
                name: "Network Effects",
                weight: 15,
                tagline: "Value compounds with every new participant",
                description:
                  "Following Metcalfe's Law, value scales with the square of participants. Every new user makes the network more valuable for all existing users, creating a self-reinforcing growth loop that competitors must overcome at the same scale — an enormous structural disadvantage for any challenger.",
                examples: ["iMessage / AirDrop ecosystem", "Bitcoin liquidity depth", "Solana developer ecosystem"],
              },
              {
                icon: <Database size={18} className="text-primary" />,
                name: "Proprietary Data",
                weight: 15,
                tagline: "Private, compounding data flywheels",
                description:
                  "Data that accumulates privately over time and cannot be purchased or replicated by competitors. The longer the company operates, the harder it becomes to catch up. Think HealthKit biometrics, Palantir's classified government data, or Visa's transaction graph.",
                examples: ["Apple HealthKit", "Palantir datasets", "Visa transaction network"],
              },
              {
                icon: <BookMarked size={18} className="text-primary" />,
                name: "System of Record",
                weight: 12,
                tagline: "The authoritative source of truth for critical decisions",
                description:
                  "The company's data store is the canonical reference that all downstream systems defer to. Replacing it requires migrating years of historical data and retraining every workflow built on top of it. Errors are catastrophic — so customers never voluntarily leave.",
                examples: ["iCloud Photos / Contacts", "Salesforce CRM", "Epic EHR systems"],
              },
              {
                icon: <Lock size={18} className="text-primary" />,
                name: "Regulatory Lock-In",
                weight: 10,
                tagline: "Government licences, certifications & mandates",
                description:
                  "Advantages granted or protected by law: FDA approvals, financial licences, index inclusion, spectrum rights, or government contracts. These cannot be automated away and create near-permanent barriers because the certification process itself is the moat.",
                examples: ["Bitcoin spot ETF approval", "Mastercard banking licences", "MSCI / S&P index inclusion"],
              },
              {
                icon: <CreditCard size={18} className="text-primary" />,
                name: "Transaction Embedding",
                weight: 8,
                tagline: "Sitting inside the payment layer of operations",
                description:
                  "The business is embedded directly in the financial or operational flow of every transaction. Removing it requires rebuilding critical infrastructure, not just switching a preference. This creates extreme switching costs tied to real money movement, not just convenience.",
                examples: ["Visa / Mastercard rails", "Stripe payment infrastructure", "App Store commerce layer"],
              },
            ].map(({ icon, name, weight, tagline, description, examples }) => (
              <Card key={name} className="bg-white/5 border border-primary/10 backdrop-blur-lg">
                <CardBody className="p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                        {icon}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-white">{name}</p>
                        <p className="text-primary/70 text-[11px]">{tagline}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-primary/50 bg-primary/10 px-1.5 py-0.5 rounded shrink-0">w={weight}</span>
                  </div>
                  <p className="text-white/45 text-xs leading-relaxed">{description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
                    {examples.map(ex => (
                      <span key={ex} className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary/70 rounded-full border border-primary/10">
                        {ex}
                      </span>
                    ))}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>

        {/* AI-Vulnerable Moats */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-warning/10 border border-warning/20 rounded-lg">
              <Brain size={14} className="text-warning" />
              <span className="text-warning text-xs font-bold uppercase tracking-wider">AI-Vulnerable Moats</span>
            </div>
            <span className="text-white/30 text-xs">40% of moat score · weights: 14 / 10 / 8 / 5 / 3</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: <Code2 size={18} className="text-warning" />,
                name: "Business Logic",
                weight: 14,
                tagline: "Embedded operational workflows",
                description:
                  "The software encodes years of accumulated business rules, edge cases, and customisations that employees rely on daily. While this creates significant switching costs today, AI can increasingly model and reproduce business logic, gradually eroding the cost of migration.",
                examples: ["SAP ERP configurations", "MDM device policies", "Legacy COBOL systems"],
              },
              {
                icon: <Layers size={18} className="text-warning" />,
                name: "Bundling",
                weight: 10,
                tagline: "Value created by combining complementary products",
                description:
                  "Multiple products packaged together create convenience and cross-sell revenue that individual point solutions cannot easily match. AI-driven software commoditises features rapidly, making it easier for focused challengers to replicate any single element of the bundle at a fraction of the price.",
                examples: ["Apple One subscription", "Microsoft 365 suite", "Google Workspace"],
              },
              {
                icon: <MonitorSmartphone size={18} className="text-warning" />,
                name: "Learned Interfaces",
                weight: 8,
                tagline: "Fluency built through years of UI habit",
                description:
                  "Users invest time mastering a specific interface — keyboard shortcuts, mental models, workflows — making switching costly even when alternatives are technically superior. AI agents increasingly abstract away the interface layer, letting users command outcomes without learning a specific UI.",
                examples: ["macOS / iOS UX", "Final Cut Pro", "Adobe Creative Suite"],
              },
              {
                icon: <GraduationCap size={18} className="text-warning" />,
                name: "Talent Scarcity",
                weight: 5,
                tagline: "Rare human expertise as competitive advantage",
                description:
                  "The business depends on recruiting and retaining a small pool of specialists — chip designers, quant researchers, elite engineers — whose skills are hard to find and expensive to poach. AI augments and in some domains replaces highly skilled human work, compressing the scarcity premium over time.",
                examples: ["NVIDIA CUDA team", "TSMC process engineers", "Quantitative hedge funds"],
              },
              {
                icon: <Globe size={18} className="text-warning" />,
                name: "Public Data Access",
                weight: 3,
                tagline: "Privileged access to publicly available information",
                description:
                  "The company has a head-start aggregating, structuring, or distributing data that is technically public but expensive to compile. AI web-crawlers and large language models rapidly close this gap by training on the same underlying data sources, compressing the advantage over time.",
                examples: ["Bloomberg terminal data", "Credit bureau aggregation", "Market data vendors"],
              },
            ].map(({ icon, name, weight, tagline, description, examples }) => (
              <Card key={name} className="bg-white/5 border border-warning/10 backdrop-blur-lg">
                <CardBody className="p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center shrink-0">
                        {icon}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-white">{name}</p>
                        <p className="text-warning/60 text-[11px]">{tagline}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-warning/50 bg-warning/10 px-1.5 py-0.5 rounded shrink-0">w={weight}</span>
                  </div>
                  <p className="text-white/45 text-xs leading-relaxed">{description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
                    {examples.map(ex => (
                      <span key={ex} className="text-[10px] px-2 py-0.5 bg-warning/10 text-warning/60 rounded-full border border-warning/10">
                        {ex}
                      </span>
                    ))}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>

        {/* Scoring note */}
        <Card className="bg-white/5 border-none backdrop-blur-lg mt-6">
          <CardBody className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-2 shrink-0">
                <ShieldCheck size={16} className="text-white/40" />
                <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">How moats are assessed</span>
              </div>
              <p className="text-white/40 text-xs leading-relaxed">
                Each moat is rated <span className="text-white/60 font-medium">strong (100) · intact (75) · weakened (50) · destroyed (10)</span>.
                Scores are weighted by moat type — resilient group totals 60, vulnerable 40 — with N/A moats excluded and weight redistributed within the group.
                A <span className="text-white/60 font-medium">breadth bonus of +1 to +4</span> rewards businesses with more applicable moats.
                The result is the fully-computed <span className="text-primary font-semibold">Moat Score (40% of composite)</span>.
              </p>
            </div>
          </CardBody>
        </Card>
      </section>

      {/* ── Q&A ──────────────────────────────────────────────────────────── */}
      <section className="animate-fade-up stagger-fill-both" style={{ animationDelay: '0.4s' }}>
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-2xl md:text-3xl font-extrabold gradient-text">Common Questions</h2>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <div className="rounded-2xl overflow-hidden border border-white/5 bg-white/5 backdrop-blur-lg px-6">
          {FAQS.map(({ q, a }) => (
            <FAQItem key={q} q={q} a={a} />
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────────────────── */}
      <section
        className="animate-fade-up stagger-fill-both pb-8"
        style={{ animationDelay: '0.5s' }}
      >
        <Card className="bg-white/5 border-none backdrop-blur-lg">
          <CardBody className="p-10 flex flex-col items-center gap-6 text-center">
            <h3 className="text-2xl md:text-3xl font-extrabold gradient-text">
              Ready to explore the portfolio?
            </h3>
            <p className="text-white/50 max-w-md text-sm leading-relaxed">
              View the current 25-stock allocation, explore all 60+ analyzed assets,
              or dive into individual company reports with moat scores, scenarios, and live valuations.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/portfolio"
                className="flex items-center gap-2 px-6 py-3 primary-gradient rounded-xl font-bold text-white text-sm hover:opacity-90 transition-opacity"
              >
                View Portfolio <ArrowRight size={16} />
              </Link>
              <Link
                href="/stocks"
                className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-white text-sm transition-colors"
              >
                All Coverage <ArrowRight size={16} />
              </Link>
            </div>
          </CardBody>
        </Card>
      </section>

    </div>
  );
}
