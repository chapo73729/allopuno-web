import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ChevronLeft, KeyRound, MapPin, Truck } from "lucide-react";
import { findCategory, findSubcategory } from "@allopuno/data";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { RatingStars } from "@/components/ui/RatingStars";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CategoryIcon } from "@/components/CategoryIcon";
import { Photo } from "@/components/ui/Photo";
import { RentalCard } from "@/components/cards/RentalCard";
import { AvailabilityDays } from "./AvailabilityDays";
import { demoRentals } from "@/lib/demo";
import { categoryPhoto } from "@/lib/media";
import { cityName, localized } from "@/lib/format";

export function generateStaticParams() {
  return demoRentals.map((rental) => ({ id: rental.id }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const rental = demoRentals.find((item) => item.id === id);
  if (!rental) return {};
  return { title: localized(rental.title, locale) };
}

/** Retire le préfixe « Qira: » / « Rent: » du nom de catégorie pour la puce. */
function shortCategoryName(name: string): string {
  const separator = name.indexOf(": ");
  return separator === -1 ? name : name.slice(separator + 2);
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3.5">
      <dt className="shrink-0 text-sm text-muted">{label}</dt>
      <dd className="text-right text-sm font-medium">{children}</dd>
    </div>
  );
}

export default async function RentalDetailPage({
  params
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const rentalIndex = demoRentals.findIndex((item) => item.id === id);
  const rental = rentalIndex === -1 ? undefined : demoRentals[rentalIndex];
  if (!rental) {
    notFound();
  }

  const t = await getTranslations("rentals");
  const tc = await getTranslations("common");

  const category = findCategory(rental.categorySlug);
  const subMatch = findSubcategory(rental.subSlug);
  const title = localized(rental.title, locale);
  const photo = categoryPhoto(rental.categorySlug);
  // La démo n'a pas de champ transport : règle déterministe (une annonce sur
  // deux) pour montrer « Transporti i mundshëm » sans inventer une donnée.
  const hasDelivery = rentalIndex % 2 === 0;
  const askHref = `/publiko?q=${encodeURIComponent(rental.title.sq)}`;
  const similar = demoRentals
    .filter((item) => item.categorySlug === rental.categorySlug && item.id !== rental.id)
    .slice(0, 3);

  const meta = (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted">
      <span className="inline-flex items-center gap-1">
        <MapPin className="size-4" aria-hidden />
        {cityName(rental.citySlug, locale)} · {tc("meta.distanceKm", { km: rental.distanceKm })}
      </span>
      {rental.year != null && (
        <span className="tabular-nums">
          {t("year")} {rental.year}
        </span>
      )}
      {rental.rating != null && <RatingStars rating={rental.rating} count={rental.ratingCount} />}
    </div>
  );

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6 sm:pt-8 lg:pb-16">
        {/* Fil d'Ariane */}
        <Link
          href="/qira"
          className="inline-flex items-center gap-1 text-sm font-medium text-muted transition-colors hover:text-brand-700"
        >
          <ChevronLeft className="size-4" aria-hidden />
          {t("backToRentals")}
        </Link>

        <div className="mt-4 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          {/* ============ COLONNE PRINCIPALE ============ */}
          <div className="min-w-0">
            {/* Galerie héros */}
            <div className="animate-fade-up relative">
              <Photo
                src={photo}
                alt={title}
                priority
                overlay
                className="aspect-[4/3] w-full rounded-(--radius-card) shadow-(--shadow-card) sm:aspect-[16/10]"
                fallback={category && <CategoryIcon name={category.icon} className="size-20 text-brand-300" />}
              />
              {category && (
                <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-card/95 px-3 py-1 text-xs font-semibold text-brand-700 shadow-(--shadow-card) backdrop-blur">
                  <CategoryIcon name={category.icon} className="size-3.5" />
                  {shortCategoryName(localized(category.name, locale))}
                </span>
              )}
            </div>

            <h1 className="mt-6 text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
            <div className="mt-3">{meta}</div>

            {/* Badges prix — visibles en flux à toutes les tailles */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Badge tone="brand" className="px-3 py-1 text-sm font-semibold">
                {t("perDay", { price: rental.pricePerDay })}
              </Badge>
              {rental.deposit != null ? (
                <Badge tone="neutral">{t("deposit", { amount: rental.deposit })}</Badge>
              ) : (
                <Badge tone="success">{t("noDeposit")}</Badge>
              )}
              {hasDelivery && (
                <Badge tone="success" className="gap-1.5">
                  <Truck className="size-3.5" aria-hidden />
                  {t("delivery")}
                </Badge>
              )}
            </div>

            {/* Fiche caractéristiques */}
            <section className="mt-10">
              <SectionHeading title={t("details")} />
              <Card>
                <dl className="divide-y divide-line">
                  <DetailRow label={t("category")}>
                    {category ? localized(category.name, locale) : rental.categorySlug}
                  </DetailRow>
                  {subMatch && (
                    <DetailRow label={t("subcategory")}>{localized(subMatch.sub.name, locale)}</DetailRow>
                  )}
                  {rental.year != null && (
                    <DetailRow label={t("year")}>
                      <span className="tabular-nums">{rental.year}</span>
                    </DetailRow>
                  )}
                  <DetailRow label={t("owner")}>
                    <span className="inline-flex items-center gap-2">
                      <Avatar name={rental.ownerName} size="sm" />
                      {rental.ownerName}
                    </span>
                  </DetailRow>
                </dl>
                {hasDelivery && (
                  <p className="flex items-center gap-2 border-t border-line px-5 py-3.5 text-sm font-medium text-success">
                    <Truck className="size-4" aria-hidden />
                    {t("delivery")}
                  </p>
                )}
              </Card>
            </section>

            {/* Disponibilité */}
            <section className="mt-10">
              <SectionHeading title={t("availability")} />
              <Card className="p-5">
                <p className="text-sm text-muted">{t("next14Days")}</p>
                <AvailabilityDays />
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="size-3 rounded border border-line bg-card" aria-hidden />
                    {t("legendAvailable")}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="size-3 rounded bg-wash" aria-hidden />
                    {t("legendBooked")}
                  </span>
                </div>
              </Card>
            </section>
          </div>

          {/* ============ ASIDE STICKY (desktop) ============ */}
          <aside className="hidden lg:block">
            <div className="animate-fade-up delay-1 sticky top-24">
              <Card className="p-6">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display text-3xl font-extrabold text-brand-700 tabular-nums">
                    €{rental.pricePerDay}
                  </span>
                  <span className="text-sm text-muted">{t("perDayLabel")}</span>
                </div>

                <div className="mt-3">
                  {rental.deposit != null ? (
                    <Badge tone="neutral">{t("deposit", { amount: rental.deposit })}</Badge>
                  ) : (
                    <Badge tone="success">{t("noDeposit")}</Badge>
                  )}
                </div>

                {rental.rating != null && (
                  <div className="mt-4 border-t border-line pt-4">
                    <RatingStars rating={rental.rating} count={rental.ratingCount} />
                  </div>
                )}

                <div className="mt-4 flex items-center gap-3 border-t border-line pt-4">
                  <Avatar name={rental.ownerName} size="md" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted">{t("owner")}</p>
                    <p className="truncate font-medium">{rental.ownerName}</p>
                  </div>
                </div>

                <Button as={Link} href={askHref} size="lg" className="mt-5 w-full">
                  <KeyRound className="size-5" aria-hidden />
                  {t("askToRent")}
                </Button>

                {hasDelivery && (
                  <p className="mt-3 flex items-center justify-center gap-1.5 text-xs font-medium text-success">
                    <Truck className="size-3.5" aria-hidden />
                    {t("delivery")}
                  </p>
                )}
              </Card>
            </div>
          </aside>
        </div>

        {/* Annonces similaires */}
        {similar.length > 0 && (
          <section className="pt-14">
            <SectionHeading title={t("similar")} />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((item) => (
                <RentalCard key={item.id} rental={item} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* CTA sticky mobile + tablette (l'aside prend le relais en lg) */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-line bg-card/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="shrink-0">
          <p className="font-display text-lg font-extrabold leading-none text-brand-700 tabular-nums">
            €{rental.pricePerDay}
          </p>
          <p className="text-[0.7rem] text-muted">{t("perDayLabel")}</p>
        </div>
        <Button as={Link} href={askHref} className="flex-1">
          <KeyRound className="size-5" aria-hidden />
          {t("askToRent")}
        </Button>
      </div>
    </>
  );
}
