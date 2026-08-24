"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronRight, ClipboardList, Clock, MapPin, MessageSquare, Plus } from "lucide-react";
import { findCategory } from "@allopuno/data";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { CategoryIcon } from "@/components/CategoryIcon";
import { cn } from "@/lib/cn";
import { useEngine, type LocalRequestStatus } from "@/lib/engine";
import { cityName, formatAgo, localized } from "@/lib/format";

const statusTones: Record<LocalRequestStatus, "brand" | "success" | "neutral"> = {
  active: "brand",
  matched: "success",
  completed: "neutral",
  cancelled: "neutral"
};

const staggerDelays = ["delay-1", "delay-2", "delay-3", "delay-4"];

export function RequestsClient() {
  const t = useTranslations("workspace");
  const locale = useLocale();
  const { requests } = useEngine();

  // L'état vit en localStorage : on n'affiche la liste (ou le vide) qu'une
  // fois hydraté, pour ne pas montrer un « état vide » mensonger côté serveur.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const sorted = [...requests].sort((a, b) => b.publishedAt - a.publishedAt);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="animate-fade-up">
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          {t("requests.title")}
        </h1>
        <p className="mt-2 text-muted">{t("requests.subtitle")}</p>
      </header>

      {mounted && sorted.length === 0 && (
        <div className="animate-fade-up delay-1 mt-8">
          <EmptyState
            icon={<ClipboardList aria-hidden />}
            title={t("requests.empty")}
            text={t("requests.emptyText")}
            action={
              <Button as={Link} href="/publiko">
                <Plus className="size-4" aria-hidden />
                {t("requests.emptyCta")}
              </Button>
            }
          />
        </div>
      )}

      {mounted && sorted.length > 0 && (
        <ul className="mt-8 flex flex-col gap-4">
          {sorted.map((request, i) => {
            const category = request.categorySlug ? findCategory(request.categorySlug) : undefined;
            const searching = request.status === "active" && request.planned.length > 0;
            return (
              <li key={request.id} className={cn("animate-fade-up", staggerDelays[Math.min(i, 3)])}>
                <Link href={`/kerkesat/${request.id}`} className="group block">
                  <Card className="p-4 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-brand-200 group-hover:shadow-(--shadow-pop) sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge tone={statusTones[request.status]}>
                            {t(`requests.status.${request.status}`)}
                          </Badge>
                          {searching && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-700">
                              <span className="relative flex size-2" aria-hidden>
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
                                <span className="relative inline-flex size-2 rounded-full bg-brand-600" />
                              </span>
                              {t("requests.searching")}
                            </span>
                          )}
                        </div>
                        <p className="mt-2 truncate font-display text-lg font-semibold transition-colors group-hover:text-brand-700">
                          {request.title}
                        </p>
                      </div>
                      <ChevronRight
                        className="mt-1 size-5 shrink-0 text-faint transition-transform group-hover:translate-x-0.5"
                        aria-hidden
                      />
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted">
                      {category && (
                        <span className="inline-flex items-center gap-1.5">
                          <CategoryIcon name={category.icon} className="size-3.5 text-brand-500" />
                          {localized(category.name, locale)}
                        </span>
                      )}
                      {request.citySlug && (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="size-3.5" aria-hidden />
                          {cityName(request.citySlug, locale)}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="size-3.5" aria-hidden />
                        {formatAgo((Date.now() - request.publishedAt) / 3600000, locale)}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 text-xs font-medium",
                          request.responses.length > 0 ? "text-brand-700" : "text-faint"
                        )}
                      >
                        <MessageSquare className="size-3.5" aria-hidden />
                        {t("requests.responses", { count: request.responses.length })}
                      </span>
                      <span className="text-xs font-medium text-brand-700">{t("requests.view")}</span>
                    </div>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-8 text-center text-xs text-faint">{t("demoNote")}</p>
    </div>
  );
}
