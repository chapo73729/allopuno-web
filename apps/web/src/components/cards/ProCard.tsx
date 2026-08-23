import { useLocale, useTranslations } from "next-intl";
import { BadgeCheck, Clock, MapPin, Zap } from "lucide-react";
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
  const verified = pro.verified.includes("identity") || pro.verified.includes("business");

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-(--shadow-pop)">
      {/* Filet d'accent qui se révèle au survol */}
      <span
        aria-hidden
        className="bg-brand-gradient absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
      />
      <Link href={`/profesionisti/${pro.id}`} className="flex flex-col gap-3.5 p-4">
        <div className="flex items-start gap-3">
          <span className="relative shrink-0">
            <Avatar
              name={pro.name}
              size="lg"
              className="ring-2 ring-transparent transition-shadow duration-300 group-hover:ring-brand-100"
            />
            {pro.availableNow && (
              <span
                aria-hidden
                className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-card bg-success"
              />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 font-display font-semibold leading-tight">
              <span className="truncate transition-colors group-hover:text-brand-700">{pro.name}</span>
              {verified && (
                <BadgeCheck
                  role="img"
                  className="size-4 shrink-0 text-brand-600"
                  aria-label={t("badges.identityVerified")}
                />
              )}
            </p>
            <p className="mt-0.5 line-clamp-1 text-sm text-muted">{localized(pro.headline, locale)}</p>
            <RatingStars rating={pro.rating} count={pro.ratingCount} className="mt-1.5" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted">
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" aria-hidden />
            {cityName(pro.citySlug, locale)} · {t("meta.distanceKm", { km: pro.distanceKm })}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" aria-hidden />
            {t("meta.respondsIn", { minutes: pro.avgResponseMin })}
          </span>
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
