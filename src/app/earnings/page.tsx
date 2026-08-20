import { Suspense } from 'react';
import { getEarningsCalendar } from '@/lib/earningsCalendar';
import EarningsClient from './EarningsClient';

export const revalidate = 21600;
export const maxDuration = 60;

function EarningsFallback() {
  return (
    <div className="animate-fade-in space-y-8 md:space-y-10">
      <header>
        <p className="section-label mb-3">Coverage Universe</p>
        <h1 className="page-title gradient-text-animated mb-4">What&apos;s printing.</h1>
      </header>
    </div>
  );
}

export default async function EarningsPage() {
  let initialData = null;
  let initialError: string | null = null;
  try {
    initialData = await getEarningsCalendar();
  } catch {
    initialError = 'Could not load the earnings calendar. Try again shortly.';
  }

  return (
    <Suspense fallback={<EarningsFallback />}>
      <EarningsClient initialData={initialData} initialError={initialError} />
    </Suspense>
  );
}
