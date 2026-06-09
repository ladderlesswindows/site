"use client";

import { Suspense } from 'react';
import { BookingSuccessFlowContent } from '@/components/BookingSuccessFlowContent';

export default function MomSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <BookingSuccessFlowContent basePath="/booking/mom" />
    </Suspense>
  );
}