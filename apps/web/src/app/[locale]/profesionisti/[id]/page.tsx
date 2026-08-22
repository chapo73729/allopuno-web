import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { BadgeCheck, MapPin, Zap } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { RatingStars } from "@/components/ui/RatingStars";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { demoPros, findPro } from "@/lib/demo";
import type { DemoService, VerificationKind } from "@/lib/demo";
import { cityName, formatAgo, localized } from "@/lib/format";

export function generateStaticParams() {
  return demoPros.map((pro) => ({ id: pro.id }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const pro = findPro(id);
  if (!pro) return {};
  return { title: pro.name };
}

export default async function ProProfilePage({
  params
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const pro = findPro(id);
  if (!pro) notFound();

  const t = await getTranslations("pro");
  const tc = await getTranslations("common");

  const verificationLabels: Record<VerificationKind, string> = {
    phone: tc("badges.phoneVerified"),
    email: tc("badges.emailVerified"),
    identity: tc("badges.identityVerified"),
    business: tc("badges.businessVerified")
  };

  // Fourchette "8–12 €/m²", "15 €/orë" — clés d'unités du namespace pro.
  function priceLabel(service: DemoService): string | undefined {
    if (service.priceFrom == null) return undefined;
    const price =
      service.priceTo != null ? `${service.priceFrom}–${service.priceTo}` : `${service.priceFrom}`;
    switch (service.unit) {
      case "hour":
        return t("units.perHour", { price });
      case "job":
        return t("units.perJob", { price });
      case "m2":
        return t("units.perM2", { price });
      case "day":
        return t("units.perDay", { price });
      default:
        return t("units.flat", { price });
    }
  }

  const breakdownRows = [
    { key: "quality", label: t("ratingBreakdown.quality"), value: pro.breakdown.quality },
    { key: "punctuality", label: t("ratingBreakdown.punctuality"), value: pro.breakdown.punctuality },
    {
      key: "communication",
      label: t("ratingBreakdown.communication"),
      value: pro.breakdown.communication
    },
    { key: "value", label: t("ratingBreakdown.value"), value: pro.breakdown.value },
    {
      key: "professionalism",
      label: t("ratingBreakdown.professionalism"),
      value: pro.breakdown.professionalism
    }
  ];

  const isVerifiedPro = pro.verified.includes("identity") || pro.verified.includes("business");

  const stats = [
    { key: "jobs", value: `${pro.jobsDone}`, label: t("stats.jobs") },
    { key: "responseRate", value: t("stats.percent", { rate: pro.responseRate }), label: t("stats.responseRate") },
    { key: "avgResponse", value: t("stats.minutes", { minutes: pro.avgResponseMin }), label: t("stats.avgResponse") }
  ];

  return (
    <>
      {/* En-tête profil — CDC §20 */}
      <section className="border-b border-line bg-card">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <Avatar name={pro.name} size="xl" />
            <div className="min-w-0 flex-1">
              <h1 className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
                <span className="min-w-0 truncate">{pro.name}</span>
                {isVerifiedPro && (
                  <BadgeCheck
                    role="img"
                    className="size-6 shrink-0 text-brand-600"
                    aria-label={tc("badges.identityVerified")}
                  />
                )}
              </h1>
              <p className="mt-1 text-muted">{localized(pro.headline, locale)}</p>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted">
                <RatingStars rating={pro.rating} count={pro.ratingCount} />
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-4" aria-hidden />
                  {t("coverage", { city: cityName(pro.citySlug, locale), radius: pro.radiusKm })}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {pro.verified.map((kind) => (
                  <Badge key={kind} tone="brand">
                    <BadgeCheck className="size-3" aria-hidden />
                    {verificationLabels[kind]}
                  </Badge>
                ))}
                {pro.availableNow && (
                  <Badge tone="success">
                    <Zap className="size-3" aria-hidden />
                    {tc("badges.availableNow")}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 lg:pb-12">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start lg:gap-10">
          <div className="min-w-0">
            {/* Bandeau 3 stats */}
            <Card className="grid grid-cols-3 divide-x divide-line">
              {stats.map((stat) => (
                <div key={stat.key} className="px-2 py-4 text-center sm:px-4">
                  <p className="font-display text-xl font-bold tabular-nums sm:text-2xl">{stat.value}</p>
                  <p className="mt-0.5 text-xs text-muted">{stat.label}</p>
                </div>
              ))}
            </Card>

            {/* Shërbimet */}
            <section className="pt-10">
              <SectionHeading title={t("services")} />
              <Card className="divide-y divide-line">
                {pro.services.map((service) => {
                  const price = priceLabel(service);
                  return (
                    <div
                      key={localized(service.name, locale)}
                      className="flex items-center justify-between gap-4 px-4 py-3.5"
                    >
                      <p className="min-w-0 text-sm font-medium">{localized(service.name, locale)}</p>
                      {price && (
                        <p className="shrink-0 text-sm font-semibold tabular-nums text-brand-700">
                          {price}
                        </p>
                      )}
                    </div>
                  );
                })}
              </Card>
              <p className="mt-2 text-xs text-faint">{t("indicativePrices")}</p>
            </section>

            {/* Vlerësimet */}
            <section className="pt-10">
              <SectionHeading title={t("reviews")} />
              <Card className="p-5">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-10">
                  <div className="shrink-0 text-center sm:text-left">
                    <p className="font-display text-4xl font-bold tabular-nums">{pro.rating.toFixed(1)}</p>
                    <RatingStars rating={pro.rating} count={pro.ratingCount} className="mt-1" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-2.5">
                    {breakdownRows.map((row) => (
                      <div key={row.key} className="flex items-center gap-3">
                        <span className="w-28 shrink-0 text-xs text-muted sm:w-32">{row.label}</span>
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-wash">
                          <div
                            className="h-full rounded-full bg-brand-500"
                            style={{ width: `${(row.value / 5) * 100}%` }}
                          />
                        </div>
                        <span className="w-8 shrink-0 text-right text-xs font-semibold tabular-nums">
                          {row.value.toFixed(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {pro.reviews.length === 0 ? (
                <p className="mt-4 text-sm text-muted">{t("noReviewsYet")}</p>
              ) : (
                <div className="mt-4 space-y-4">
                  {pro.reviews.map((review) => (
                    <Card key={review.id} className="p-5">
                      <div className="flex items-center gap-3">
                        <Avatar name={review.author} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{review.author}</p>
                          <p className="text-xs text-faint">{formatAgo(review.daysAgo * 24, locale)}</p>
                        </div>
                        <RatingStars rating={review.rating} />
                      </div>
                      <p className="mt-3 text-sm leading-relaxed">{localized(review.text, locale)}</p>
                      {review.reply && (
                        <div className="mt-3 rounded-(--radius-field) bg-wash p-3">
                          <p className="text-xs font-semibold text-muted">{t("replyFromPro")}</p>
                          <p className="mt-1 text-sm leading-relaxed text-muted">
                            {localized(review.reply, locale)}
                          </p>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </section>

            {/* Rreth */}
            <section className="pt-10">
              <SectionHeading title={t("about")} />
              <Card className="p-5">
                <p className="text-sm leading-relaxed">{localized(pro.about, locale)}</p>
                <p className="mt-3 text-xs text-faint">
                  {tc("meta.memberSince", { year: pro.memberSince })}
                </p>
              </Card>
            </section>
          </div>

          {/* Colonne CTA — desktop */}
          <aside className="hidden lg:sticky lg:top-24 lg:block">
            <Card className="p-5">
              <div className="flex flex-col gap-2.5">
                <Button as={Link} href="/publiko" className="w-full">
                  {t("sendPrivateRequest")}
                </Button>
                <Button as={Link} href="/publiko" variant="outline" className="w-full">
                  {t("askQuote")}
                </Button>
              </div>
              <p className="mt-3 text-center text-xs text-faint">
                {tc("meta.respondsIn", { minutes: pro.avgResponseMin })}
              </p>
            </Card>
          </aside>
        </div>

        {/* Bandeau CTA sticky en bas — mobile */}
        <div className="sticky bottom-0 z-10 -mx-4 mt-8 border-t border-line bg-card/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:hidden">
          <div className="grid grid-cols-2 gap-2.5">
            <Button
              as={Link}
              href="/publiko"
              className="h-auto min-h-11 whitespace-normal px-3 py-2 text-sm leading-snug"
            >
              {t("sendPrivateRequest")}
            </Button>
            <Button
              as={Link}
              href="/publiko"
              variant="outline"
              className="h-auto min-h-11 whitespace-normal px-3 py-2 text-sm leading-snug"
            >
              {t("askQuote")}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
