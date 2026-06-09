"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  isMomEasterEggZip,
  MOM_EASTER_EGG_PATH,
  MOM_EASTER_EGG_ZIP,
} from '@/lib/easterEggZips';

/** Sends hidden ZIP 79510 to /booking/mom; returns true while redirecting. */
export function useMomEasterEggRedirect(zip: string | null | undefined): boolean {
  const router = useRouter();
  const shouldRedirect = zip != null && isMomEasterEggZip(zip);

  useEffect(() => {
    if (!shouldRedirect) return;
    const target = `${MOM_EASTER_EGG_PATH}?zip=${MOM_EASTER_EGG_ZIP}`;
    // Hard navigation avoids client-router races that briefly default to 95060.
    if (typeof window !== 'undefined' && window.location.pathname !== MOM_EASTER_EGG_PATH) {
      window.location.replace(target);
      return;
    }
    router.replace(target);
  }, [router, shouldRedirect]);

  return shouldRedirect;
}