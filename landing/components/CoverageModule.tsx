"use client";

import { useState, useEffect } from "react";
import { ZipChecker } from "./ZipChecker";
import { getMinWindows } from "./zipRegistry";

type CoverageModuleProps = {
  forcedSuccess?: string | null;
  onClearForced?: () => void;
};

export default function CoverageModule({
  forcedSuccess = null,
  onClearForced,
}: CoverageModuleProps) {
  const [windowCount, setWindowCount] = useState(1);

  useEffect(() => {
    if (forcedSuccess) {
      setWindowCount(getMinWindows(forcedSuccess));
    }
  }, [forcedSuccess]);

  return (
    <div className="border border-neutral-200 rounded-3xl bg-cream p-2">
      <h2 className="text-sm font-semibold tracking-wide text-neutral-700 mb-4 text-center">
        Check if we serve your area
      </h2>

      <ZipChecker
        forcedSuccess={forcedSuccess}
        onClearForced={onClearForced}
        windowCount={windowCount}
        onSetWindowCount={setWindowCount}
      />
    </div>
  );
}