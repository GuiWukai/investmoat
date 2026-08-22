'use client';

import Script from 'next/script';
import { Suspense, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { isValidGaMeasurementId } from '@/lib/googleAnalytics';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function pagePath(pathname: string, search: string): string {
  return search ? `${pathname}?${search}` : pathname;
}

function sendPageView(measurementId: string, pathname: string, search: string) {
  window.gtag?.('event', 'page_view', {
    send_to: measurementId,
    page_path: pagePath(pathname, search),
    page_location: window.location.href,
    page_title: document.title,
  });
}

/**
 * Fires a GA4 `page_view` on App Router navigations. The gtag snippet is
 * configured with `send_page_view: false` so the first view is not counted
 * twice — this effect owns every hit, including the initial load.
 */
function GoogleAnalyticsPageViews({ measurementId }: { measurementId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  useEffect(() => {
    if (typeof window.gtag === 'function') {
      sendPageView(measurementId, pathname, search);
      return;
    }

    const poll = window.setInterval(() => {
      if (typeof window.gtag === 'function') {
        window.clearInterval(poll);
        sendPageView(measurementId, pathname, search);
      }
    }, 50);
    const timeout = window.setTimeout(() => window.clearInterval(poll), 8000);

    return () => {
      window.clearInterval(poll);
      window.clearTimeout(timeout);
    };
  }, [measurementId, pathname, search]);

  return null;
}

/**
 * Loads gtag.js and records a page view on every client-side route change.
 * Renders nothing when the measurement ID is missing or malformed.
 */
export function GoogleAnalytics({ measurementId }: { measurementId: string }) {
  if (!isValidGaMeasurementId(measurementId)) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', { send_page_view: false });
        `}
      </Script>
      <Suspense fallback={null}>
        <GoogleAnalyticsPageViews measurementId={measurementId} />
      </Suspense>
    </>
  );
}
