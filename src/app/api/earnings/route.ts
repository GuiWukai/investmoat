import { NextResponse } from 'next/server';
import {
  EARNINGS_REVALIDATE_SECONDS,
  getEarningsCalendar,
} from '@/lib/earningsCalendar';

export const revalidate = EARNINGS_REVALIDATE_SECONDS;

export async function GET() {
  try {
    const calendar = await getEarningsCalendar();
    return NextResponse.json(calendar, {
      headers: {
        'Cache-Control': `public, s-maxage=${EARNINGS_REVALIDATE_SECONDS}, stale-while-revalidate=3600`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to load earnings calendar' },
      { status: 502 },
    );
  }
}
