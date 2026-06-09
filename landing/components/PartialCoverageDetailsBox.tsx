type PartialCoverageDetailsBoxProps = {
  details: string;
};

export function PartialCoverageDetailsBox({ details }: PartialCoverageDetailsBoxProps) {
  return (
    <div className="rounded-xl border border-rose-100 bg-rose-50/30 px-4 py-3 text-left w-full">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-neutral-600 mb-1.5">
        Coverage details
      </div>
      <p className="text-sm leading-snug text-neutral-900">{details}</p>
    </div>
  );
}