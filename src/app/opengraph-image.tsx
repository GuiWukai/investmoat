import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'InvestMoat — Systematic Moat Equity Research';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #080a0e 0%, #11120c 55%, #0a0b0d 100%)',
          padding: '80px',
          position: 'relative',
        }}
      >
        {/* Subtle grid overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(201,169,106,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,106,0.04) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        {/* Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(201,169,106,0.12)',
            border: '1px solid rgba(201,169,106,0.45)',
            borderRadius: '100px',
            padding: '8px 22px',
            marginBottom: '34px',
            fontSize: '18px',
            color: 'rgba(228,201,138,0.95)',
            letterSpacing: '0.14em',
            fontWeight: 600,
            textTransform: 'uppercase',
          }}
        >
          Systematic Equity Research
        </div>
        {/* Title */}
        <div
          style={{
            fontSize: '92px',
            fontWeight: 700,
            color: '#f4f1ea',
            letterSpacing: '-2px',
            lineHeight: 1,
            marginBottom: '28px',
            textAlign: 'center',
          }}
        >
          InvestMoat
        </div>
        {/* Subtitle */}
        <div
          style={{
            fontSize: '28px',
            color: 'rgba(244,241,234,0.6)',
            textAlign: 'center',
            maxWidth: '820px',
            lineHeight: 1.5,
          }}
        >
          Underwriting stocks on moat durability, growth trajectory, and live
          valuation — a high-conviction portfolio for the AI era.
        </div>
        {/* Score pills row */}
        <div
          style={{
            display: 'flex',
            gap: '24px',
            marginTop: '52px',
          }}
        >
          {[
            { label: 'MOAT', value: '40%', color: '#e4c98a' },
            { label: 'GROWTH', value: '35%', color: '#34d399' },
            { label: 'VALUATION', value: '25%', color: '#fbbf24' },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                padding: '20px 36px',
              }}
            >
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', fontWeight: 700, letterSpacing: '0.12em' }}>
                {label}
              </span>
              <span style={{ fontSize: '32px', fontWeight: 900, color, marginTop: '6px' }}>
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
