import { useLocale, useTranslations } from "next-intl";
import { MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { findCategory } from "@allopuno/data";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { RatingStars } from "@/components/ui/RatingStars";
import { CategoryIcon } from "@/components/CategoryIcon";
import { cityName, localized } from "@/lib/format";
import type { DemoRental } from "@/lib/demo";

export function RentalCard({ rental }: { rental: DemoRental }) {
  const locale = useLocale();
  const t = useTranslations("common");
  const category = findCategory(rental.categorySlug);

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-(--shadow-pop)">
      <Link href={`/qira/${rental.id}`} className="flex h-full flex-col">
        <div className="flex h-28 items-center justify-center bg-gradient-to-br from-brand-50 to-wash">
          {category && <CategoryIcon name={category.icon} className="size-10 text-brand-300" />}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <p className="line-clamp-2 font-display font-semibold leading-snug">
            {localized(rental.title, locale)}
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" aria-hidden />
              {cityName(rental.citySlug, locale)} · {t("meta.distanceKm", { km: rental.distanceKm })}
            </span>
            {rental.rating != null && <RatingStars rating={rental.rating} count={rental.ratingCount} />}
          </div>
          <div className="mt-auto flex items-center justify-between">
            <Badge tone="brand" className="text-sm font-semibold">
              {t("meta.perDay", { price: rental.pricePerDay })}
            </Badge>
            {rental.year && <span className="text-xs text-faint tabular-nums">{rental.year}</span>}
          </div>
        </div>
      </Link>
    </Card>
  );
}
