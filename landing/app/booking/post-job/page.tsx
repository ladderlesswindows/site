"use client";

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

function PostJobContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('booking_id') || searchParams.get('id');
  const customerEmailParam = searchParams.get('email');

  const [booking, setBooking] = useState<any>(null);
  const [tip, setTip] = useState(0);
  const [review, setReview] = useState('');
  const [recurring, setRecurring] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const loadBooking = async () => {
      let data = null;
      let error = null;

      if (bookingId) {
        const res = await (supabase!).from('bookings').select('*').eq('id', bookingId).single();
        data = res.data;
        error = res.error;
      } else if (customerEmailParam) {
        const res = await (supabase!)
          .from('bookings')
          .select('*')
          .eq('customer_email', customerEmailParam)
          .order('scheduled_start', { ascending: false })
          .limit(1)
          .single();
        data = res.data;
        error = res.error;
      }

      if (error) {
        console.error('Error loading booking:', error);
      } else if (data) {
        setBooking(data);
        if (data.tip_amount) setTip(data.tip_amount);
        if (data.review) setReview(data.review);
        if (data.recurring_preference) setRecurring(data.recurring_preference);
      }
      setLoading(false);
    };

    loadBooking();
  }, [bookingId, customerEmailParam]);

  const total = booking ? (booking.estimated_price || 0) + tip : 0;

  const handleSubmit = async () => {
    if (!supabase || !bookingId) return;

    const { error } = await (supabase!)
      .from('bookings')
      .update({
        tip_amount: tip,
        review: review || null,
        recurring_preference: recurring,
        status: 'complete',
      })
      .eq('id', bookingId);

    if (error) {
      alert('Error submitting: ' + error.message);
      return;
    }

    setSubmitted(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p>Loading job details...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <main className="flex-1 px-5 pt-12 pb-12">
          <div className="mx-auto max-w-md">
            <div className="border border-neutral-200 rounded-3xl p-2 mb-6">
              <div className="flex justify-center mb-4">
                <img src="/ll.jpg" alt="Ladderless Windows" className="w-full h-auto object-contain rounded-3xl" />
              </div>
            </div>
            <div className="border border-neutral-200 rounded-3xl p-6 text-center">
              <h1 className="text-xl font-semibold mb-3">Job not found</h1>
              <p className="text-sm text-neutral-600 mb-4">
                Please use the link from your email or text, or enter booking ID.
              </p>
              <Link href="/booking" className="inline-block px-4 py-2 bg-[#0f766e] text-white rounded-3xl text-sm">
                Back to Booking
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <main className="flex-1 px-5 pt-12 pb-12">
          <div className="mx-auto max-w-md text-center">
            <div className="border border-neutral-200 rounded-3xl p-2 mb-6">
              <div className="flex justify-center mb-4">
                <img src="/ll.jpg" alt="Ladderless Windows" className="w-full h-auto object-contain rounded-3xl" />
              </div>
            </div>
            <h1 className="text-2xl font-semibold mb-4">Thank you!</h1>
            <p className="text-sm text-neutral-600 mb-6">
              Your tip and review have been recorded. 100% Satisfaction Guaranteed.
            </p>
            {recurring && (
              <p className="text-sm text-emerald-700 mb-6">
                We'll remind you for your {recurring} cleaning.
              </p>
            )}
            <Link href="/" className="inline-block px-4 py-2 bg-[#0f766e] text-white rounded-3xl text-sm">
              Back to Home
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1 px-5 pt-12 pb-12">
        <div className="mx-auto max-w-md">
          {/* branding */}
          <div className="border border-neutral-200 rounded-3xl p-2 mb-6">
            <div className="flex justify-center mb-4">
              <img src="/ll.jpg" alt="Ladderless Windows" className="w-full h-auto object-contain rounded-3xl" />
            </div>
          </div>

          <h1 className="text-xl font-semibold mb-2">Job Complete — Thank you!</h1>
          <p className="text-sm text-neutral-600 mb-4">
            {booking.address || 'Your job'} on {new Date(booking.scheduled_start).toLocaleDateString()}
          </p>

          {/* Summary */}
          <div className="border border-neutral-200 rounded-3xl p-4 mb-6 text-sm">
            <div>Base: ${booking.estimated_price || 0}</div>
            <div className="flex items-center gap-2 mt-2">
              Tip: $
              <input
                type="number"
                value={tip}
                onChange={(e) => setTip(parseInt(e.target.value) || 0)}
                className="w-20 border rounded p-1 text-sm"
                min="0"
              />
            </div>
            <div className="font-medium mt-1">Total: ${total}</div>
          </div>

          {/* Review */}
          <div className="mb-6">
            <div className="text-sm font-medium mb-1">Review (optional)</div>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="How did we do?"
              className="w-full border rounded p-2 text-sm h-24"
            />
          </div>

          {/* Recurring / Membership sequence */}
          <div className="mb-6">
            <div className="text-sm font-medium mb-2">Schedule your next cleaning (membership perks)</div>
            <div className="flex gap-2">
              {['1 month', '6 months', '1 year'].map((interval) => (
                <button
                  key={interval}
                  onClick={() => setRecurring(interval)}
                  className={`flex-1 py-2 text-sm rounded-2xl border ${recurring === interval ? 'bg-[#0f766e] text-white border-[#0f766e]' : 'border-neutral-300 active:bg-neutral-50'}`}
                >
                  {interval}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-neutral-500 mt-1">We'll send a reminder and easy rebook link.</p>
          </div>

          <button
            onClick={handleSubmit}
            className="block w-full py-4 text-lg font-semibold text-center rounded-3xl bg-[#0f766e] text-white active:bg-[#0c5f58]"
          >
            Submit Tip, Review &amp; Schedule Next
          </button>

          <div className="text-center mt-3">
            <Link href="/" className="text-xs text-neutral-500">← Back to Home</Link>
          </div>
        </div>
      </main>

      <footer className="pb-8">
        <p className="mt-8 text-center text-xs uppercase tracking-[2.5px] text-neutral-400 font-medium">
          Fully Insured • Vetted Technicians • Satisfaction Guaranteed
        </p>
      </footer>
    </div>
  );
}

export default function PostJobPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <PostJobContent />
    </Suspense>
  );
}
