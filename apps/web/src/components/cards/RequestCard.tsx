import { useLocale, useTranslations } from "next-intl";
import { Clock, MapPin, MessageSquare } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { findCategory } from "@allopuno/data";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cityName, formatAgo, localized } from "@/lib/format";
import type { DemoRequest } from "@/lib/demo";

export function RequestCard({ request }: { request: DemoRequest }) {
  const locale = useLocale();
  const t = useTranslations("common");
  const tr = useTranslations("request");
  const category = findCategory(request.categorySlug);

  return (
    <Card className="transition-shadow hover:shadow-(--shadow-pop)">
      <Link href={`/kerkesa/${request.id}`} className="flex h-full flex-col gap-3 p-4">
        <div className="flex items-center gap-2">
          {category && (
            <Badge tone="brand">{locale === "en" ? category.name.en : category.name.sq}</Badge>
          )}
          {request.urgent && <Badge tone="danger">{t("badges.urgent")}</Badge>}
        </div>
        <p className="line-clamp-2 font-display font-semibold leading-snug">
          {localized(request.title, locale)}
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted">
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" aria-hidden />
            {cityName(request.citySlug, locale)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" aria-hidden />
            {formatAgo(request.hoursAgo, locale)}
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageSquare className="size-3.5" aria-hidden />
            {tr("offersReceived", { count: request.offersCount })}
          </span>
        </div>
        <p className="text-sm font-medium text-ink">
          {request.budgetMin != null && request.budgetMax != null
            ? t("meta.budget", { min: request.budgetMin, max: request.budgetMax })
            : t("meta.noBudget")}
        </p>
      </Link>
    </Card>
  );
}
