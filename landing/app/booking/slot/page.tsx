"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { buildBookingSearchParams, parseScreenReinstall } from '@/components/bookingFlowParams';

/** Legacy route — slot picker now lives inline on /booking/address */
function SlotRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const params = buildBookingSearchParams({
      zip: searchParams.get('zip') || '95060',
      windows: parseInt(searchParams.get('windows') || '1', 10) || 1,
      screenReinstall: parseScreenReinstall(
        searchParams.get('screenReinstall'),
        searchParams.get('screensChoice')
      ),
      screensChoice:
        (searchParams.get('screensChoice') as 'outside' | 'fee' | 'decide' | '') || undefined,
      qualifier: searchParams.get('qualifier') || '',
      flow: '30s',
      name: searchParams.get('name') || undefined,
      address: searchParams.get('address') || undefined,
      email: searchParams.get('email') || undefined,
    });
    router.replace(`/booking/address?${params}`);
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-sm text-neutral-500">
      Loading booking calendar…
    </div>
  );
}

export default function SlotPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SlotRedirect />
    </Suspense>
  );
}