import { cn } from "@/lib/cn";

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-display text-lg font-extrabold tracking-[0.08em] text-ink", className)}>
      ALL<span className="text-brand-600">O</span>PUNO
    </span>
  );
}
