import { ImageResponse } from 'next/og';
import { getResearchArticle } from '@/data/research';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getResearchArticle(slug);

  // Brand wordmark font (Libre Caslon Display) — bundled TTF passed to Satori,
  // which doesn't read CSS/web fonts. Falls back to default sans on failure.
  const caslon = await fetch(
    new URL('../../_fonts/LibreCaslonDisplay-Regular.ttf', import.meta.url),
  )
    .then((r) => r.arrayBuffer())
    .catch(() => null);
  const brandFonts = caslon
    ? [{ name: 'Libre Caslon Display', data: caslon, weight: 400 as const, style: 'normal' as const }]
    : undefined;

  if (!article) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#080a0e',
            fontFamily: caslon ? 'Libre Caslon Display' : undefined,
            fontSize: 64,
            color: '#f4f1ea',
          }}
        >
          InvestMoat
        </div>
      ),
      { width: 1200, height: 630, fonts: brandFonts },
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #080a0e 0%, #11120c 55%, #0a0b0d 100%)',
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
              'linear-gradient(rgba(201,169,106,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,106,0.035) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Top: site name + section badge */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '44px',
          }}
        >
          <span
            style={{
              fontFamily: caslon ? 'Libre Caslon Display' : undefined,
              fontSize: '26px',
              fontWeight: 400,
              color: 'rgba(201,169,106,0.85)',
              letterSpacing: '0.04em',
            }}
          >
            InvestMoat
          </span>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(201,169,106,0.13)',
              border: '1px solid rgba(201,169,106,0.4)',
              borderRadius: '100px',
              padding: '8px 22px',
              fontSize: '17px',
              color: '#e4c98a',
              fontWeight: 700,
              letterSpacing: '0.12em',
            }}
          >
            RESEARCH
          </div>
        </div>

        {/* Title + dek */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div
            style={{
              fontSize: article.title.length > 44 ? '58px' : '68px',
              fontWeight: 900,
              color: 'white',
              letterSpacing: '-1.6px',
              lineHeight: 1.08,
              marginBottom: '24px',
            }}
          >
            {article.title}
          </div>
          <div
            style={{
              fontSize: '23px',
              color: 'rgba(255,255,255,0.48)',
              maxWidth: '900px',
              lineHeight: 1.5,
            }}
          >
            {article.dek.length > 190 ? `${article.dek.slice(0, 187)}…` : article.dek}
          </div>
        </div>

        {/* Bottom: tickers covered + date */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '40px',
          }}
        >
          <div style={{ display: 'flex', gap: '10px' }}>
            {article.tickers.slice(0, 7).map((ticker) => (
              <div
                key={ticker}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  borderRadius: '10px',
                  padding: '9px 15px',
                  fontSize: '17px',
                  fontWeight: 800,
                  color: 'rgba(255,255,255,0.62)',
                  letterSpacing: '0.06em',
                }}
              >
                {ticker}
              </div>
            ))}
            {article.tickers.length > 7 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '16px',
                  color: 'rgba(255,255,255,0.28)',
                  padding: '9px 4px',
                }}
              >
                +{article.tickers.length - 7}
              </div>
            )}
          </div>
          <span
            style={{
              fontSize: '16px',
              color: 'rgba(255,255,255,0.28)',
              letterSpacing: '0.05em',
            }}
          >
            {article.published}
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts: brandFonts },
  );
}
