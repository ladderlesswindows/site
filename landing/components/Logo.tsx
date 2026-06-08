import { LogoIllustration } from "./LogoIllustration";

interface LogoProps {
  className?: string;
  variant?: "default" | "compact";
}

export function Logo({ className = "", variant = "default" }: LogoProps) {
  const isCompact = variant === "compact";

  const borderClasses = isCompact
    ? "border border-neutral-200 rounded-2xl p-4"
    : "border-[1.75px] border-neutral-950 rounded-3xl p-6 md:p-8";

  const wordmarkClasses = isCompact
    ? "text-[15px] font-extrabold tracking-[-1.1px]"
    : "text-2xl md:text-[27px] font-extrabold tracking-[-1.65px]";

  return (
    <div
      className={`bg-white ${borderClasses} ${className}`}
      role="img"
      aria-label="Ladderless Windows logo"
    >
      {/* Premium standalone wordmark */}
      <div className="text-center">
        <div className={`${wordmarkClasses} text-black select-none`}>
          LADDERLESS WINDOWS
        </div>
        {/* Fine architectural accent line */}
        <div className="mx-auto mt-1.5 h-px w-12 bg-neutral-950" />
      </div>

      {/* Illustration — scaled and spaced to sit beautifully inside the border */}
      <div className={isCompact ? "mt-3" : "mt-5"}>
        <LogoIllustration
          className={isCompact ? "w-full max-w-[260px] mx-auto" : "w-full max-w-[480px] mx-auto"}
        />
      </div>
    </div>
  );
}
