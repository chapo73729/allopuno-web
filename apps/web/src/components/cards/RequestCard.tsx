import { useLocale, useTranslations } from "next-intl";
import { Clock, MapPin, MessageSquare, Wallet } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { findCategory } from "@allopuno/data";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CategoryIcon } from "@/components/CategoryIcon";
import { cn } from "@/lib/cn";
import { cityName, formatAgo, localized } from "@/lib/format";
import type { DemoRequest } from "@/lib/demo";

export function RequestCard({ request }: { request: DemoRequest }) {
  const locale = useLocale();
  const t = useTranslations("common");
  const tr = useTranslations("request");
  const category = findCategory(request.categorySlug);

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-(--shadow-pop)">
      {/* Filet d'accent qui se révèle au survol */}
      <span
        aria-hidden
        className="bg-brand-gradient absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
      />
      <Link href={`/kerkesa/${request.id}`} className="flex h-full flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          {category && (
            <Badge tone="brand">
              <CategoryIcon name={category.icon} className="size-3.5" />
              {locale === "en" ? category.name.en : category.name.sq}
            </Badge>
          )}
          {request.urgent && <Badge tone="danger">{t("badges.urgent")}</Badge>}
        </div>
        <p className="line-clamp-2 font-display font-semibold leading-snug transition-colors group-hover:text-brand-700">
          {localized(request.title, locale)}
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted">
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" aria-hidden />
            {cityName(request.citySlug, locale)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" aria-hidden />
            {formatAgo(request.hoursAgo, locale)}
          </span>
        </div>
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-line pt-3">
          <span className="inline-flex min-w-0 items-center gap-1.5 text-sm font-semibold text-ink">
            <Wallet className="size-4 shrink-0 text-brand-600" aria-hidden />
            <span className="truncate">
              {request.budgetMin != null && request.budgetMax != null
                ? t("meta.budget", { min: request.budgetMin, max: request.budgetMax })
                : t("meta.noBudget")}
            </span>
          </span>
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1 text-xs font-medium",
              request.offersCount > 0 ? "text-brand-700" : "text-faint"
            )}
          >
            <MessageSquare className="size-3.5" aria-hidden />
            {tr("offersReceived", { count: request.offersCount })}
          </span>
        </div>
      </Link>
    </Card>
  );
}
