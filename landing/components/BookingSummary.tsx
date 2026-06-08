"use client";

import { useState, useEffect } from "react";

import { getQualifier, DEFAULT_WINDOW_PRICE } from "./qualifiers";

interface BookingSummaryProps {
  zip: string;
  windows: number;
  screenReinstall: boolean;
  onWindowsChange: (n: number) => void;
  onScreenReinstallChange: (b: boolean) => void;
  // For special monthly accounts / qualifiers (e.g. STACEY at $12/window)
  qualifierCode?: string;
  onQualifierChange?: (code: string) => void;
  // Special zero price for 121 34th Ave Capitola
  specialZeroPrice?: boolean;
}

export default function BookingSummary({
  zip,
  windows: windowsProp,
  screenReinstall: screenProp,
  onWindowsChange,
  onScreenReinstallChange,
  qualifierCode,
  onQualifierChange,
  specialZeroPrice = false,
}: BookingSummaryProps) {
  // Summary box with support for qualifiers (special pricing for old monthly accounts like STACEY at $12/window),
  // windows count, screen reinstall fee, and reporting changes up for the 30s booking flow.
  const [windows, setWindows] = useState(windowsProp);
  const [screenReinstall, setScreenReinstall] = useState(screenProp);

  // Local input for typing the qualifier code (e.g. Ladderless5)
  const [inputCode, setInputCode] = useState(qualifierCode || "");

  // Sync input when parent provides qualifierCode (e.g. from URL on /location)
  useEffect(() => {
    setInputCode(qualifierCode || "");
  }, [qualifierCode]);

  const qualifier = getQualifier(qualifierCode);
  let basePricePerWindow = qualifier ? qualifier.pricePerWindow : DEFAULT_WINDOW_PRICE;

  const SCREEN_REINSTALL_FEE_PER_WINDOW = 2;

  if (specialZeroPrice) {
    basePricePerWindow = 0;
  }

  const base = windows * basePricePerWindow;
  const screenFeeTotal = (specialZeroPrice ? false : screenReinstall) ? windows * SCREEN_REINSTALL_FEE_PER_WINDOW : 0;
  const subtotal = base + screenFeeTotal;

  const changeWindows = (delta: number) => {
    const next = Math.max(1, windows + delta);
    setWindows(next);
    onWindowsChange(next);
  };

  const toggleScreen = (checked: boolean) => {
    setScreenReinstall(checked);
    onScreenReinstallChange(checked);
  };

  return (
    <div>
      <div className="border border-neutral-200 rounded-3xl bg-cream p-2">
        <div className="text-sm text-neutral-600 mb-2 px-1">
          For ZIP <span className="font-semibold">{zip}</span>
        </div>

        {/* Window count + screen option (qualifier may override base price) */}
        <div className="mb-3">
          <div className="text-sm text-neutral-600 mb-1">Number of standard windows</div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => changeWindows(-1)}
              className="w-8 h-8 rounded-full border text-lg font-bold active:bg-neutral-100"
            >
              −
            </button>
            <div className="text-2xl font-semibold w-10 text-center">{windows}</div>
            <button
              onClick={() => changeWindows(1)}
              className="w-8 h-8 rounded-full border text-lg font-bold active:bg-neutral-100"
            >
              +
            </button>
          </div>
        </div>

        <div className="text-sm mb-1">Base: {base} (${basePricePerWindow} × {windows})</div>

        <label className="flex items-center gap-2 text-sm mb-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={screenReinstall}
            onChange={(e) => toggleScreen(e.target.checked)}
            className="accent-[#0f766e] w-4 h-4"
          />
          <span>
            Reinstallation of screens by technician{" "}
            <span className="text-emerald-700">(+{SCREEN_REINSTALL_FEE_PER_WINDOW} per window)</span>
          </span>
        </label>

        {/* Qualifier code section for old monthly accounts (poweruser page) */}
        <div className="mb-2">
          <div className="text-[10px] text-neutral-500 mb-0.5">Monthly account qualifier code</div>
          <div className="flex gap-1.5">
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase().slice(0, 12))}
              placeholder="e.g. Ladderless5"
              className="flex-1 border border-neutral-300 rounded px-2 py-1 text-sm"
            />
            <button
              onClick={() => {
                const code = inputCode.trim();
                onQualifierChange?.(code);
              }}
              className="px-3 py-1 text-xs bg-neutral-900 text-white rounded active:bg-black"
            >
              Apply
            </button>
          </div>
          {qualifier && (
            <div className="text-[10px] text-emerald-700 mt-1">
              {qualifier.displayName || qualifier.code} active — ${qualifier.pricePerWindow}/window
              <button
                onClick={() => onQualifierChange?.("")}
                className="ml-2 underline"
              >
                clear
              </button>
            </div>
          )}
        </div>

        <div className="font-semibold text-base mb-2 flex justify-between">
          <span>Subtotal</span>
          <span>${subtotal}</span>
        </div>

        {!screenReinstall && (
          <div className="text-[11px] leading-tight text-neutral-600 bg-cream border border-neutral-200 rounded-xl p-3">
            I will remove the screens myself and have them ready for the cleaner outside, then I will replace them after the free cleaning. (Also, please note, our tech can give you a free lesson to remove them yourself next time, to save this handling fee, <span className="text-red-600">most screens have hiddens springs that need to be compressed before attempting to remove them or they will be damaged</span>)
          </div>
        )}
      </div>
    </div>
  );
}
