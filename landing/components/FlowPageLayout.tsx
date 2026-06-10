import { ReactNode } from "react";

type FlowPageLayoutProps = {
  main: ReactNode;
  rightPanel?: ReactNode;
  leftPanel?: ReactNode;
  /** Renders below all columns on mobile only (e.g. example slideshow). */
  mobileBottomPanel?: ReactNode;
  containerClassName?: string;
  leftPanelClassName?: string;
  mainClassName?: string;
  rightPanelClassName?: string;
  /** Stretch side columns to the tallest column height on md+ (home reviews column). */
  stretchSidePanels?: boolean;
};

const DEFAULT_CONTAINER = "mx-auto w-full max-w-3xl";
const DEFAULT_LEFT_PANEL = "w-full md:w-44 md:flex-shrink-0 order-2 md:order-1";
const DEFAULT_MAIN = "w-full max-w-md flex-shrink-0 order-1 md:order-2";
const DEFAULT_RIGHT_PANEL = "w-full md:w-44 md:flex-shrink-0 order-3";

/** App-style row layout: optional side panels flanking the main phone-width module */
export function FlowPageLayout({
  main,
  rightPanel,
  leftPanel,
  mobileBottomPanel,
  containerClassName = DEFAULT_CONTAINER,
  leftPanelClassName = DEFAULT_LEFT_PANEL,
  mainClassName = DEFAULT_MAIN,
  rightPanelClassName = DEFAULT_RIGHT_PANEL,
  stretchSidePanels = false,
}: FlowPageLayoutProps) {
  return (
    <div className={containerClassName}>
      <div
        className={`flex flex-col items-center gap-3 md:flex-row md:justify-center ${
          stretchSidePanels ? "md:items-stretch" : "md:items-start"
        }`}
      >
        {leftPanel && <aside className={leftPanelClassName}>{leftPanel}</aside>}

        <div className={mainClassName}>{main}</div>

        {rightPanel && <aside className={rightPanelClassName}>{rightPanel}</aside>}

        {mobileBottomPanel && (
          <aside className="w-full max-w-md order-last md:hidden">{mobileBottomPanel}</aside>
        )}
      </div>
    </div>
  );
}