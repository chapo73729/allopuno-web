import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import {
  BadgeCheck,
  CalendarDays,
  Clock,
  Flame,
  Info,
  MapPin,
  MessageSquare,
  Share2,
  Wallet,
  type LucideIcon
} from "lucide-react";
import { findCategory } from "@allopuno/data";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { RatingStars } from "@/components/ui/RatingStars";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EmptyState } from "@/components/ui/EmptyState";
import { CategoryIcon } from "@/components/CategoryIcon";
import { cn } from "@/lib/cn";
import { demoRequests, findPro, findRequest, offersForRequest } from "@/lib/demo";
import type { DemoOffer, DemoPro } from "@/lib/demo";
import { cityName, formatAgo, formatEur, localized } from "@/lib/format";

export function generateStaticParams() {
  return demoRequests.map((request) => ({ id: request.id }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const request = findRequest(id);
  if (!request) return {};
  return { title: localized(request.title, locale) };
}

type OfferWithPro = { offer: DemoOffer; pro: DemoPro };

/** Badges d'aide au choix (CDC §20) — calculés sur l'ensemble réel des offres. */
function computeHints(offers: OfferWithPro[]) {
  if (offers.length === 0) {
    return { closestId: undefined, topRatedId: undefined, fastestId: undefined, bestValueId: undefined };
  }
  const closestId = offers.reduce((a, b) => (b.pro.distanceKm < a.pro.distanceKm ? b : a)).offer.id;
  const topRatedId = offers.reduce((a, b) => (b.pro.rating > a.pro.rating ? b : a)).offer.id;
  const fastestId = offers.reduce((a, b) => (b.offer.respondedMin < a.offer.respondedMin ? b : a)).offer.id;
  const valueCandidates = offers.filter(({ pro }) => pro.rating >= 4.7);
  const bestValueId =
    valueCandidates.length > 0
      ? valueCandidates.reduce((a, b) => (b.offer.price < a.offer.price ? b : a)).offer.id
      : undefined;
  return { closestId, topRatedId, fastestId, bestValueId };
}

const gridColsByCount: Record<number, string> = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4"
};

const staggerDelays = ["delay-1", "delay-2", "delay-3", "delay-4"];

export default async function RequestDetailPage({
  params
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const request = findRequest(id);
  if (!request) notFound();

  const t = await getTranslations("request");
  const tc = await getTranslations("common");

  const category = findCategory(request.categorySlug);
  const offers: OfferWithPro[] = offersForRequest(request.id)
    .map((offer) => ({ offer, pro: findPro(offer.proId) }))
    .filter((entry): entry is OfferWithPro => entry.pro != null)
    .slice(0, 4);
  const { closestId, topRatedId, fastestId, bestValueId } = computeHints(offers);

  const hintsFor = (offerId: string) => {
    const hints: Array<{ key: string; label: string; tone: "brand" | "success" }> = [];
    if (offerId === closestId) hints.push({ key: "closest", label: t("compare.hintClosest"), tone: "brand" });
    if (offerId === topRatedId) hints.push({ key: "topRated", label: t("compare.hintTopRated"), tone: "success" });
    if (offerId === fastestId) hints.push({ key: "fastest", label: t("compare.hintFastest"), tone: "success" });
    if (offerId === bestValueId) hints.push({ key: "bestValue", label: t("compare.hintBestValue"), tone: "brand" });
    return hints;
  };

  const offerPrice = (offer: DemoOffer): string =>
    offer.priceTo != null ? `${offer.price}–${formatEur(offer.priceTo)}` : formatEur(offer.price);

  const budgetValue =
    request.budgetMin != null && request.budgetMax != null
      ? `${request.budgetMin}–${formatEur(request.budgetMax)}`
      : t("detail.budgetOpen");

  const metaItems: Array<{ icon: LucideIcon; label: string; value: string; accent?: boolean }> = [
    { icon: MapPin, label: t("detail.location"), value: cityName(request.citySlug, locale) },
    { icon: CalendarDays, label: t("detail.date"), value: localized(request.neededOn, locale) },
    { icon: Wallet, label: t("detail.budget"), value: budgetValue, accent: true }
  ];

  const shareBlock = (
    <div className="relative overflow-hidden rounded-(--radius-card) border border-brand-100 bg-brand-50/60 p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-(--shadow-brand)">
            <Share2 className="size-5" aria-hidden />
          </span>
          <div>
            <p className="font-display font-semibold">{t("detail.shareTitle")}</p>
            <p className="mt-1 text-sm text-muted">{t("detail.shareText")}</p>
          </div>
        </div>
        <Button type="button" variant="secondary" className="shrink-0 self-start sm:self-auto">
          <Share2 className="size-4" aria-hidden />
          {tc("actions.share")}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* En-tête de la demande */}
      <section className="relative overflow-hidden border-b border-line bg-card">
        <div className="bg-hero-wash absolute inset-0" aria-hidden />
        <div className="bg-grid absolute inset-0 opacity-60" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
          <div className="max-w-3xl animate-fade-up">
            <div className="flex flex-wrap items-center gap-2">
              {category && (
                <Badge tone="brand">
                  <CategoryIcon name={category.icon} className="size-3.5" />
                  {locale === "en" ? category.name.en : category.name.sq}
                </Badge>
              )}
              {request.urgent && (
                <Badge tone="danger">
                  <Flame className="size-3.5" aria-hidden />
                  {tc("badges.urgent")}
                </Badge>
              )}
            </div>
            <h1 className="mt-4 font-display text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl">
              {localized(request.title, locale)}
            </h1>

            {/* Demandeur */}
            <div className="mt-5 flex items-center gap-3">
              <Avatar name={request.authorName} size="md" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">
                  <span className="sr-only">{t("detail.aboutRequester")}: </span>
                  {request.authorName}
                </p>
                <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted">
                  <Clock className="size-3.5" aria-hidden />
                  {t("postedAgo", { ago: formatAgo(request.hoursAgo, locale) })}
                </p>
              </div>
            </div>

            {/* Méta clés */}
            <dl className="mt-6 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-3">
              {metaItems.map(({ icon: Icon, label, value, accent }) => (
                <div
                  key={label}
                  className={cn(
                    "rounded-(--radius-field) border p-3",
                    accent ? "col-span-2 border-brand-100 bg-brand-50/70 sm:col-span-1" : "border-line bg-card/70"
                  )}
                >
                  <dt className="inline-flex items-center gap-1.5 text-[0.7rem] font-medium uppercase tracking-wide text-faint">
                    <Icon className={cn("size-3.5", accent ? "text-brand-600" : "text-muted")} aria-hidden />
                    {label}
                  </dt>
                  <dd
                    className={cn(
                      "mt-1 font-display text-sm font-semibold",
                      accent ? "text-brand-700" : "text-ink"
                    )}
                  >
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {/* Description complète */}
        <section className="max-w-3xl animate-fade-up delay-1">
          <SectionHeading title={t("detail.description")} />
          <Card className="p-5 sm:p-6">
            <p className="text-[0.95rem] leading-relaxed sm:text-base">
              {localized(request.description, locale)}
            </p>
          </Card>
        </section>

        {/* Encart partage */}
        <section className="mt-8 max-w-3xl animate-fade-up delay-2">{shareBlock}</section>

        {/* LE COMPARATEUR — CDC §20 */}
        {offers.length > 0 ? (
          <section className="pt-12">
            <SectionHeading
              title={t("compare.title")}
              action={
                <span className="text-sm font-medium text-muted">
                  {t("offersReceived", { count: offers.length })}
                </span>
              }
            />
            <div className={`grid grid-cols-1 gap-4 ${gridColsByCount[offers.length] ?? "lg:grid-cols-4"}`}>
              {offers.map(({ offer, pro }, i) => (
                <Card
                  key={offer.id}
                  className={cn(
                    "group animate-fade-up relative flex flex-col overflow-hidden p-4 transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-(--shadow-pop)",
                    staggerDelays[i]
                  )}
                >
                  {/* Filet d'accent qui se révèle au survol */}
                  <span
                    aria-hidden
                    className="bg-brand-gradient absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
                  />
                  <Link
                    href={`/profesionisti/${pro.id}`}
                    className="flex items-center gap-2.5"
                  >
                    <Avatar name={pro.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-sm font-semibold transition-colors group-hover:text-brand-700">
                        {pro.name}
                      </p>
                      <RatingStars rating={pro.rating} count={pro.ratingCount} className="mt-0.5" />
                    </div>
                  </Link>
                  {hintsFor(offer.id).length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {hintsFor(offer.id).map((hint) => (
                        <Badge key={hint.key} tone={hint.tone}>
                          {hint.label}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Prix — hiérarchie principale */}
                  <div className="mt-3 flex items-end justify-between gap-2 rounded-(--radius-field) bg-wash px-3.5 py-2.5">
                    <span className="text-[0.7rem] font-medium uppercase tracking-wide text-faint">
                      {t("compare.price")}
                    </span>
                    <span className="font-display text-2xl font-bold leading-none tabular-nums text-ink">
                      {offerPrice(offer)}
                    </span>
                  </div>

                  {/* Détails ligne/valeur */}
                  <dl className="mt-3 divide-y divide-line border-t border-line text-sm">
                    <div className="flex items-baseline justify-between gap-2 py-2">
                      <dt className="shrink-0 text-xs text-muted">{t("compare.availability")}</dt>
                      <dd className="text-right font-medium">{localized(offer.availability, locale)}</dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-2 py-2">
                      <dt className="shrink-0 text-xs text-muted">{t("compare.duration")}</dt>
                      <dd className="text-right font-medium">{localized(offer.duration, locale)}</dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-2 py-2">
                      <dt className="shrink-0 text-xs text-muted">{t("compare.distance")}</dt>
                      <dd className="text-right font-medium tabular-nums">
                        {tc("meta.distanceKm", { km: pro.distanceKm })}
                      </dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-2 py-2">
                      <dt className="shrink-0 text-xs text-muted">{t("compare.responseTime")}</dt>
                      <dd className="text-right font-medium tabular-nums">
                        {t("compare.respondedIn", { minutes: offer.respondedMin })}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-2 py-2">
                      <dt className="shrink-0 text-xs text-muted">{t("compare.verifications")}</dt>
                      <dd className="inline-flex items-center gap-1.5">
                        <span className="inline-flex">
                          {pro.verified.map((kind) => (
                            <BadgeCheck
                              key={kind}
                              className="-ml-1.5 size-4 text-brand-600 first:ml-0"
                              aria-hidden
                            />
                          ))}
                        </span>
                        <span className="text-sm font-semibold tabular-nums">
                          {pro.verified.length}
                        </span>
                      </dd>
                    </div>
                  </dl>

                  <blockquote className="mt-3 line-clamp-4 border-l-2 border-brand-100 pl-3 text-sm italic leading-relaxed text-muted">
                    {localized(offer.message, locale)}
                  </blockquote>

                  <div className="mt-auto flex flex-col gap-2 pt-4">
                    <Button type="button" className="w-full">
                      {t("compare.choose")}
                    </Button>
                    <Button type="button" variant="outline" className="w-full">
                      <MessageSquare className="size-4" aria-hidden />
                      {t("compare.message")}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
            <p className="mt-4 inline-flex items-start gap-1.5 text-xs text-faint">
              <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              {t("compare.disclaimer")}
            </p>
          </section>
        ) : (
          <section className="pt-12 animate-fade-up">
            <EmptyState
              icon={<MessageSquare aria-hidden />}
              title={t("offersReceived", { count: 0 })}
              text={t("detail.shareText")}
              action={
                <Button type="button" variant="outline">
                  <Share2 className="size-4" aria-hidden />
                  {tc("actions.share")}
                </Button>
              }
            />
          </section>
        )}
      </div>
    </>
  );
}
