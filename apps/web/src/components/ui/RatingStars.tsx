import { Star } from "lucide-react";
import { cn } from "@/lib/cn";

export function RatingStars({
  rating,
  count,
  className
}: {
  rating: number;
  count?: number;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <Star className="size-4 fill-warning text-warning" aria-hidden />
      <span className="text-sm font-semibold tabular-nums">{rating.toFixed(1)}</span>
      {typeof count === "number" && (
        <span className="text-sm text-faint tabular-nums">({count})</span>
      )}
    </span>
  );
}
