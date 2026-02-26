'use client';

import React from 'react';
import { Card, CardBody, CardHeader, Chip, Progress, CircularProgress, Divider } from "@heroui/react";

interface MetricCardProps {
  title: string;
  value: string | number;
  label: string;
  icon: React.ReactNode;
  color?: string;
}

export function MetricCard({ title, value, label, icon, color = 'var(--primary)' }: MetricCardProps) {
  return (
    <Card className="flex-1 bg-white/5 border-none backdrop-blur-md">
      <CardBody className="gap-4">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-lg" style={{ background: color }}>
            {icon}
          </div>
          <span className="text-sm font-medium text-white/60">{title}</span>
        </div>
        <div>
          <div className="text-2xl md:text-3xl font-bold">{value}</div>
          <div className="text-[10px] md:text-xs text-white/50">{label}</div>
        </div>
      </CardBody>
    </Card>
  );
}

interface ScoreGaugeProps {
  score: number;
  label: string;
  description: string;
}

export function ScoreGauge({ score, label, description }: ScoreGaugeProps) {
  const getColor = (s: number) => {
    if (s >= 90) return "success";
    if (s >= 75) return "primary";
    if (s >= 60) return "warning";
    return "danger";
  };

  return (
    <Card className="w-full lg:min-w-[240px] flex-1 bg-white/5 border-none backdrop-blur-md text-center p-4">
      <CardHeader className="justify-center pb-0">
        <h3 className="text-lg font-semibold">{label}</h3>
      </CardHeader>
      <CardBody className="items-center py-6">
        <CircularProgress
          classNames={{
            svg: "w-32 h-32 drop-shadow-md",
            indicator: "stroke-primary",
            track: "stroke-white/10",
            value: "text-3xl font-extrabold text-white",
          }}
          value={score}
          strokeWidth={4}
          showValueLabel={true}
          color={getColor(score)}
        />
      </CardBody>
      <p className="text-sm text-white/60">{description}</p>
    </Card>
  );
}

export function AnalysisSection({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <section className="mt-8 md:mt-12">
      <div className="flex items-center gap-4 mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
        <Divider className="flex-1 opacity-20" />
      </div>
      {children}
    </section>
  );
}

export function ScenarioCard({ 
  type, 
  priceTarget, 
  description, 
  points 
}: { 
  type: 'Bear' | 'Base' | 'Bull', 
  priceTarget: string, 
  description: string,
  points: string[]
}) {
  const colorMap: Record<string, "danger" | "primary" | "success"> = {
    Bear: "danger",
    Base: "primary",
    Bull: "success"
  };

  return (
    <Card className={`flex-1 bg-white/5 border-none backdrop-blur-md border-t-4 border-${colorMap[type]}`} style={{ borderTopColor: type === 'Bear' ? '#f31260' : type === 'Base' ? '#006fee' : '#17c964' }}>
      <CardBody className="gap-4">
        <div className="flex justify-between items-center">
          <Chip color={colorMap[type]} variant="flat" className="font-bold">{type} CASE</Chip>
          <span className="text-xl font-bold">{priceTarget}</span>
        </div>
        <p className="text-sm font-semibold text-white">{description}</p>
        <ul className="pl-4 text-xs text-white/60 flex flex-col gap-2 list-disc">
          {points.map((point, i) => (
            <li key={i}>{point}</li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
}

export function RecommendationBadge({ status }: { status: 'Strong Buy' | 'Accumulate' | 'Hold' | 'Speculative Buy' }) {
  const colorMap: Record<string, "success" | "primary" | "default" | "warning"> = {
    'Strong Buy': "success",
    'Accumulate': "primary",
    'Hold': "default",
    'Speculative Buy': "warning"
  };

  return (
    <div className="mt-4">
      <Chip 
        color={colorMap[status]} 
        variant="dot" 
        className="backdrop-blur-md bg-white/5 p-4 py-6 border-white/10 max-w-full"
        size="lg"
      >
        <span className="text-[10px] md:text-xs text-white/60 mr-2 uppercase">Portfolio Status:</span>
        <span className="font-bold uppercase text-xs md:text-sm">{status}</span>
      </Chip>
    </div>
  );
}
