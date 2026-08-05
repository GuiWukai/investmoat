import { NextResponse } from 'next/server';
import { getEarningsCalendar } from '@/lib/earningsCalendar';

// Must be a literal — Next.js segment config is statically analyzed.
export const revalidate = 21600; // 6 hours

export async function GET() {
  try {
    const calendar = await getEarningsCalendar();
    return NextResponse.json(calendar, {
      headers: {
        'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=3600',
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to load earnings calendar' },
      { status: 502 },
    );
  }
}
