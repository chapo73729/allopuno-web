import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { BadgeCheck, CheckCircle2, Clock, MapPin, Percent, ShieldCheck, Zap } from "lucide-react";
import { categories } from "@allopuno/data";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Photo } from "@/components/ui/Photo";
import { RatingStars } from "@/components/ui/RatingStars";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CategoryIcon } from "@/components/CategoryIcon";
import { demoPros, findPro } from "@/lib/demo";
import type { DemoService, Localized, VerificationKind } from "@/lib/demo";
import { categoryPhoto } from "@/lib/media";
import { cityName, formatAgo, localized } from "@/lib/format";

export function generateStaticParams() {
  return demoPros.map((pro) => ({ id: pro.id }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const pro = findPro(id);
  if (!pro) return {};
  return { title: pro.name, description: localized(pro.headline, locale) };
}

// Dégradés doux (famille brand) pour les tuiles de portfolio sans photo réelle.
const tileGradients = [
  "linear-gradient(135deg,#f0f3fe 0%,#c3cefb 100%)",
  "linear-gradient(135deg,#e1e7fd 0%,#9daef7 100%)",
  "linear-gradient(140deg,#f0f4fa 0%,#c3cefb 100%)",
  "linear-gradient(150deg,#eef1ff 0%,#9daef7 130%)",
  "linear-gradient(135deg,#f0f3fe 0%,#6f87f0 135%)",
  "linear-gradient(150deg,#e6ebff 0%,#c3cefb 100%)"
];

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
    { key: "jobs", icon: CheckCircle2, value: `${pro.jobsDone}`, label: t("stats.jobs") },
    {
      key: "responseRate",
      icon: Percent,
      value: t("stats.percent", { rate: pro.responseRate }),
      label: t("stats.responseRate")
    },
    {
      key: "avgResponse",
      icon: Clock,
      value: t("stats.minutes", { minutes: pro.avgResponseMin }),
      label: t("stats.avgResponse")
    }
  ];

  // Couverture : photo de catégorie si disponible, sinon dégradé brand.
  const coverPhoto = categoryPhoto(pro.categorySlug);
  const category = categories.find((c) => c.slug === pro.categorySlug);
  const categoryIcon = category?.icon ?? "Hammer";

  // Portfolio : le pro n'a pas de photos réelles ⇒ tuiles dégradées légendées
  // avec ses spécialités (sous-catégories) + services, sans doublon.
  const subNameBySlug = new Map<string, Localized>();
  for (const c of categories) for (const sub of c.children) subNameBySlug.set(sub.slug, sub.name);
  const portfolioSource: Localized[] = [
    ...pro.subSlugs.map((slug) => subNameBySlug.get(slug)).filter((n): n is Localized => Boolean(n)),
    ...pro.services.map((s) => s.name)
  ];
  const seen = new Set<string>();
  const portfolio = portfolioSource
    .filter((n) => {
      const k = localized(n, locale);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .slice(0, 6);

  return (
    <>
      {/* ============ COUVERTURE ============ */}
      <div className="relative h-40 overflow-hidden sm:h-52 lg:h-60">
        {coverPhoto ? (
          <>
            <div className="absolute inset-0">
              <Photo src={coverPhoto} alt="" className="h-full w-full" />
            </div>
            <div className="bg-brand-gradient absolute inset-0 opacity-90" aria-hidden />
          </>
        ) : (
          <div className="bg-brand-gradient absolute inset-0" aria-hidden />
        )}
        <div className="bg-grid absolute inset-0 opacity-40" aria-hidden />
        <div
          className="animate-float absolute -right-12 -top-16 size-56 rounded-full bg-white/10 blur-3xl"
          aria-hidden
        />
        <div
          className="absolute -left-10 bottom-[-4rem] size-48 rounded-full bg-brand-400/20 blur-3xl"
          aria-hidden
        />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* ============ EN-TÊTE (repose sur la couverture) ============ */}
        <header className="relative -mt-16 sm:-mt-20">
          <Card className="animate-fade-up p-5 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <Avatar
                name={pro.name}
                size="xl"
                className="shrink-0 ring-4 ring-brand-50 shadow-(--shadow-card)"
              />
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
                <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted">
                  <RatingStars rating={pro.rating} count={pro.ratingCount} />
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-4" aria-hidden />
                    {t("coverage", { city: cityName(pro.citySlug, locale), radius: pro.radiusKm })}
                  </span>
                </div>
                <div className="mt-3.5 flex flex-wrap gap-1.5">
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
          </Card>
        </header>

        <div className="pt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start lg:gap-10 lg:pb-12">
          <div className="min-w-0">
            {/* Bandeau 3 stats — cartes soignées */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
              {stats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <Card
                    key={stat.key}
                    className={`animate-fade-up delay-${i + 1} flex flex-col items-center gap-1.5 p-3 text-center sm:p-4`}
                  >
                    <span className="inline-flex size-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                      <Icon className="size-4.5" aria-hidden />
                    </span>
                    <p className="font-display text-lg font-bold tabular-nums leading-none sm:text-2xl">
                      {stat.value}
                    </p>
                    <p className="text-[0.7rem] leading-tight text-muted sm:text-xs">{stat.label}</p>
                  </Card>
                );
              })}
            </div>

            {/* Shërbimet */}
            <section className="pt-10">
              <SectionHeading title={t("services")} />
              <Card className="divide-y divide-line overflow-hidden">
                {pro.services.map((service) => {
                  const price = priceLabel(service);
                  return (
                    <div
                      key={localized(service.name, locale)}
                      className="flex items-center justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-paper"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                          <CategoryIcon name={categoryIcon} className="size-4" />
                        </span>
                        <p className="min-w-0 truncate text-sm font-medium">
                          {localized(service.name, locale)}
                        </p>
                      </div>
                      {price && (
                        <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-1 text-sm font-semibold tabular-nums text-brand-700">
                          {price}
                        </span>
                      )}
                    </div>
                  );
                })}
              </Card>
              <p className="mt-2 text-xs text-faint">{t("indicativePrices")}</p>
            </section>

            {/* Reputacioni — moyenne + barres des 5 axes */}
            <section className="pt-10">
              <SectionHeading title={t("reputation")} />
              <Card className="p-5 sm:p-6">
                <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
                  <div className="shrink-0 text-center sm:w-40 sm:text-left">
                    <p className="font-display text-5xl font-bold tabular-nums leading-none text-ink">
                      {pro.rating.toFixed(1)}
                    </p>
                    <RatingStars rating={pro.rating} className="mt-2" />
                    <p className="mt-2 text-xs text-muted">
                      {tc("meta.reviews", { count: pro.ratingCount })}
                    </p>
                  </div>
                  <div className="hidden w-px shrink-0 bg-line sm:block" aria-hidden />
                  <div className="min-w-0 flex-1 space-y-3">
                    {breakdownRows.map((row) => (
                      <div key={row.key} className="flex items-center gap-3">
                        <span className="w-24 shrink-0 text-xs text-muted sm:w-32">{row.label}</span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-wash">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400"
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
            </section>

            {/* Portofoli — tuiles dégradées légendées (pas de photos réelles) */}
            <section className="pt-10">
              <SectionHeading title={t("portfolio")} />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {portfolio.map((item, i) => (
                  <div
                    key={localized(item, locale)}
                    className={`animate-fade-up delay-${(i % 4) + 1} group/tile relative overflow-hidden rounded-(--radius-card) border border-line shadow-(--shadow-card) transition-all duration-300 hover:-translate-y-1 hover:shadow-(--shadow-pop)`}
                  >
                    <Photo
                      src={undefined}
                      alt={localized(item, locale)}
                      className="aspect-[4/3] w-full transition-transform duration-500 group-hover/tile:scale-105"
                      fallback={
                        <div
                          className="flex size-full items-center justify-center"
                          style={{ backgroundImage: tileGradients[i % tileGradients.length] }}
                        >
                          <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-card/70 text-brand-700 shadow-(--shadow-card) backdrop-blur">
                            <CategoryIcon name={categoryIcon} className="size-6" />
                          </span>
                        </div>
                      }
                    />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-card/95 to-transparent p-3 pt-8">
                      <p className="font-display text-sm font-semibold leading-tight text-ink">
                        {localized(item, locale)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-faint">{t("portfolioNote")}</p>
            </section>

            {/* Vlerësimet */}
            <section className="pt-10">
              <SectionHeading title={t("reviews")} />
              {pro.reviews.length === 0 ? (
                <Card className="p-5">
                  <p className="text-sm text-muted">{t("noReviewsYet")}</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {pro.reviews.map((review) => (
                    <Card
                      key={review.id}
                      className="p-5 transition-shadow duration-300 hover:shadow-(--shadow-pop)"
                    >
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
                        <div className="mt-3 rounded-(--radius-field) border border-line bg-wash p-3">
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
              {pro.availableNow && (
                <Badge tone="success" className="mb-3">
                  <Zap className="size-3" aria-hidden />
                  {tc("badges.availableNow")}
                </Badge>
              )}
              <div className="flex flex-col gap-2.5">
                <Button as={Link} href="/publiko" className="w-full">
                  {t("sendPrivateRequest")}
                </Button>
                <Button as={Link} href="/publiko" variant="outline" className="w-full">
                  {t("askQuote")}
                </Button>
              </div>
              <div className="mt-4 space-y-2 border-t border-line pt-4 text-xs text-muted">
                <p className="flex items-center gap-2">
                  <Clock className="size-3.5 shrink-0 text-brand-600" aria-hidden />
                  {tc("meta.respondsIn", { minutes: pro.avgResponseMin })}
                </p>
                <p className="flex items-center gap-2">
                  <ShieldCheck className="size-3.5 shrink-0 text-brand-600" aria-hidden />
                  {t("coverage", { city: cityName(pro.citySlug, locale), radius: pro.radiusKm })}
                </p>
              </div>
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
