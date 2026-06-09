import { ReactNode } from "react";

type FlowPageLayoutProps = {
  main: ReactNode;
  rightPanel?: ReactNode;
  leftPanel?: ReactNode;
};

/** App-style row layout: optional side panels flanking the main phone-width module */
export function FlowPageLayout({ main, rightPanel, leftPanel }: FlowPageLayoutProps) {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="flex flex-col items-center gap-3 md:flex-row md:items-start md:justify-center">
        {leftPanel && (
          <aside className="w-full md:w-40 md:flex-shrink-0 order-2 md:order-1">
            {leftPanel}
          </aside>
        )}

        <div className="w-full max-w-md flex-shrink-0 order-1 md:order-2">
          {main}
        </div>

        {rightPanel && (
          <aside className="w-full md:w-44 md:flex-shrink-0 order-3">
            {rightPanel}
          </aside>
        )}
      </div>
    </div>
  );
}