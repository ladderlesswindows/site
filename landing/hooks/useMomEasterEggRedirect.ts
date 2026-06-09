"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isMomEasterEggZip, MOM_EASTER_EGG_PATH } from '@/lib/easterEggZips';

/** Sends hidden ZIP 79510 to /booking/mom; returns true while redirecting. */
export function useMomEasterEggRedirect(zip: string): boolean {
  const router = useRouter();
  const shouldRedirect = isMomEasterEggZip(zip);

  useEffect(() => {
    if (shouldRedirect) {
      router.replace(`${MOM_EASTER_EGG_PATH}?zip=${zip.trim()}`);
    }
  }, [zip, router, shouldRedirect]);

  return shouldRedirect;
}