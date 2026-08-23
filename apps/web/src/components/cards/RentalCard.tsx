import { useLocale, useTranslations } from "next-intl";
import { MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { findCategory } from "@allopuno/data";
import { Card } from "@/components/ui/Card";
import { RatingStars } from "@/components/ui/RatingStars";
import { CategoryIcon } from "@/components/CategoryIcon";
import { Photo } from "@/components/ui/Photo";
import { categoryPhoto } from "@/lib/media";
import { cityName, localized } from "@/lib/format";
import type { DemoRental } from "@/lib/demo";

export function RentalCard({ rental }: { rental: DemoRental }) {
  const locale = useLocale();
  const t = useTranslations("common");
  const category = findCategory(rental.categorySlug);
  const title = localized(rental.title, locale);

  return (
    <Card className="group overflow-hidden transition-shadow duration-200 hover:shadow-(--shadow-pop)">
      <Link href={`/qira/${rental.id}`} className="flex h-full flex-col">
        <div className="relative">
          <Photo
            src={categoryPhoto(rental.categorySlug)}
            alt={title}
            overlay
            className="aspect-[4/3] w-full"
            fallback={category && <CategoryIcon name={category.icon} className="size-10 text-brand-300" />}
          />
          {/* Prix/jour en surimpression — hiérarchie forte, lisible photo ou dégradé */}
          <span className="absolute bottom-2.5 left-2.5 inline-flex items-center rounded-full bg-card/95 px-2.5 py-1 text-sm font-bold text-brand-700 shadow-(--shadow-card) backdrop-blur">
            {t("meta.perDay", { price: rental.pricePerDay })}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-1.5 p-4">
          <p className="line-clamp-2 font-display font-semibold leading-snug">{title}</p>
          <p className="flex items-center gap-1 text-xs text-muted">
            <MapPin className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate">
              {cityName(rental.citySlug, locale)} · {t("meta.distanceKm", { km: rental.distanceKm })}
            </span>
          </p>
          <div className="mt-auto flex items-center gap-2 pt-1.5">
            {rental.rating != null && <RatingStars rating={rental.rating} count={rental.ratingCount} />}
            {rental.year && <span className="ml-auto text-xs text-faint tabular-nums">{rental.year}</span>}
          </div>
        </div>
      </Link>
    </Card>
  );
}
