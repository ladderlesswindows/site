"use client";

import type { SupabaseClient } from '@supabase/supabase-js';
import { CustomerSlotPicker, type SlotPickerMode } from '@/components/CustomerSlotPicker';
import { formatSlotTimeLabel, parseLocalDate } from '@/lib/bookingSlots';

type BookingSchedulePanelProps = {
  supabase: SupabaseClient | null;
  providerId: string;
  supabaseReady: boolean;
  mode?: SlotPickerMode;
  initialSlot?: string | null;
  selectedSlot: string | null;
  onSlotChange: (slot: string | null) => void;
  onNotesChange?: (notes: { arrivalNotes: string }) => void;
};

export function BookingSchedulePanel({
  supabase,
  providerId,
  supabaseReady,
  mode = 'live',
  initialSlot = null,
  selectedSlot,
  onSlotChange,
  onNotesChange,
}: BookingSchedulePanelProps) {
  const isPreview = mode === 'preview';

  return (
    <div className="border border-neutral-200 rounded-3xl bg-cream p-3">
      <div className="text-[10px] uppercase tracking-wide text-neutral-500 text-center mb-2">
        {isPreview ? 'Live schedule' : 'Schedule'}
      </div>

      <CustomerSlotPicker
        supabase={supabase}
        providerId={providerId}
        supabaseReady={isPreview ? true : supabaseReady}
        mode={mode}
        initialSlot={initialSlot}
        onSlotChange={onSlotChange}
        onNotesChange={onNotesChange}
      />

      {selectedSlot && (
        <div className="p-2 border border-emerald-200 bg-emerald-50 rounded-xl text-xs mt-2">
          <div className="font-medium text-emerald-700">Selected time:</div>
          <div>
            {(() => {
              const [datePart, timePart] = selectedSlot.split('T');
              const time24 = timePart?.slice(0, 5) ?? '';
              return (
                <>
                  {parseLocalDate(datePart).toLocaleDateString(undefined, {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}{' '}
                  at {formatSlotTimeLabel(time24)}
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}