import { ImageResponse } from 'next/og';
import { getSectorBySlug } from '@/lib/sectorCatalog';

export const runtime = 'edge';
export const alt = 'InvestMoat sector coverage';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const sector = getSectorBySlug(slug);

  const caslon = await fetch(
    new URL('../../_fonts/LibreCaslonDisplay-Regular.ttf', import.meta.url),
  )
    .then((r) => r.arrayBuffer())
    .catch(() => null);
  const brandFonts = caslon
    ? [{ name: 'Libre Caslon Display', data: caslon, weight: 400 as const, style: 'normal' as const }]
    : undefined;

  const title = sector?.label ?? 'Sectors';
  const color = sector?.color ?? '#c9a96a';

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
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(201,169,106,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,106,0.035) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 8,
            background: color,
          }}
        />

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
            SECTOR
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div
            style={{
              fontSize: '64px',
              fontWeight: 900,
              color: 'white',
              letterSpacing: '-1.6px',
              lineHeight: 1.08,
              marginBottom: '24px',
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: '22px',
              color: 'rgba(255,255,255,0.48)',
              maxWidth: '880px',
              lineHeight: 1.5,
            }}
          >
            {sector?.description ?? 'Coverage by sector.'}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '40px',
          }}
        >
          <span
            style={{
              fontSize: '16px',
              color: 'rgba(255,255,255,0.28)',
              letterSpacing: '0.05em',
            }}
          >
            Coverage universe · scored on moat, growth, valuation
          </span>
          <span
            style={{
              fontSize: '16px',
              color: 'rgba(255,255,255,0.28)',
              letterSpacing: '0.05em',
            }}
          >
            Moat · Growth · Live valuation
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts: brandFonts },
  );
}
