"use client";

import { useState } from "react";
import { calculateWindowBase } from "./windowPricing";
import { DEFAULT_WINDOW_PRICE } from "./qualifiers";

interface QualifierProps {
  zip: string;
  windowCount: number;
  onComplete: () => void;
}

export function Qualifier({ zip, windowCount, onComplete }: QualifierProps) {
  const [step, setStep] = useState(0);

  // First qualifier question as provided by user
  const question1 = `Please Answer: I have windows with easy access in front for a man with a long pole, that are less than 5' x 5' or cover 25 sq ft, and I will be home to allow the technician to come in and take out second floor screens before the service and replace them, clean, after the service (or I will pop them out for him to clean, and pop them back, saving $1 per window), and I am ready to proceed NOW with 30 second booking.`;

  if (step === 0) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-neutral-600">
          For ZIP <span className="font-semibold">{zip}</span> • {windowCount} window{windowCount > 1 ? 's' : ''} (est. ${calculateWindowBase(windowCount, DEFAULT_WINDOW_PRICE)})
        </div>

        <div className="text-base font-medium leading-snug">
          {question1}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onComplete}
            className="flex-1 py-4 text-lg font-semibold rounded-3xl bg-[#0f766e] text-white active:bg-[#0c5f58]"
          >
            Yes
          </button>
          <button
            onClick={() => setStep(1)}
            className="flex-1 py-4 text-lg font-semibold rounded-3xl border-2 border-neutral-950 active:bg-neutral-100"
          >
            No
          </button>
        </div>

        <p className="text-[10px] text-neutral-500 text-center">
          This helps us offer the fastest 30-second booking for standard jobs.
        </p>
      </div>
    );
  }

  // NO path - more questions stub
  return (
    <div className="space-y-4">
      <div className="text-sm text-neutral-600">
        For ZIP <span className="font-semibold">{zip}</span> • {windowCount} window{windowCount > 1 ? 's' : ''} (est. ${calculateWindowBase(windowCount, DEFAULT_WINDOW_PRICE)})
      </div>

      <div>
        <p className="font-medium">Thank you.</p>
        <p className="text-sm text-neutral-700 mt-2">
          Your job doesn't match the standard easy-access criteria for our fastest 30-second booking path. 
          We can still provide excellent service — we'll collect a few more details and get you a custom quote or schedule.
        </p>
      </div>

      <button
        onClick={onComplete}
        className="w-full py-4 text-lg font-semibold rounded-3xl bg-[#0f766e] text-white active:bg-[#0c5f58]"
      >
        Continue to Address for Custom Quote
      </button>

      <button
        onClick={() => setStep(0)}
        className="w-full text-sm text-neutral-500 py-2"
      >
        ← Back to first question
      </button>
    </div>
  );
}
