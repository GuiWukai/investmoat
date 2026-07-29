'use client';

import { useState } from "react";
import Link from "next/link";
import { Card } from "@heroui/react";
import {
  ShieldCheck, TrendingUp, BarChart3, ChevronDown, ArrowRight,
  Brain, Target, Database, Lock, Network, CreditCard, BookMarked,
  MonitorSmartphone, Code2, Globe, GraduationCap, Layers, Zap, FileText,
} from "lucide-react";

// ─── FAQ Accordion ────────────────────────────────────────────────────────────
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-foreground/[0.04] last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left py-5 flex justify-between items-start gap-4 group"
      >
        <span className="font-semibold text-sm md:text-base text-foreground/70 group-hover:text-foreground transition-colors">
          {q}
        </span>
        <ChevronDown
          size={18}
          className={`text-foreground/20 group-hover:text-foreground/50 transition-all shrink-0 mt-0.5 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <p className="pb-5 text-foreground/45 leading-relaxed text-sm animate-fade-up stagger-fill-both">
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
    a: "The Mag-7 are not equally moat-durable, and the framework doesn't treat them as a bloc. Microsoft, Amazon, Meta, and NVIDIA all clear the inclusion threshold and are held. Alphabet is the near miss — a composite of 79.9 against an 80-point threshold, ranked 27th — so it sits in coverage rather than the portfolio. Apple scores 72: its moat is genuinely strong at 89, but a valuation score of 61 says the price already reflects that, and on-device intelligence shifts value toward model providers. Tesla scores 71 — an automotive manufacturer with execution dependency, not a compounding software business.",
  },
  {
    q: "Why is there crypto in the portfolio?",
    a: "Bitcoin and Ethereum are both top-10 holdings, but they are deliberately not scored on the equity moat framework — a monetary protocol's durability doesn't come from the same places a business's does. Crypto is scored on five protocol pillars: network effects, Schelling-point status, credible neutrality, regulatory incumbency, and security budget. Each protocol declares which pillar is its actual moat and that one carries 50% of the score, so Bitcoin scores on credible neutrality and Ethereum on network effects rather than being averaged through pillars that don't define them. Growth and valuation are scored exactly as they are for any other asset. Moat scores are not comparable across asset classes: Bitcoin's 96 measures protocol durability, which is not the same thing as an equity moat of 96.",
  },
  {
    q: "Why no gold?",
    a: "Gold is fully analyzed and scores a composite of 75 — respectable, but 59th in the universe and short of the 80-point inclusion threshold. Commodities are scored on three pillars — absolute scarcity, monetary history, industrial utility — with the declared primary pillar carrying 50%, so gold scores on its monetary history rather than being dragged down by thin industrial demand. Its moat comes out at 75. What keeps it out is growth of 71: gold produces no earnings, revenue, or cash flow and cannot compound. Bitcoin carries the same hard-money and inflation-hedge thesis with network effects, digital divisibility, and a stronger growth trajectory, and scores 91. Gold stays in the coverage universe and earns a position the moment its composite clears the threshold and outranks the weakest holding.",
  },
  {
    q: "Why only 25 positions?",
    a: "Concentration is a feature, not a flaw. Diversifying into 50+ positions means your 47th-best idea receives the same capital as your best. Studies show 15-25 uncorrelated, high-conviction positions capture most of the risk-reduction benefit of diversification while keeping performance concentrated in quality. Every position in this portfolio competes against all others — a new stock must displace the weakest current holding by scoring higher.",
  },
  {
    q: "How is each stock scored?",
    a: "Three pillars, each scored 0-100, all computed from a structured data file — there are no hand-typed ratings. Moat (40%): for equities, 10 individually-weighted moat types, each rated strong/intact/weakened/destroyed mapping to 100/65/35/0 points, so a moat score of 0 means all ten applicable moats are destroyed and 100 means all ten are strong. AI-resilient moats (networkEffects w=15, proprietaryData w=12, systemOfRecord w=12, regulatoryLockIn w=11, transactionEmbedding w=10) carry 60% of the weight; AI-vulnerable moats (businessLogic w=14, bundling w=10, learnedInterfaces w=8, talentScarcity w=5, publicDataAccess w=3) carry 40%. A quality-gated breadth bonus of +1 to +4 rewards moats rated intact-or-better beyond the fifth, and a -5 discount applies where the vulnerable group outscores the resilient one. Crypto and commodities use their own pillar frameworks. Growth (30%): a blended 3-5 year revenue CAGR sets the base, adjusted for driver trajectory (±4), margin trend (±4), growth type (up to +4), and key-risk severity (down to -15). Valuation (30%): live price against bear/base/bull scenario targets on a piecewise scale — 100 points at 20% below the bear case, 90 at bear, 65 at base, 45 at bull, and 0 at double the bull case. The composite is a geometric blend, so a weak pillar genuinely drags the score rather than being averaged away. Each pillar is standardised against the coverage universe before weighting, so the declared 40/30/30 governs actual influence instead of whichever rubric happens to vary most. A composite of ≥80 makes an asset portfolio-eligible; the top 25 are held.",
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
const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': 'https://investmoat.com/#faq',
  mainEntity: FAQS.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: a,
    },
  })),
};

export default function HomePage() {
  return (
    <div className="animate-fade-in dot-pattern">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <header className="relative pt-6 md:pt-12 pb-20 md:pb-24">
        {/* Ambient glows */}
        <div className="pointer-events-none absolute -top-40 -left-40 w-[560px] h-[560px] rounded-full bg-accent/[0.06] blur-[100px]" />
        <div className="pointer-events-none absolute -top-10 right-10 w-72 h-72 rounded-full bg-accent/[0.04] blur-[70px]" />

        <div className="relative animate-fade-up stagger-fill-both" style={{ animationDelay: '0s' }}>
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-8">
            <span className="h-px w-8 bg-accent/50" />
            <span className="text-[11px] font-bold text-accent/75 uppercase tracking-[0.22em] font-mono">
              Systematic Equity Research · Est. 2026
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-[clamp(3.2rem,10vw,7rem)] font-bold leading-[0.9] tracking-tight mb-8">
            <span className="text-foreground/85">Invest in</span><br />
            <span className="gradient-text-animated italic">Moats,</span><br />
            <span className="text-foreground/[0.18]">Not Markets.</span>
          </h1>

          <p className="text-foreground/50 text-base md:text-lg max-w-xl leading-relaxed mb-10">
            A high-conviction portfolio of 25 positions, each underwritten on moat durability,
            growth trajectory, and live valuation. Disciplined, transparent, and built to
            compound through the AI era.
          </p>

          <div className="flex flex-wrap gap-3 mb-14">
            <Link
              href="/portfolio"
              className="flex items-center gap-2 px-6 py-3 primary-gradient rounded-lg font-bold text-[#0a0b0d] text-sm hover:opacity-90 transition-opacity"
            >
              View the IM25 <ArrowRight size={16} />
            </Link>
            <Link
              href="/stocks"
              className="flex items-center gap-2 px-6 py-3 bg-foreground/[0.04] hover:bg-foreground/[0.07] border border-accent/20 rounded-lg font-bold text-foreground/80 text-sm transition-colors"
            >
              Explore Coverage
            </Link>
            <Link
              href="/research"
              className="flex items-center gap-2 px-6 py-3 bg-foreground/[0.04] hover:bg-foreground/[0.07] border border-accent/20 rounded-lg font-bold text-foreground/80 text-sm transition-colors"
            >
              <FileText size={16} /> Read Research
            </Link>
          </div>
        </div>

        {/* Stats strip */}
        <div
          className="relative grid grid-cols-2 md:grid-cols-4 rounded-xl overflow-hidden border border-accent/[0.14] animate-fade-up stagger-fill-both"
          style={{ animationDelay: '0.15s' }}
        >
          {[
            { value: "25", label: "Conviction Holdings" },
            { value: "128", label: "Under Coverage" },
            { value: "≥ 80", label: "Inclusion Threshold" },
            { value: "10%", label: "Max Position Weight" },
          ].map(({ value, label }, i) => (
            <div
              key={label}
              className={`
                bg-foreground/[0.02] p-5 md:p-6 flex flex-col gap-2
                border-foreground/[0.05]
                ${i < 3 ? 'border-r' : ''}
                ${i < 2 ? 'border-b md:border-b-0' : ''}
              `}
            >
              <p className="text-3xl md:text-4xl font-black text-foreground tracking-tight">{value}</p>
              <p className="text-foreground/28 text-[10px] font-bold uppercase tracking-[0.15em]">{label}</p>
            </div>
          ))}
        </div>
      </header>

      {/* ── The Thesis ───────────────────────────────────────────────────── */}
      <section className="animate-fade-up stagger-fill-both pb-20 md:pb-24" style={{ animationDelay: '0.2s' }}>
        <div className="mb-10">
          <p className="section-label mb-3">The Thesis</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground/85">
            Why systematic moat investing?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              num: '01',
              icon: <ShieldCheck size={20} />,
              accent: 'text-gold-bright',
              iconBg: 'bg-accent/10',
              border: 'border-accent/[0.18]',
              title: 'Economic Moats Compound',
              text: 'The best businesses become harder to compete with over time. Pricing power, switching costs, and network effects strengthen as the business scales, delivering above-market returns on capital for decades.',
            },
            {
              num: '02',
              icon: <Brain size={20} />,
              accent: 'text-blue-400',
              iconBg: 'bg-blue-500/10',
              border: 'border-blue-500/[0.12]',
              title: 'AI Rewrites the Playbook',
              text: 'Most competitive advantages are AI-vulnerable. Network effects, proprietary data, and regulatory lock-in carry 60% of the moat score — the advantages AI cannot replicate or destroy.',
            },
            {
              num: '03',
              icon: <Target size={20} />,
              accent: 'text-emerald-400',
              iconBg: 'bg-emerald-500/10',
              border: 'border-emerald-500/[0.12]',
              title: 'Concentration Beats Diversification',
              text: 'Owning 500 companies means funding mediocrity at scale. 25 high-conviction positions, each earning its place by scoring ≥80/100, concentrate capital where it compounds fastest.',
            },
          ].map(({ num, icon, accent, iconBg, border, title, text }) => (
            <div
              key={num}
              className={`relative overflow-hidden rounded-2xl border ${border} bg-foreground/[0.02] p-6 flex flex-col gap-5 group hover:bg-foreground/[0.035] transition-colors`}
            >
              <span className="absolute -top-2 -right-1 text-[6.5rem] font-black text-foreground/[0.025] leading-none select-none pointer-events-none">
                {num}
              </span>
              <div className={`relative w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center ${accent}`}>
                {icon}
              </div>
              <div className="relative">
                <h3 className="font-bold text-base text-foreground/90 mb-2.5">{title}</h3>
                <p className="text-foreground/40 text-sm leading-relaxed">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── The Scoring Framework ────────────────────────────────────────── */}
      <section className="animate-fade-up stagger-fill-both pb-20 md:pb-24" style={{ animationDelay: '0.3s' }}>
        <div className="mb-10">
          <p className="section-label mb-3">The Scoring Framework</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground/85">
            How every stock earns its score
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Moat */}
          <Card className="border border-blue-500/[0.1] p-6 gap-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={17} className="text-blue-400" />
                <span className="font-bold text-sm text-foreground/85">Moat Strength</span>
              </div>
              <span className="text-2xl font-black text-blue-400 leading-none">40%</span>
            </div>
            <div className="h-[3px] bg-foreground/[0.04] rounded-full overflow-hidden">
              <div className="h-full w-[40%] bg-blue-500 rounded-full" />
            </div>
            <div>
              <p className="text-foreground/35 text-xs leading-relaxed mb-3">
                10 weighted moat types. Resilient moats 60%, vulnerable 40%. Quality-gated breadth bonus up to +4 pts.
              </p>
              <div className="space-y-2">
                {[
                  { label: "Network Effects", w: 15 },
                  { label: "Proprietary Data", w: 12 },
                  { label: "System of Record", w: 12 },
                  { label: "Regulatory Lock-in", w: 11 },
                  { label: "Transaction Embedding", w: 10 },
                ].map(({ label, w }) => (
                  <div key={label} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-blue-400/50 shrink-0" />
                      <span className="text-foreground/35 text-xs">{label}</span>
                    </div>
                    <span className="text-[10px] text-blue-400/35 font-mono shrink-0">w={w}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Growth */}
          <Card className="border border-emerald-500/[0.1] p-6 gap-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <TrendingUp size={17} className="text-emerald-400" />
                <span className="font-bold text-sm text-foreground/85">Growth Trajectory</span>
              </div>
              <span className="text-2xl font-black text-emerald-400 leading-none">30%</span>
            </div>
            <div className="h-[3px] bg-foreground/[0.04] rounded-full overflow-hidden">
              <div className="h-full w-[30%] bg-emerald-500 rounded-full" />
            </div>
            <div>
              <p className="text-foreground/35 text-xs leading-relaxed mb-3">
                Blended 3-5 year revenue CAGR with named adjustments:
              </p>
              <div className="space-y-2">
                {[
                  "≥30% CAGR → 90 base points",
                  "15-30% CAGR → 80 base points",
                  "8-15% CAGR → 70 base points",
                  "±4 pts driver trajectory & margin trend",
                  "0 to -15 pts for key-risk severity",
                ].map(m => (
                  <div key={m} className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-emerald-400/50 shrink-0" />
                    <span className="text-foreground/35 text-xs">{m}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Valuation */}
          <Card className="border border-amber-500/[0.1] p-6 gap-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <BarChart3 size={17} className="text-amber-400" />
                <span className="font-bold text-sm text-foreground/85">Live Valuation</span>
              </div>
              <span className="text-2xl font-black text-amber-400 leading-none">30%</span>
            </div>
            <div className="h-[3px] bg-foreground/[0.04] rounded-full overflow-hidden">
              <div className="h-full w-[30%] bg-amber-500 rounded-full" />
            </div>
            <div>
              <p className="text-foreground/35 text-xs leading-relaxed mb-3">
                Price vs. scenario targets with live price feeds:
              </p>
              <div className="space-y-2">
                {[
                  "At Bear target → 90 pts",
                  "At Base (fair value) → 65 pts",
                  "At Bull target → 45 pts",
                  "100 pts at 0.8x bear, 0 pts at 2x bull",
                  "Live price per stock, scenarios refreshed quarterly",
                ].map(m => (
                  <div key={m} className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-amber-400/50 shrink-0" />
                    <span className="text-foreground/35 text-xs">{m}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Composite score legend */}
        <Card className="p-5">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <span className="section-label shrink-0">Composite Score</span>
            <div className="flex flex-wrap gap-5">
              {[
                { range: "≥ 82", label: "Strong Buy", dot: "bg-emerald-400" },
                { range: "75 – 81", label: "Accumulate", dot: "bg-blue-400" },
                { range: "68 – 74", label: "Hold", dot: "bg-amber-400" },
                { range: "60 – 67", label: "Speculative Buy", dot: "bg-orange-400" },
                { range: "< 60", label: "Avoid", dot: "bg-red-400" },
              ].map(({ range, label, dot }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                  <span className="text-foreground/40 text-xs font-mono">{range}</span>
                  <span className="text-foreground/25 text-xs">{label}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-foreground/25 text-xs leading-relaxed mt-4 pt-4 border-t border-foreground/[0.04]">
            The bands rate an asset on its own merits; portfolio inclusion is separate and stricter.
            Each pillar is standardised against the coverage universe before weighting, so a 1-sd move
            in any pillar shifts the composite in proportion to its stated weight. A composite of{" "}
            <span className="text-foreground/45 font-medium">≥ 80</span> makes an asset eligible, and the
            top 25 by composite are held.
          </p>
        </Card>
      </section>

      {/* ── The 10 Moat Model ────────────────────────────────────────────── */}
      <section className="animate-fade-up stagger-fill-both pb-20 md:pb-24" style={{ animationDelay: '0.35s' }}>
        <div className="mb-6">
          <p className="section-label mb-3">The 10 Moat Model</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground/85 mb-4">
            Not all moats survive the AI era
          </h2>
          <p className="text-foreground/40 text-sm leading-relaxed max-w-3xl">
            Every business is scored across 10 competitive advantages. Five are{" "}
            <span className="text-blue-400 font-semibold">AI-resilient</span> (60% of the score) because
            AI cannot replicate them; five are{" "}
            <span className="text-amber-400 font-semibold">AI-vulnerable</span> (40%) because intelligent
            agents can increasingly substitute for them. Each moat is rated{" "}
            <span className="text-foreground/60 font-medium">strong (100) · intact (65) · weakened (35) · destroyed (0)</span>.
            Individual moats can be reclassified per company where AI strengthens rather than erodes them —
            NVIDIA&apos;s CUDA, Palantir&apos;s ontology.
          </p>
        </div>

        {/* AI-Resilient */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/[0.08] border border-blue-500/[0.15] rounded-lg">
              <Zap size={13} className="text-blue-400" />
              <span className="text-blue-400 text-[11px] font-bold uppercase tracking-wider">AI-Resilient Moats</span>
            </div>
            <span className="text-foreground/20 text-xs">60% of moat score · weights: 15 / 12 / 12 / 11 / 10</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              {
                icon: <Network size={17} className="text-blue-400" />,
                name: "Network Effects",
                weight: 15,
                tagline: "Value compounds with every new participant",
                description:
                  "Following Metcalfe's Law, value scales with the square of participants. Every new user makes the network more valuable for all existing users — an enormous structural disadvantage for any challenger.",
                examples: ["iMessage / AirDrop ecosystem", "Bitcoin liquidity depth", "Solana developer ecosystem"],
              },
              {
                icon: <Database size={17} className="text-blue-400" />,
                name: "Proprietary Data",
                weight: 12,
                tagline: "Private, compounding data flywheels",
                description:
                  "Data that accumulates privately over time and cannot be purchased or replicated. The longer the company operates, the harder it becomes to catch up. Think HealthKit biometrics, Palantir's classified datasets, or Visa's transaction graph.",
                examples: ["Apple HealthKit", "Palantir datasets", "Visa transaction network"],
              },
              {
                icon: <BookMarked size={17} className="text-blue-400" />,
                name: "System of Record",
                weight: 12,
                tagline: "The authoritative source of truth",
                description:
                  "The company's data store is the canonical reference all downstream systems defer to. Replacing it requires migrating years of history and retraining every workflow built on top — so customers never voluntarily leave.",
                examples: ["iCloud Photos / Contacts", "Salesforce CRM", "Epic EHR systems"],
              },
              {
                icon: <Lock size={17} className="text-blue-400" />,
                name: "Regulatory Lock-In",
                weight: 11,
                tagline: "Government licences, certifications & mandates",
                description:
                  "Advantages granted by law: FDA approvals, financial licences, index inclusion, spectrum rights. These cannot be automated away; the certification process itself is the moat.",
                examples: ["Bitcoin spot ETF approval", "Mastercard banking licences", "MSCI / S&P index inclusion"],
              },
              {
                icon: <CreditCard size={17} className="text-blue-400" />,
                name: "Transaction Embedding",
                weight: 10,
                tagline: "Sitting inside the payment layer",
                description:
                  "The business is embedded directly in the financial flow of every transaction. Removing it requires rebuilding critical infrastructure — not just switching a preference.",
                examples: ["Visa / Mastercard rails", "Stripe payment infrastructure", "App Store commerce layer"],
              },
            ].map(({ icon, name, weight, tagline, description, examples }) => (
              <div key={name} className="rounded-xl border border-blue-500/[0.1] bg-blue-500/[0.02] p-5 flex flex-col gap-3 group hover:border-blue-500/[0.2] hover:bg-blue-500/[0.04] transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                      {icon}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-foreground/90">{name}</p>
                      <p className="text-blue-400/55 text-[11px]">{tagline}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-blue-400/35 bg-blue-500/8 px-1.5 py-0.5 rounded shrink-0">w={weight}</span>
                </div>
                <p className="text-foreground/35 text-xs leading-relaxed">{description}</p>
                <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
                  {examples.map(ex => (
                    <span key={ex} className="text-[10px] px-2 py-0.5 bg-blue-500/[0.07] text-blue-400/55 rounded-full border border-blue-500/[0.1]">
                      {ex}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI-Vulnerable */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/[0.07] border border-amber-500/[0.15] rounded-lg">
              <Brain size={13} className="text-amber-400" />
              <span className="text-amber-400 text-[11px] font-bold uppercase tracking-wider">AI-Vulnerable Moats</span>
            </div>
            <span className="text-foreground/20 text-xs">40% of moat score · weights: 14 / 10 / 8 / 5 / 3</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              {
                icon: <Code2 size={17} className="text-amber-400" />,
                name: "Business Logic",
                weight: 14,
                tagline: "Embedded operational workflows",
                description:
                  "The software encodes years of accumulated business rules that employees rely on daily. While this creates significant switching costs today, AI can increasingly model and reproduce business logic, gradually eroding the cost of migration.",
                examples: ["SAP ERP configurations", "MDM device policies", "Legacy COBOL systems"],
              },
              {
                icon: <Layers size={17} className="text-amber-400" />,
                name: "Bundling",
                weight: 10,
                tagline: "Value from combining complementary products",
                description:
                  "Multiple products packaged together create convenience that point solutions can't match. AI-driven software commoditises features rapidly, making it easier for focused challengers to replicate any single element.",
                examples: ["Apple One subscription", "Microsoft 365 suite", "Google Workspace"],
              },
              {
                icon: <MonitorSmartphone size={17} className="text-amber-400" />,
                name: "Learned Interfaces",
                weight: 8,
                tagline: "Fluency built through years of UI habit",
                description:
                  "Users invest time mastering a specific interface — keyboard shortcuts, mental models, workflows. AI agents increasingly abstract away the interface layer, letting users command outcomes without learning a specific UI.",
                examples: ["macOS / iOS UX", "Final Cut Pro", "Adobe Creative Suite"],
              },
              {
                icon: <GraduationCap size={17} className="text-amber-400" />,
                name: "Talent Scarcity",
                weight: 5,
                tagline: "Rare human expertise as competitive advantage",
                description:
                  "The business depends on a small pool of specialists whose skills are hard to find. AI augments and in some domains replaces highly skilled human work, compressing the scarcity premium over time.",
                examples: ["NVIDIA CUDA team", "TSMC process engineers", "Quantitative hedge funds"],
              },
              {
                icon: <Globe size={17} className="text-amber-400" />,
                name: "Public Data Access",
                weight: 3,
                tagline: "Privileged access to publicly available information",
                description:
                  "The company has a head-start aggregating data that is technically public but expensive to compile. AI web-crawlers and LLMs rapidly close this gap by training on the same underlying sources.",
                examples: ["Bloomberg terminal data", "Credit bureau aggregation", "Market data vendors"],
              },
            ].map(({ icon, name, weight, tagline, description, examples }) => (
              <div key={name} className="rounded-xl border border-amber-500/[0.1] bg-amber-500/[0.02] p-5 flex flex-col gap-3 group hover:border-amber-500/[0.18] hover:bg-amber-500/[0.035] transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                      {icon}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-foreground/90">{name}</p>
                      <p className="text-amber-400/50 text-[11px]">{tagline}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-amber-400/35 bg-amber-500/8 px-1.5 py-0.5 rounded shrink-0">w={weight}</span>
                </div>
                <p className="text-foreground/35 text-xs leading-relaxed">{description}</p>
                <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
                  {examples.map(ex => (
                    <span key={ex} className="text-[10px] px-2 py-0.5 bg-amber-500/[0.07] text-amber-400/50 rounded-full border border-amber-500/[0.1]">
                      {ex}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scoring note */}
        <Card className="p-5 mt-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 shrink-0">
              <ShieldCheck size={14} className="text-foreground/25" />
              <span className="section-label">How moats are assessed</span>
            </div>
            <p className="text-foreground/30 text-xs leading-relaxed">
              Each moat is rated{" "}
              <span className="text-foreground/50 font-medium">strong (100) · intact (65) · weakened (35) · destroyed (0)</span>.
              N/A moats are excluded and their weight redistributed. A{" "}
              <span className="text-foreground/50 font-medium">quality-gated breadth bonus of +1 to +4</span> rewards
              each moat rated intact-or-better beyond the fifth — broad mediocrity earns nothing — and a{" "}
              <span className="text-foreground/50 font-medium">-5 discount</span> applies where the AI-vulnerable
              group outscores the resilient one. That produces the{" "}
              <span className="text-blue-400 font-semibold">Moat Score (40% of composite)</span>.
            </p>
          </div>
        </Card>
      </section>

      {/* ── Q&A ──────────────────────────────────────────────────────────── */}
      <section className="animate-fade-up stagger-fill-both pb-20 md:pb-24" style={{ animationDelay: '0.4s' }}>
        <div className="mb-10">
          <p className="section-label mb-3">Common Questions</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground/85">
            Questions worth asking
          </h2>
        </div>

        <Card className="px-6 py-2">
          {FAQS.map(({ q, a }) => (
            <FAQItem key={q} q={q} a={a} />
          ))}
        </Card>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────────────────── */}
      <section
        className="animate-fade-up stagger-fill-both pb-12"
        style={{ animationDelay: '0.45s' }}
      >
        <Card className="relative overflow-hidden p-10 md:p-14 text-center">
          {/* Glow behind CTA */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="w-96 h-40 bg-accent/[0.08] blur-[60px] rounded-full" />
          </div>
          <div className="relative">
            <p className="section-label mb-4">Ready to explore?</p>
            <h3 className="text-2xl md:text-4xl font-bold gradient-text mb-4">
              View the IM25
            </h3>
            <p className="text-foreground/45 max-w-md mx-auto text-sm leading-relaxed mb-8">
              Explore the current 25-position allocation, browse all 128 analyzed assets,
              read the cross-cutting research, or dive into individual company reports with
              moat scores, scenarios, and live valuations.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/portfolio"
                className="flex items-center gap-2 px-6 py-3 primary-gradient rounded-lg font-bold text-[#0a0b0d] text-sm hover:opacity-90 transition-opacity"
              >
                View the IM25 <ArrowRight size={16} />
              </Link>
              <Link
                href="/stocks"
                className="flex items-center gap-2 px-6 py-3 bg-foreground/[0.04] hover:bg-foreground/[0.07] border border-accent/20 rounded-lg font-bold text-foreground/75 text-sm transition-colors"
              >
                All Coverage
              </Link>
              <Link
                href="/research"
                className="flex items-center gap-2 px-6 py-3 bg-foreground/[0.04] hover:bg-foreground/[0.07] border border-accent/20 rounded-lg font-bold text-foreground/75 text-sm transition-colors"
              >
                <FileText size={16} /> Read Research
              </Link>
            </div>
          </div>
        </Card>
      </section>

    </div>
  );
}
