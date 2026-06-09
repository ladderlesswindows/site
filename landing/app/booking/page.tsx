"use client";

import { Suspense } from 'react';
import { BookingFlowContent } from '@/components/BookingFlowContent';

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <BookingFlowContent basePath="/booking" />
    </Suspense>
  );
}