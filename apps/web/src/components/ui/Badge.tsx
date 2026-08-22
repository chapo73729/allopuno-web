import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "brand" | "neutral" | "success" | "warning" | "danger";

const tones: Record<Tone, string> = {
  brand: "bg-brand-50 text-brand-700",
  neutral: "bg-wash text-muted",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger"
};

export function Badge({
  tone = "neutral",
  className,
  children
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium leading-5",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
