"use client";

import { Suspense } from 'react';
import { BookingAddressFlowContent } from '@/components/BookingAddressFlowContent';

export default function MomAddressPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <BookingAddressFlowContent basePath="/booking/mom" />
    </Suspense>
  );
}