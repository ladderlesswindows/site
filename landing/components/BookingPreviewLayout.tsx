"use client";

import { ReactNode } from "react";
import { FlowPageLayout } from "@/components/FlowPageLayout";
import { BookingSchedulePanel } from "@/components/BookingSchedulePanel";
import { BookingSubtotalPanel } from "@/components/BookingSubtotalPanel";
import { BookingPricesPanel } from "@/components/BookingPricesPanel";
import { MomLovePanel } from "@/components/MomLovePanel";
import { useSupabase } from "@/hooks/useSupabase";

type BookingPreviewLayoutProps = {
  children: ReactNode;
  windowCount: number;
  minWindows: number;
  previewSlot: string | null;
  onWindowCountChange: (count: number) => void;
  onSlotChange: (slot: string | null) => void;
  /** Mom easter egg — rose + love note on the right */
  showMomLovePanel?: boolean;
};

/** Three-column booking shell: live schedule preview (left), main module (center), subtotal (right). */
export function BookingPreviewLayout({
  children,
  windowCount,
  minWindows,
  previewSlot,
  onWindowCountChange,
  onSlotChange,
  showMomLovePanel = false,
}: BookingPreviewLayoutProps) {
  const { supabase, providerId, ready: supabaseReady } = useSupabase();

  return (
    <FlowPageLayout
      containerClassName="mx-auto w-full max-w-5xl"
      leftPanelClassName="w-full md:w-60 md:flex-shrink-0 order-3 md:order-1"
      mainClassName="w-full max-w-md flex-shrink-0 order-1 md:order-2"
      rightPanelClassName={`w-full md:flex-shrink-0 order-2 md:order-3 ${showMomLovePanel ? "md:w-52" : "md:w-44"}`}
      leftPanel={
        <BookingSchedulePanel
          supabase={supabase}
          providerId={providerId}
          supabaseReady={supabaseReady}
          mode="preview"
          initialSlot={previewSlot}
          selectedSlot={previewSlot}
          onSlotChange={onSlotChange}
        />
      }
      rightPanel={
        <div className="space-y-2">
          {showMomLovePanel && (
            <div className="hidden md:block">
              <MomLovePanel />
            </div>
          )}
          <BookingSubtotalPanel
            windowCount={windowCount}
            minWindows={minWindows}
            onWindowCountChange={onWindowCountChange}
          />
          <BookingPricesPanel />
        </div>
      }
      main={children}
    />
  );
}