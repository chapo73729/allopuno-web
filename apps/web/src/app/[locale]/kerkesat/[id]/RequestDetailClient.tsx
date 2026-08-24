"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowRight,
  BadgeCheck,
  Calendar,
  Camera,
  ClipboardList,
  Clock,
  MapPin,
  MessageSquare,
  Wallet,
  Zap
} from "lucide-react";
import { findCategory } from "@allopuno/data";
import { Link, useRouter } from "@/i18n/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { RatingStars } from "@/components/ui/RatingStars";
import { CategoryIcon } from "@/components/CategoryIcon";
import { cn } from "@/lib/cn";
import {
  cancelRequest,
  openConversation,
  proById,
  selectResponse,
  useEngine,
  type LocalRequest,
  type LocalResponse
} from "@/lib/engine";
import { cityName, formatAgo, localized } from "@/lib/format";

/** Détail d'une kërkesa : suivi, offres en direct, choix, messagerie. */

function DateValue({ request }: { request: LocalRequest }) {
  const t = useTranslations("publish");
  const choice = request.dateChoice ?? "s-e-di";
  const map: Record<string, string> = {
    sot: "today",
    neser: "tomorrow",
    "kete-jave": "thisWeek",
    "s-e-di": "unknown"
  };
  const base = map[choice] ? t(`date.${map[choice]}` as never) : choice;
  const time = request.timeChoice ? ` · ${t(`date.${request.timeChoice}` as never)}` : "";
  return <>{base + time}</>;
}

function BudgetValue({ request }: { request: LocalRequest }) {
  const t = useTranslations("common");
  const tp = useTranslations("publish");
  if (request.budgetMin !== undefined && request.budgetMax !== undefined) {
    return <>{t("meta.budget", { min: request.budgetMin, max: request.budgetMax })}</>;
  }
  if (request.budgetMax !== undefined) return <>{tp("budget.customMax", { max: request.budgetMax })}</>;
  if (request.budgetMin !== undefined) return <>{tp("budget.customMin", { min: request.budgetMin })}</>;
  return <>{t("meta.noBudget")}</>;
}

