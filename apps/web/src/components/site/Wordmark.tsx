import { cn } from "@/lib/cn";

/**
 * Logotype AlloPuno. `mark` ajoute une tuile de marque devant le mot ;
 * `tone="inverse"` bascule sur fond sombre (texte blanc, O éclairci).
 */
export function Wordmark({
  className,
  mark = false,
  tone = "default"
}: {
  className?: string;
  mark?: boolean;
  tone?: "default" | "inverse";
}) {
  const inverse = tone === "inverse";
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      {mark && (
        <span
          aria-hidden
          className={cn(
            "inline-flex size-8 items-center justify-center rounded-xl font-display text-sm font-extrabold shadow-(--shadow-brand)",
            inverse ? "bg-white text-brand-700" : "bg-brand-gradient text-white"
          )}
        >
          A
        </span>
      )}
      <span
        className={cn(
          "font-display text-lg font-extrabold tracking-[0.08em]",
          inverse ? "text-white" : "text-ink"
        )}
      >
        ALL<span className={inverse ? "text-brand-200" : "text-brand-600"}>O</span>PUNO
      </span>
    </span>
  );
}
