import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { KeyRound, MapPin, Truck } from "lucide-react";
import { findCategory, findSubcategory } from "@allopuno/data";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { RatingStars } from "@/components/ui/RatingStars";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CategoryIcon } from "@/components/CategoryIcon";
import { RentalCard } from "@/components/cards/RentalCard";
import { AvailabilityDays } from "./AvailabilityDays";
import { demoRentals } from "@/lib/demo";
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
  // La démo n'a pas de champ transport : règle déterministe (une annonce sur
  // deux) pour montrer « Transporti i mundshëm » sans inventer une donnée.
  const hasDelivery = rentalIndex % 2 === 0;
  const askHref = `/publiko?q=${encodeURIComponent(rental.title.sq)}`;
  const similar = demoRentals
    .filter((item) => item.categorySlug === rental.categorySlug && item.id !== rental.id)
    .slice(0, 3);

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 pb-28 pt-8 sm:px-6 sm:pb-16 sm:pt-12">
        <div className="max-w-3xl">
          {/* Galerie factice — bandeau gradient avec l'icône de catégorie */}
          <div className="flex h-56 items-center justify-center rounded-(--radius-card) border border-line bg-gradient-to-br from-brand-50 to-wash">
            {category && <CategoryIcon name={category.icon} className="size-20 text-brand-300" />}
          </div>

          <h1 className="mt-6 text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted">
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

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge tone="brand" className="px-3 py-1 text-sm font-semibold">
              {t("perDay", { price: rental.pricePerDay })}
            </Badge>
            {rental.deposit != null ? (
              <Badge tone="neutral">{t("deposit", { amount: rental.deposit })}</Badge>
            ) : (
              <Badge tone="success">{t("noDeposit")}</Badge>
            )}
          </div>

          {/* CTA en flux pour tablette/desktop — le mobile a la barre sticky en bas */}
          <div className="mt-6 hidden sm:block">
            <Button as={Link} href={askHref} size="lg">
              <KeyRound className="size-5" aria-hidden />
              {t("askToRent")}
            </Button>
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

      {/* CTA sticky mobile */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card/95 px-4 py-3 backdrop-blur sm:hidden">
        <Button as={Link} href={askHref} className="w-full">
          <KeyRound className="size-5" aria-hidden />
          {t("askToRent")}
        </Button>
      </div>
    </>
  );
}