function OfferCard({
  request,
  response,
  hint,
  onSelect,
  onMessage
}: {
  request: LocalRequest;
  response: LocalResponse;
  hint?: string;
  onSelect: () => void;
  onMessage: () => void;
}) {
  const t = useTranslations("workspace");
  const tr = useTranslations("request");
  const tc = useTranslations("common");
  const locale = useLocale();
  const pro = proById(response.proId);
  if (!pro) return null;

  const isSelected = response.status === "accepted";
  const isDimmed = response.status === "not_selected";
  const price =
    response.priceTo !== undefined ? `${response.price}–${response.priceTo} €` : `${response.price} €`;

  return (
    <Card
      className={cn(
        "animate-fade-up p-4 sm:p-5",
        isSelected && "border-brand-400 ring-2 ring-brand-100",
        isDimmed && "opacity-55"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <Link href={`/profesionisti/${pro.id}`} className="group flex min-w-0 items-center gap-3">
          <Avatar name={pro.name} size="md" />
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 font-display font-semibold leading-tight group-hover:text-brand-700">
              <span className="truncate">{pro.name}</span>
              {(pro.verified.includes("identity") || pro.verified.includes("business")) && (
                <BadgeCheck
                  role="img"
                  aria-label={tc("badges.identityVerified")}
                  className="size-4 shrink-0 text-brand-600"
                />
              )}
            </p>
            <RatingStars rating={pro.rating} count={pro.ratingCount} />
          </div>
        </Link>
        <div className="text-right">
          <p className="font-display text-xl font-extrabold text-brand-700">{price}</p>
          {isSelected && <Badge tone="success">{t("detail.selected")}</Badge>}
          {isDimmed && <Badge tone="neutral">{t("detail.notSelected")}</Badge>}
          {!isSelected && !isDimmed && hint && <Badge tone="brand">{hint}</Badge>}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted">
        <span className="inline-flex items-center gap-1">
          <Calendar className="size-3.5" aria-hidden />
          {localized(response.availability, locale)}
        </span>
        <span className="inline-flex items-center gap-1">
          <MapPin className="size-3.5" aria-hidden />
          {tc("meta.distanceKm", { km: pro.distanceKm })}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="size-3.5" aria-hidden />
          {tr("compare.respondedIn", { minutes: response.respondedMin })}
        </span>
      </div>

      <p className="mt-3 border-l-2 border-line pl-3 text-sm italic text-muted">
        {localized(response.message, locale)}
      </p>

      {request.status === "active" && (
        <div className="mt-4 flex gap-2.5">
          <Button className="flex-1" onClick={onSelect}>
            {t("detail.select")}
          </Button>
          <Button variant="outline" onClick={onMessage}>
            <MessageSquare className="size-4" aria-hidden />
            {t("detail.message")}
          </Button>
        </div>
      )}
      {isSelected && (
        <Button className="mt-4 w-full" onClick={onMessage}>
          {t("detail.openConversation")}
          <ArrowRight className="size-4" aria-hidden />
        </Button>
      )}
    </Card>
  );
}

export function RequestDetailClient({ requestId }: { requestId: string }) {
  const t = useTranslations("workspace");
  const trq = useTranslations("request");
  const locale = useLocale();
  const router = useRouter();
  const { requests } = useEngine();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const request = requests.find((r) => r.id === requestId);

  if (!mounted) return <div className="min-h-[50vh]" aria-hidden />;

  if (!request) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <EmptyState
          icon={<ClipboardList aria-hidden />}
          title={t("requests.empty")}
          text={t("requests.emptyText")}
          action={
            <Button as={Link} href="/kerkesat" variant="outline">
              {t("requests.title")}
            </Button>
          }
        />
      </div>
    );
  }

  const category = request.categorySlug ? findCategory(request.categorySlug) : undefined;
  const searching = request.status === "active" && request.planned.length > 0;
  const responses = [...request.responses].sort((a, b) => a.createdAt - b.createdAt);
  const selectedPro =
    request.selectedResponseId !== undefined
      ? proById(responses.find((r) => r.id === request.selectedResponseId)?.proId ?? "")
      : undefined;

  // Étiquettes factuelles (jamais décisionnaires) : moins cher / mieux noté.
  const cheapestId =
    responses.length > 1
      ? responses.reduce((best, r) => (r.price < best.price ? r : best), responses[0]).id
      : undefined;
  const topRatedId =
    responses.length > 1
      ? responses.reduce((best, r) => {
          const rb = proById(best.proId)?.rating ?? 0;
          const rr = proById(r.proId)?.rating ?? 0;
          return rr > rb ? r : best;
        }, responses[0]).id
      : undefined;

  function goToConversation(proId: string) {
    const convId = openConversation(request!.id, proId);
    router.push(`/mesazhet/${convId}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      {/* En-tête de la demande */}
      <header className="animate-fade-up">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={request.status === "matched" ? "success" : request.status === "active" ? "brand" : "neutral"}>
            {t(`requests.status.${request.status}`)}
          </Badge>
          {request.urgent && (
            <Badge tone="danger">
              <Zap className="size-3" aria-hidden />
              {t("detail.urgent")}
            </Badge>
          )}
        </div>
        <h1 className="mt-3 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
          {request.title}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted">
          {category && (
            <span className="inline-flex items-center gap-1.5">
              <CategoryIcon name={category.icon} className="size-4 text-brand-500" />
              {localized(category.name, locale)}
            </span>
          )}
          {request.citySlug && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4" aria-hidden />
              {cityName(request.citySlug, locale)}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-4" aria-hidden />
            {formatAgo((Date.now() - request.publishedAt) / 3600000, locale)}
          </span>
        </div>
        {request.description && request.description !== request.title && (
          <p className="mt-4 rounded-(--radius-field) bg-wash px-4 py-3 text-sm leading-relaxed text-muted">
            {request.description}
          </p>
        )}
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
          <span className="inline-flex items-center gap-1.5 rounded-(--radius-field) border border-line px-3 py-2">
            <Calendar className="size-4 shrink-0 text-brand-600" aria-hidden />
            <span className="truncate">
              <DateValue request={request} />
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-(--radius-field) border border-line px-3 py-2">
            <Wallet className="size-4 shrink-0 text-brand-600" aria-hidden />
            <span className="truncate">
              <BudgetValue request={request} />
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-(--radius-field) border border-line px-3 py-2">
            <Camera className="size-4 shrink-0 text-brand-600" aria-hidden />
            <span className="truncate">{t("detail.photos", { count: request.photosCount })}</span>
          </span>
        </div>
      </header>

      {/* Bandeaux d'état */}
      {request.status === "cancelled" && (
        <Card className="animate-fade-up mt-6 flex flex-col items-start gap-3 border-line bg-wash p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">{t("requests.cancelledBanner")}</p>
          <Button as={Link} href="/publiko" size="sm" variant="outline">
            {t("requests.publishAnother")}
          </Button>
        </Card>
      )}
      {request.status === "matched" && selectedPro && (
        <Card className="animate-fade-up mt-6 border-success/40 bg-success-soft p-4">
          <p className="text-sm font-medium text-success">
            {t("detail.selectedBanner", { name: selectedPro.name })}
          </p>
        </Card>
      )}

      {/* Offres */}
      <section className="mt-8">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-display text-xl font-bold">{t("detail.offersTitle")}</h2>
          <span className="text-sm text-muted">
            {t("requests.responses", { count: responses.length })}
          </span>
        </div>

        {searching && responses.length === 0 && (
          <Card className="animate-fade-up mt-4 flex flex-col items-center gap-3 p-8 text-center">
            <span className="relative flex size-12 items-center justify-center" aria-hidden>
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-200 opacity-70" />
              <span className="relative inline-flex size-9 items-center justify-center rounded-full bg-brand-600 text-white">
                <MapPin className="size-4.5" />
              </span>
            </span>
            <p className="font-display font-semibold">{t("requests.searching")}</p>
            <p className="text-sm text-muted">{t("requests.moreComing")}</p>
          </Card>
        )}

        <div className="mt-4 flex flex-col gap-4">
          {responses.map((response) => (
            <OfferCard
              key={response.id}
              request={request}
              response={response}
              hint={
                response.id === cheapestId
                  ? trq("compare.hintBestValue")
                  : response.id === topRatedId
                    ? trq("compare.hintTopRated")
                    : undefined
              }
              onSelect={() => {
                const convId = selectResponse(request.id, response.id);
                if (convId) router.push(`/mesazhet/${convId}`);
              }}
              onMessage={() => goToConversation(response.proId)}
            />
          ))}
        </div>

        {searching && responses.length > 0 && (
          <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted">
            <span className="relative flex size-2" aria-hidden>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-brand-600" />
            </span>
            {t("requests.moreComing")}
          </p>
        )}
      </section>

      {/* Actions */}
      {request.status === "active" && (
        <div className="mt-10 border-t border-line pt-5">
          <Button
            variant="ghost"
            className="text-danger hover:bg-danger-soft hover:text-danger"
            onClick={() => {
              if (window.confirm(t("requests.cancelConfirm"))) cancelRequest(request.id);
            }}
          >
            {t("requests.cancel")}
          </Button>
        </div>
      )}

      <p className="mt-8 text-center text-xs text-faint">{t("demoNote")}</p>
    </div>
  );
}
