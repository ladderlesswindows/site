"use client";

import { useEffect, useState } from "react";
import { FlowPageLayout } from "@/components/FlowPageLayout";
import { HomeBrandingChrome } from "./HomeBrandingChrome";
import { ZipChecker } from "./ZipChecker";
import { HomeWindowTallyPanel } from "./HomeWindowTallyPanel";
import { HomeWindowExampleSlideshow } from "./HomeWindowExampleSlideshow";
import { HomeReviewsPanel } from "./HomeReviewsPanel";
import { getMinWindows, getZipInfo } from "./zipRegistry";

type CoverageModuleProps = {
  onOpenVideo: () => void;
};

/** Home — three columns: left (future images), branding+ZIP center, tally right */
export default function CoverageModule({ onOpenVideo }: CoverageModuleProps) {
  const [windowCount, setWindowCount] = useState(1);
  const [draftZip, setDraftZip] = useState("");

  const zipInfo = getZipInfo(draftZip);
  const minWindows = zipInfo ? getMinWindows(draftZip) : 1;

  useEffect(() => {
    if (!zipInfo) return;
    setWindowCount((count) => Math.max(count, minWindows));
  }, [draftZip, minWindows, zipInfo]);

  const panelTop = "w-full md:self-stretch";
  const exampleSlideshow = (
    <HomeWindowExampleSlideshow windowCount={windowCount} plainSurface />
  );

  return (
    <FlowPageLayout
      containerClassName="mx-auto w-full max-w-5xl"
      stretchSidePanels
      leftPanelClassName={`hidden md:block md:w-44 md:flex-shrink-0 md:order-1 ${panelTop}`}
      mainClassName={`max-w-md flex-shrink-0 order-1 md:order-2 md:self-start ${panelTop}`}
      rightPanelClassName={`md:w-44 md:flex-shrink-0 order-2 md:order-3 ${panelTop}`}
      mobileBottomPanel={exampleSlideshow}
      leftPanel={<HomeReviewsPanel />}
      main={
        <div className="cream-module">
          <HomeBrandingChrome onOpenVideo={onOpenVideo} />

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
        <div className="flex h-full flex-col">
          <HomeWindowTallyPanel
            windowCount={windowCount}
            minWindows={minWindows}
            onWindowCountChange={setWindowCount}
          />
          <div className="hidden md:block">{exampleSlideshow}</div>
        </div>
      }
    />
  );
}