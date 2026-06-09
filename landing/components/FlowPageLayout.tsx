import { ReactNode } from "react";

type FlowPageLayoutProps = {
  main: ReactNode;
  rightPanel?: ReactNode;
  leftPanel?: ReactNode;
  containerClassName?: string;
  leftPanelClassName?: string;
  mainClassName?: string;
  rightPanelClassName?: string;
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
  containerClassName = DEFAULT_CONTAINER,
  leftPanelClassName = DEFAULT_LEFT_PANEL,
  mainClassName = DEFAULT_MAIN,
  rightPanelClassName = DEFAULT_RIGHT_PANEL,
}: FlowPageLayoutProps) {
  return (
    <div className={containerClassName}>
      <div className="flex flex-col items-center gap-3 md:flex-row md:items-start md:justify-center">
        {leftPanel && <aside className={leftPanelClassName}>{leftPanel}</aside>}

        <div className={mainClassName}>{main}</div>

        {rightPanel && <aside className={rightPanelClassName}>{rightPanel}</aside>}
      </div>
    </div>
  );
}