import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { BadgeCheck, CalendarDays, Clock, MapPin, MessageSquare, Share2 } from "lucide-react";
import { findCategory } from "@allopuno/data";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { RatingStars } from "@/components/ui/RatingStars";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EmptyState } from "@/components/ui/EmptyState";
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

  const shareBlock = (
    <div className="flex flex-col gap-4 rounded-(--radius-card) bg-wash p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-display font-semibold">{t("detail.shareTitle")}</p>
        <p className="mt-1 text-sm text-muted">{t("detail.shareText")}</p>
      </div>
      <Button type="button" variant="outline" className="shrink-0 self-start sm:self-auto">
        <Share2 className="size-4" aria-hidden />
        {tc("actions.share")}
      </Button>
    </div>
  );

  return (
    <>
      {/* Fil de la demande */}
      <section className="border-b border-line bg-card">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              {category && (
                <Badge tone="brand">{locale === "en" ? category.name.en : category.name.sq}</Badge>
              )}
              {request.urgent && <Badge tone="danger">{tc("badges.urgent")}</Badge>}
            </div>
            <h1 className="mt-3 font-display text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
              {localized(request.title, locale)}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-4" aria-hidden />
                {cityName(request.citySlug, locale)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="size-4" aria-hidden />
                {formatAgo(request.hoursAgo, locale)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Avatar name={request.authorName} size="sm" />
                <span className="sr-only">{t("detail.aboutRequester")}</span>
                <span className="font-medium text-ink">{request.authorName}</span>
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <span className="font-semibold">
                {request.budgetMin != null && request.budgetMax != null
                  ? tc("meta.budget", { min: request.budgetMin, max: request.budgetMax })
                  : tc("meta.noBudget")}
              </span>
              <span className="inline-flex items-center gap-1 text-muted">
                <CalendarDays className="size-4" aria-hidden />
                <span className="sr-only">{t("detail.date")}</span>
                {localized(request.neededOn, locale)}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {/* Description complète */}
        <section className="max-w-3xl">
          <SectionHeading title={t("detail.description")} />
          <Card className="p-5">
            <p className="text-sm leading-relaxed sm:text-base">
              {localized(request.description, locale)}
            </p>
          </Card>
        </section>

        {/* Encart partage */}
        <section className="mt-8 max-w-3xl">{shareBlock}</section>

        {/* LE COMPARATEUR — CDC §20 */}
        {offers.length > 0 ? (
          <section className="pt-12">
            <SectionHeading title={t("compare.title")} />
            <div className={`grid grid-cols-1 gap-4 ${gridColsByCount[offers.length] ?? "lg:grid-cols-4"}`}>
              {offers.map(({ offer, pro }) => (
                <Card key={offer.id} className="flex flex-col p-4">
                  <Link
                    href={`/profesionisti/${pro.id}`}
                    className="flex items-center gap-2.5 hover:text-brand-700"
                  >
                    <Avatar name={pro.name} size="sm" />
                    <span className="min-w-0 truncate font-display text-sm font-semibold">
                      {pro.name}
                    </span>
                  </Link>
                  <RatingStars rating={pro.rating} count={pro.ratingCount} className="mt-1.5" />
                  {hintsFor(offer.id).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {hintsFor(offer.id).map((hint) => (
                        <Badge key={hint.key} tone={hint.tone}>
                          {hint.label}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <dl className="mt-3 space-y-2 border-t border-line pt-3 text-sm">
                    <div className="flex items-baseline justify-between gap-2">
                      <dt className="shrink-0 text-xs text-muted">{t("compare.price")}</dt>
                      <dd className="font-display text-xl font-bold tabular-nums">
                        {offerPrice(offer)}
                      </dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-2">
                      <dt className="shrink-0 text-xs text-muted">{t("compare.availability")}</dt>
                      <dd className="text-right font-medium">{localized(offer.availability, locale)}</dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-2">
                      <dt className="shrink-0 text-xs text-muted">{t("compare.duration")}</dt>
                      <dd className="text-right font-medium">{localized(offer.duration, locale)}</dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-2">
                      <dt className="shrink-0 text-xs text-muted">{t("compare.distance")}</dt>
                      <dd className="text-right font-medium tabular-nums">
                        {tc("meta.distanceKm", { km: pro.distanceKm })}
                      </dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-2">
                      <dt className="shrink-0 text-xs text-muted">{t("compare.responseTime")}</dt>
                      <dd className="text-right font-medium tabular-nums">
                        {t("compare.respondedIn", { minutes: offer.respondedMin })}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-2">
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
                  <p className="mt-3 line-clamp-4 text-sm italic leading-relaxed text-muted">
                    {localized(offer.message, locale)}
                  </p>
                  <div className="mt-auto flex flex-col gap-2 pt-4">
                    <Button type="button" className="w-full">
                      {t("compare.choose")}
                    </Button>
                    <Button type="button" variant="ghost" className="w-full">
                      {t("compare.message")}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
            <p className="mt-3 text-xs text-faint">{t("compare.disclaimer")}</p>
          </section>
        ) : (
          <section className="pt-12">
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
