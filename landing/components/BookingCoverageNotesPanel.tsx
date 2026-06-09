const COVERAGE_NOTES = [
  'Interior may be added during winter and other select holiday periods for same or lesser rate.',
  'More difficult windows can be scheduled, or added on site if time permits, for same or higher rate.',
  'Custom and 3+ level homes and all others, can get a FREE ESTIMATE for the rest of the cleaning, when on site, if desired.',
];

export function BookingCoverageNotesPanel() {
  return (
    <div className="text-left text-[10px] leading-snug text-neutral-700 border border-yellow-200 rounded-xl p-3 bg-yellow-50">
      <ul className="space-y-2 list-disc pl-4">
        {COVERAGE_NOTES.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </div>
  );
}