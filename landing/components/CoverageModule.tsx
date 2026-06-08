"use client";

import { useState, useEffect } from "react";
import { getZipInfo, coverage } from "./zipRegistry";
import { ZipChecker } from "./ZipChecker";

type CoverageModuleProps = {
  forcedSuccess?: string | null;
  onClearForced?: () => void;
};

export default function CoverageModule({
  forcedSuccess = null,
  onClearForced,
}: CoverageModuleProps) {
  const [currentZip, setCurrentZip] = useState("");
  const [windowCount, setWindowCount] = useState(1);

  useEffect(() => {
    if (forcedSuccess) {
      setCurrentZip(forcedSuccess);
    }
  }, [forcedSuccess]);

  let mapSrc: string;
  let mapAlt: string;
  if (!currentZip) {
    mapSrc = coverage.defaultMapSrc;
    mapAlt = coverage.defaultMapAlt;
  } else {
    const info = getZipInfo(currentZip);
    if (info) {
      mapSrc = `/${currentZip}-map.jpg`;
      const coverageLabel = info.coverage === "partial" ? "partially covered" : "fully covered";
      mapAlt = `${currentZip} ${info.city}, CA ${coverageLabel}`;
    } else {
      mapSrc = "/templatenotcovered.jpg";
      mapAlt = "Not yet covered, Coming soon!";
    }
  }

  return (
    <div className="border border-neutral-200 rounded-3xl bg-cream p-2">
      {/* the map (inside coverage frame) */}
      <img
        src={mapSrc}
        alt={mapAlt}
        className="w-full h-auto mb-6 rounded-3xl"
      />

      {/* the checker (no extra border; the outer coverage frame provides the module box) */}
      <ZipChecker 
        onZipChange={setCurrentZip} 
        forcedSuccess={forcedSuccess} 
        onClearForced={onClearForced} 
        windowCount={windowCount}
        onSetWindowCount={setWindowCount}
      />
    </div>
  );
}
