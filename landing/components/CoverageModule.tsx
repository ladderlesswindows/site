"use client";

import { useState } from "react";
import { getZipInfo, getSuccessZips, coverage } from "./zipRegistry";
import { ZipChecker } from "./ZipChecker";

export default function CoverageModule() {
  const [currentZip, setCurrentZip] = useState("");
  const [forcedSuccess, setForcedSuccess] = useState<string | null>(null);
  const [windowCount, setWindowCount] = useState(1);

  const successZips = getSuccessZips();

  const onZipSelect = (zip: string) => {
    setCurrentZip(zip);
    setForcedSuccess(zip);
  };

  const ZipButton = ({ zip }: { zip: string }) => (
    <button
      onClick={() => onZipSelect(zip)}
      className="text-[9px] leading-none px-0.5 py-0.5 border border-emerald-100 rounded bg-emerald-50 active:bg-emerald-100 text-emerald-700"
      style={{ minWidth: "28px" }}
    >
      {zip}
    </button>
  );

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
    <div className="border border-neutral-200 rounded-3xl p-2">
      {/* top quick zip buttons for this coverage (desktop only; part of the coverage module) */}
      <div className="mb-2 hidden md:block">
        <div className="flex justify-between">
          {successZips.slice(0, 5).map((zip) => (
            <ZipButton key={zip} zip={zip} />
          ))}
        </div>
        <div className="flex justify-between mt-0.5">
          {successZips.slice(5).map((zip) => (
            <ZipButton key={zip} zip={zip} />
          ))}
          <button
            onClick={() => {
              window.location.href = `mailto:${coverage.contactEmail}`;
            }}
            className="text-[9px] leading-none px-0.5 py-0.5 border border-emerald-100 rounded bg-emerald-50 active:bg-emerald-100 text-emerald-700"
            style={{ minWidth: "28px" }}
          >
            email
          </button>
        </div>
      </div>

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
        onClearForced={() => setForcedSuccess(null)} 
        windowCount={windowCount}
        onSetWindowCount={setWindowCount}
      />
    </div>
  );
}
