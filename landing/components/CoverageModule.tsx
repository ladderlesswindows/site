"use client";

import { useEffect, useState } from "react";
import { FlowPageLayout } from "@/components/FlowPageLayout";
import { ZipChecker } from "./ZipChecker";
import { HomeWindowTallyPanel } from "./HomeWindowTallyPanel";
import { getMinWindows, getZipInfo } from "./zipRegistry";

/** Home coverage — same three-column shell as /booking (left reserved for images) */
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
    <FlowPageLayout
      containerClassName="mx-auto w-full max-w-5xl"
      leftPanelClassName="hidden md:block md:w-60 md:flex-shrink-0 md:order-1"
      mainClassName="w-full max-w-md flex-shrink-0 order-1 md:order-2"
      rightPanelClassName="w-full md:w-44 md:flex-shrink-0 order-2 md:order-3"
      leftPanel={<div aria-hidden className="hidden md:block" />}
      main={
        <div className="cream-module">
          <h2 className="text-sm font-semibold tracking-wide text-neutral-700 mb-4 text-center">
            Check if we serve your area
          </h2>

          <ZipChecker
            windowCount={windowCount}
            onSetWindowCount={setWindowCount}
            onZipChange={setDraftZip}
          />
        </div>
      }
      rightPanel={
        <HomeWindowTallyPanel
          windowCount={windowCount}
          minWindows={minWindows}
          onWindowCountChange={setWindowCount}
        />
      }
    />
  );
}