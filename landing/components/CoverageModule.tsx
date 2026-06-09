"use client";

import { useState, useEffect } from "react";
import { ZipChecker } from "./ZipChecker";
import { getMinWindows } from "./zipRegistry";

type CoverageModuleProps = {
  forcedSuccess?: string | null;
  onClearForced?: () => void;
  onSuccessChange?: (isSuccess: boolean) => void;
  /** Home quick-ZIP buttons — swap coverage in place */
  onZipSelect?: (zip: string) => void;
};

export default function CoverageModule({
  forcedSuccess = null,
  onClearForced,
  onSuccessChange,
  onZipSelect,
}: CoverageModuleProps) {
  const [windowCount, setWindowCount] = useState(1);
  const [coverageSuccess, setCoverageSuccess] = useState(Boolean(forcedSuccess));

  useEffect(() => {
    if (forcedSuccess) {
      setWindowCount(getMinWindows(forcedSuccess));
      setCoverageSuccess(true);
      onSuccessChange?.(true);
    }
  }, [forcedSuccess, onSuccessChange]);

  const handleSuccessChange = (next: boolean) => {
    setCoverageSuccess(next);
    onSuccessChange?.(next);
  };

  return (
    <div
      className={
        coverageSuccess
          ? "w-full"
          : "cream-module"
      }
    >
      {!coverageSuccess && (
        <h2 className="text-sm font-semibold tracking-wide text-neutral-700 mb-4 text-center">
          Check if we serve your area
        </h2>
      )}

      <ZipChecker
        forcedSuccess={forcedSuccess}
        onClearForced={onClearForced}
        windowCount={windowCount}
        onSetWindowCount={setWindowCount}
        onSuccessChange={handleSuccessChange}
        onZipSelect={onZipSelect}
      />
    </div>
  );
}