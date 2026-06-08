import { WINDOW_QUALIFIER_DISCLAIMER } from "./windowPricing";

type WindowQualifierDisclaimerProps = {
  className?: string;
};

export function WindowQualifierDisclaimer({ className = "" }: WindowQualifierDisclaimerProps) {
  return (
    <div
      className={`text-left text-[10px] leading-snug text-neutral-500 border border-neutral-200 rounded-xl p-3 bg-cream ${className}`}
    >
      {WINDOW_QUALIFIER_DISCLAIMER}
    </div>
  );
}