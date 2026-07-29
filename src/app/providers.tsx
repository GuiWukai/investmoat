'use client';

import { RouterProvider } from '@heroui/react/rac';
import { useRouter } from 'next/navigation';

/**
 * HeroUI v3 dropped `HeroUIProvider` — theming is pure CSS now, so the only
 * thing left to wire up is routing. React Aria's `RouterProvider` is what makes
 * `href` on HeroUI components (Link, MenuItem, Button…) navigate through the
 * Next.js router instead of doing a full page load.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <RouterProvider navigate={router.push}>
      {children}
    </RouterProvider>
  );
}
