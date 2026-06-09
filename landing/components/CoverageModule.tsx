"use client";

import { useState } from "react";
import { ZipChecker } from "./ZipChecker";

/** Home coverage checker — ZIP success lives on /booking, not inline */
export default function CoverageModule() {
  const [windowCount, setWindowCount] = useState(1);

  return (
    <div className="cream-module">
      <h2 className="text-sm font-semibold tracking-wide text-neutral-700 mb-4 text-center">
        Check if we serve your area
      </h2>

      <ZipChecker windowCount={windowCount} onSetWindowCount={setWindowCount} />
    </div>
  );
}