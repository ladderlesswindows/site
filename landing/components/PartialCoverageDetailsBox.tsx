type PartialCoverageDetailsBoxProps = {
  details: string;
};

export function PartialCoverageDetailsBox({ details }: PartialCoverageDetailsBoxProps) {
  return (
    <div className="rounded-xl border border-pink-100 bg-pink-50/50 px-4 py-3 text-left w-full">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-rose-700 mb-1.5">
        Coverage details
      </div>
      <p className="text-sm leading-snug text-neutral-900">{details}</p>
    </div>
  );
}