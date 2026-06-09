type PartialCoverageDetailsBoxProps = {
  details: string;
};

export function PartialCoverageDetailsBox({ details }: PartialCoverageDetailsBoxProps) {
  return (
    <div className="rounded-xl border border-pink-200 bg-pink-50 px-4 py-3 text-left w-full">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-pink-800 mb-1.5">
        Coverage details
      </div>
      <p className="text-sm leading-snug text-pink-900">{details}</p>
    </div>
  );
}