"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";
import { buildBookingSearchParams } from "@/components/bookingFlowParams";
import { FlowFooter } from "@/components/FlowFooter";

/** Legacy route — custom quote flow removed; send everyone to canonical booking */
function LocationRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const flow = searchParams.get("flow") || "";
    const params = buildBookingSearchParams({
      zip: searchParams.get("zip") || "95060",
      windows: parseInt(searchParams.get("windows") || "1", 10) || 1,
      qualifier: searchParams.get("qualifier") || "",
      flow: flow === "30s" ? "30s" : undefined,
    });
    router.replace(`/booking?${params}`);
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center text-sm text-neutral-500">
        Redirecting…
      </div>
      <FlowFooter />
    </div>
  );
}

export default function LocationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">Loading…</div>
      }
    >
      <LocationRedirect />
    </Suspense>
  );
}