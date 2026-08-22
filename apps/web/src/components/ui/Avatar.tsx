import { cn } from "@/lib/cn";

const palettes = [
  "bg-brand-100 text-brand-800",
  "bg-success-soft text-success",
  "bg-warning-soft text-warning",
  "bg-brand-600 text-white",
  "bg-wash text-muted"
];

export function Avatar({
  name,
  size = "md",
  className
}: {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
  const palette = palettes[Math.abs([...name].reduce((h, c) => h + c.charCodeAt(0), 0)) % palettes.length];
  const sizes = {
    sm: "size-8 text-xs",
    md: "size-10 text-sm",
    lg: "size-14 text-lg",
    xl: "size-20 text-2xl"
  } as const;
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-display font-semibold",
        sizes[size],
        palette,
        className
      )}
    >
      {initials}
    </span>
  );
}
