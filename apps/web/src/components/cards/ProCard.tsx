import { useLocale, useTranslations } from "next-intl";
import { BadgeCheck, MapPin, Zap } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { RatingStars } from "@/components/ui/RatingStars";
import { cityName, localized } from "@/lib/format";
import type { DemoPro } from "@/lib/demo";

export function ProCard({ pro }: { pro: DemoPro }) {
  const locale = useLocale();
  const t = useTranslations("common");

  return (
    <Card className="transition-shadow hover:shadow-(--shadow-pop)">
      <Link href={`/profesionisti/${pro.id}`} className="flex flex-col gap-3 p-4">
        <div className="flex items-start gap-3">
          <Avatar name={pro.name} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 font-display font-semibold leading-tight">
              <span className="truncate">{pro.name}</span>
              {(pro.verified.includes("identity") || pro.verified.includes("business")) && (
                <BadgeCheck
                  role="img"
                  className="size-4 shrink-0 text-brand-600"
                  aria-label={t("badges.identityVerified")}
                />
              )}
            </p>
            <p className="mt-0.5 line-clamp-1 text-sm text-muted">{localized(pro.headline, locale)}</p>
            <RatingStars rating={pro.rating} count={pro.ratingCount} className="mt-1" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted">
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" aria-hidden />
            {cityName(pro.citySlug, locale)} · {t("meta.distanceKm", { km: pro.distanceKm })}
          </span>
          <span>{t("meta.respondsIn", { minutes: pro.avgResponseMin })}</span>
        </div>
        {pro.availableNow && (
          <Badge tone="success" className="self-start">
            <Zap className="size-3" aria-hidden />
            {t("badges.availableNow")}
          </Badge>
        )}
      </Link>
    </Card>
  );
}
