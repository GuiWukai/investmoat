import { ImageResponse } from 'next/og';
import { getStockData } from '@/data/stocks';
import { computeMoatScore } from '@/lib/valuationScore';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = await params;
  const data = getStockData(ticker);

  if (!data) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#07070f',
            fontSize: 48,
            color: 'white',
          }}
        >
          InvestMoat
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  const moatScore = computeMoatScore(data.tenMoats);
  const growthScore = data.growth.score;
  const recommendation = data.recommendation;

  function scoreColor(s: number): string {
    if (s >= 90) return '#34d399';
    if (s >= 80) return '#818cf8';
    if (s >= 70) return '#fbbf24';
    return '#f87171';
  }

  const recColor =
    recommendation === 'Strong Buy'
      ? '#34d399'
      : recommendation === 'Accumulate'
      ? '#818cf8'
      : recommendation === 'Hold'
      ? '#fbbf24'
      : '#a78bfa'; // Speculative Buy

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #07070f 0%, #0d0d20 60%, #0a0a18 100%)',
          padding: '72px 80px',
          position: 'relative',
        }}
      >
        {/* Grid overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Top: site name + recommendation badge */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '48px',
          }}
        >
          <span
            style={{
              fontSize: '22px',
              fontWeight: 800,
              color: 'rgba(255,255,255,0.4)',
              letterSpacing: '0.06em',
            }}
          >
            INVESTMOAT
          </span>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: `${recColor}20`,
              border: `1px solid ${recColor}60`,
              borderRadius: '100px',
              padding: '8px 22px',
              fontSize: '18px',
              color: recColor,
              fontWeight: 700,
              letterSpacing: '0.04em',
            }}
          >
            {recommendation}
          </div>
        </div>

        {/* Stock name + ticker */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div
            style={{
              fontSize: '72px',
              fontWeight: 900,
              color: 'white',
              letterSpacing: '-2px',
              lineHeight: 1,
              marginBottom: '12px',
            }}
          >
            {data.name}
          </div>
          <div
            style={{
              fontSize: '28px',
              fontWeight: 800,
              color: 'rgba(255,255,255,0.35)',
              letterSpacing: '0.14em',
              marginBottom: '32px',
            }}
          >
            {data.ticker}
          </div>
          <div
            style={{
              fontSize: '22px',
              color: 'rgba(255,255,255,0.5)',
              maxWidth: '820px',
              lineHeight: 1.5,
            }}
          >
            {data.moat.description}
          </div>
        </div>

        {/* Score pills */}
        <div style={{ display: 'flex', gap: '20px', marginTop: '44px' }}>
          {[
            { label: 'MOAT', value: moatScore },
            { label: 'GROWTH', value: growthScore },
          ].map(({ label, value }) => (
            <div
              key={label}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                padding: '18px 40px',
              }}
            >
              <span
                style={{
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.3)',
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                }}
              >
                {label}
              </span>
              <span
                style={{
                  fontSize: '42px',
                  fontWeight: 900,
                  color: scoreColor(value),
                  lineHeight: 1.1,
                  marginTop: '4px',
                }}
              >
                {value}
              </span>
              <span
                style={{
                  fontSize: '11px',
                  color: 'rgba(255,255,255,0.2)',
                  marginTop: '2px',
                }}
              >
                / 100
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
