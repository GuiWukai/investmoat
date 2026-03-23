import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'InvestMoat — AI-Era Moat Portfolio';
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
          background: 'linear-gradient(135deg, #07070f 0%, #0d0d20 60%, #0a0a18 100%)',
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
              'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        {/* Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(99,102,241,0.15)',
            border: '1px solid rgba(99,102,241,0.4)',
            borderRadius: '100px',
            padding: '8px 20px',
            marginBottom: '32px',
            fontSize: '18px',
            color: 'rgba(165,180,252,0.9)',
            letterSpacing: '0.04em',
            fontWeight: 600,
          }}
        >
          Open Source · AI-Era Portfolio
        </div>
        {/* Title */}
        <div
          style={{
            fontSize: '86px',
            fontWeight: 900,
            color: 'white',
            letterSpacing: '-3px',
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
            color: 'rgba(255,255,255,0.55)',
            textAlign: 'center',
            maxWidth: '800px',
            lineHeight: 1.5,
          }}
        >
          Score stocks on moat durability, growth trajectory, and live
          valuation — build a high-conviction portfolio for the AI era.
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
            { label: 'MOAT', value: '40%', color: '#818cf8' },
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
