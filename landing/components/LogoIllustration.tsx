interface LogoIllustrationProps {
  className?: string;
}

export function LogoIllustration({ className = "" }: LogoIllustrationProps) {
  return (
    <svg
      viewBox="0 0 560 215"
      className={className}
      aria-hidden="true"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Ground / pavement line */}
      <line x1="20" y1="195" x2="540" y2="195" stroke="#333" strokeWidth="1.5" />

      {/* === SERVICE VAN (right side, clean modern) === */}
      {/* Van body */}
      <rect x="385" y="142" width="118" height="52" rx="6" fill="#1f2937" stroke="#111" strokeWidth="2" />
      {/* Van roof / upper section */}
      <rect x="403" y="128" width="82" height="18" rx="4" fill="#374151" stroke="#111" strokeWidth="1.5" />
      {/* Front windshield area */}
      <rect x="480" y="132" width="18" height="12" rx="2" fill="#64748b" stroke="#111" strokeWidth="1" />
      {/* Side window */}
      <rect x="420" y="134" width="28" height="10" rx="1" fill="#64748b" stroke="#111" strokeWidth="0.75" />
      {/* Rear door line */}
      <line x1="403" y1="142" x2="403" y2="194" stroke="#111" strokeWidth="1.5" />
      {/* Wheels */}
      <circle cx="415" cy="196" r="11" fill="#111" />
      <circle cx="465" cy="196" r="11" fill="#111" />
      <circle cx="415" cy="196" r="5.5" fill="#4b5563" />
      <circle cx="465" cy="196" r="5.5" fill="#4b5563" />
      {/* Subtle highlight on van body */}
      <rect x="390" y="145" width="35" height="3" rx="1" fill="#4b5563" opacity="0.6" />

      {/* === TALL SKYSCRAPER (left-center) === */}
      {/* Main tower body */}
      <rect x="68" y="28" width="118" height="166" rx="3" fill="#1a1a1a" stroke="#0a0a0a" strokeWidth="2.5" />
      {/* Roof cap */}
      <rect x="63" y="22" width="128" height="10" rx="2" fill="#111" stroke="#0a0a0a" strokeWidth="1.5" />

      {/* Window grid - 5 columns, 8 rows for premium density */}
      <g fill="#4b5563" stroke="#111" strokeWidth="0.6">
        {/* Row 1 */}
        <rect x="78" y="40" width="16" height="11" rx="1" />
        <rect x="101" y="40" width="16" height="11" rx="1" />
        <rect x="124" y="40" width="16" height="11" rx="1" />
        <rect x="147" y="40" width="16" height="11" rx="1" />
        {/* Row 2 */}
        <rect x="78" y="58" width="16" height="11" rx="1" />
        <rect x="101" y="58" width="16" height="11" rx="1" />
        <rect x="124" y="58" width="16" height="11" rx="1" />
        <rect x="147" y="58" width="16" height="11" rx="1" />
        {/* Row 3 */}
        <rect x="78" y="76" width="16" height="11" rx="1" />
        <rect x="101" y="76" width="16" height="11" rx="1" />
        <rect x="124" y="76" width="16" height="11" rx="1" />
        <rect x="147" y="76" width="16" height="11" rx="1" />
        {/* Row 4 */}
        <rect x="78" y="94" width="16" height="11" rx="1" />
        <rect x="101" y="94" width="16" height="11" rx="1" />
        <rect x="124" y="94" width="16" height="11" rx="1" />
        <rect x="147" y="94" width="16" height="11" rx="1" />
        {/* Row 5 */}
        <rect x="78" y="112" width="16" height="11" rx="1" />
        <rect x="101" y="112" width="16" height="11" rx="1" />
        <rect x="124" y="112" width="16" height="11" rx="1" />
        <rect x="147" y="112" width="16" height="11" rx="1" />
        {/* Row 6 */}
        <rect x="78" y="130" width="16" height="11" rx="1" />
        <rect x="101" y="130" width="16" height="11" rx="1" />
        <rect x="124" y="130" width="16" height="11" rx="1" />
        <rect x="147" y="130" width="16" height="11" rx="1" />
        {/* Row 7 */}
        <rect x="78" y="148" width="16" height="11" rx="1" />
        <rect x="101" y="148" width="16" height="11" rx="1" />
        <rect x="124" y="148" width="16" height="11" rx="1" />
        <rect x="147" y="148" width="16" height="11" rx="1" />
        {/* Row 8 - top floor */}
        <rect x="78" y="166" width="16" height="11" rx="1" />
        <rect x="101" y="166" width="16" height="11" rx="1" />
        <rect x="124" y="166" width="16" height="11" rx="1" />
        <rect x="147" y="166" width="16" height="11" rx="1" />
      </g>

      {/* Subtle vertical architectural lines */}
      <line x1="96" y1="28" x2="96" y2="194" stroke="#333" strokeWidth="0.8" />
      <line x1="142" y1="28" x2="142" y2="194" stroke="#333" strokeWidth="0.8" />

      {/* === TECHNICIAN + LONG EXTENSION POLE === */}
      {/* Pole - long carbon fiber extension (thin, premium, reaching high) */}
      <line 
        x1="280" y1="188" 
        x2="172" y2="48" 
        stroke="#1f2937" 
        strokeWidth="4.5" 
        strokeLinecap="round" 
      />
      {/* Pole highlight / carbon fiber texture lines */}
      <line 
        x1="278" y1="186" 
        x2="174" y2="50" 
        stroke="#4b5563" 
        strokeWidth="1.25" 
        strokeLinecap="round" 
      />
      {/* Pole joints / segments (premium detail) */}
      <circle cx="242" cy="138" r="2.2" fill="#374151" />
      <circle cx="208" cy="95" r="2.2" fill="#374151" />

      {/* Squeegee head at top of pole (cleaning the high window) */}
      <g>
        {/* Squeegee blade holder */}
        <rect x="155" y="42" width="22" height="7" rx="1.5" fill="#374151" stroke="#111" strokeWidth="1" />
        {/* Rubber blade */}
        <rect x="152" y="40" width="28" height="3.5" rx="1" fill="#1f2937" />
        {/* Blade edge highlight */}
        <rect x="153" y="40" width="26" height="1.2" rx="0.5" fill="#64748b" />
      </g>

      {/* Technician figure (minimalist, professional, confident) */}
      {/* Torso / jacket */}
      <rect x="272" y="155" width="22" height="28" rx="4" fill="#1f2937" stroke="#111" strokeWidth="1.25" />
      {/* Head + hard hat */}
      <circle cx="284" cy="149" r="7.5" fill="#374151" stroke="#111" strokeWidth="1.25" />
      <ellipse cx="284" cy="144" rx="7.8" ry="3.5" fill="#1f2937" stroke="#111" strokeWidth="1" />
      {/* Arm reaching up to hold pole (extended) */}
      <line x1="280" y1="160" x2="257" y2="108" stroke="#1f2937" strokeWidth="4.5" strokeLinecap="round" />
      {/* Hand grip on pole */}
      <circle cx="255" cy="105" r="3.8" fill="#111" />
      {/* Leg / stance */}
      <line x1="279" y1="183" x2="272" y2="194" stroke="#1f2937" strokeWidth="4" strokeLinecap="round" />
      <line x1="287" y1="183" x2="295" y2="194" stroke="#1f2937" strokeWidth="4" strokeLinecap="round" />

      {/* Subtle building reflection on glass (premium touch) */}
      <rect x="78" y="40" width="85" height="137" fill="url(#glassGrad)" opacity="0.15" />

      {/* Gradient definition */}
      <defs>
        <linearGradient id="glassGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#111" stopOpacity="0.3" />
        </linearGradient>
      </defs>
    </svg>
  );
}
