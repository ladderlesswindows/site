"use client";

import { useState } from "react";
import { getZipInfo } from "./zipRegistry";
import { getZipTemplateImageSrc } from "@/lib/zipTemplateImage";

type ZipTerritoryImageModuleProps = {
  zip: string;
};

/** Cream-bordered territory photo shown below the booking success module. */
export function ZipTerritoryImageModule({ zip }: ZipTerritoryImageModuleProps) {
  const src = getZipTemplateImageSrc(zip);
  const [hidden, setHidden] = useState(false);

  if (!src || hidden) return null;

  const city = getZipInfo(zip)?.city;

  return (
    <div className="cream-module overflow-hidden">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.25rem] bg-neutral-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={city ? `${city} service area` : "Your service area"}
          className="h-full w-full object-cover"
          onError={() => setHidden(true)}
        />
      </div>
    </div>
  );
}