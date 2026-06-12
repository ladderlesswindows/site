// Simple className merger (inspired by clsx + tailwind-merge pattern, lightweight version)
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(" ");
}
