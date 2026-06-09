"use client";

import { useEffect, useState } from "react";
import { ZipChecker } from "./ZipChecker";
import { HomeWindowTallyPanel } from "./HomeWindowTallyPanel";
import { getMinWindows, getZipInfo } from "./zipRegistry";

/** Home coverage checker — ZIP success lives on /booking, not inline */
export default function CoverageModule() {
  const [windowCount, setWindowCount] = useState(1);
  const [draftZip, setDraftZip] = useState("");

  const zipInfo = getZipInfo(draftZip);
  const minWindows = zipInfo ? getMinWindows(draftZip) : 1;

  useEffect(() => {
    if (!zipInfo) return;
    setWindowCount((count) => Math.max(count, minWindows));
  }, [draftZip, minWindows, zipInfo]);

  return (
    <div className="cream-module">
      <h2 className="text-sm font-semibold tracking-wide text-neutral-700 mb-4 text-center">
        Check if we serve your area
      </h2>

      <ZipChecker
        windowCount={windowCount}
        onSetWindowCount={setWindowCount}
        onZipChange={setDraftZip}
      />

      <HomeWindowTallyPanel
        windowCount={windowCount}
        minWindows={minWindows}
        onWindowCountChange={setWindowCount}
      />
    </div>
  );
}