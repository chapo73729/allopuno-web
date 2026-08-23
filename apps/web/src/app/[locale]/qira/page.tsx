import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Megaphone, PackageSearch, Plus, Sparkles } from "lucide-react";
import { rentalCategories } from "@allopuno/data";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { RentalCard } from "@/components/cards/RentalCard";
import { demoRentals } from "@/lib/demo";
import { localized } from "@/lib/format";
import { cn } from "@/lib/cn";

/**
 * Les noms des catégories de location portent le préfixe « Qira: » / « Rent: »
 * dans la taxonomie — redondant sur la page /qira, on n'affiche que la partie
 * après les deux-points (repli sur le nom complet si le motif change).
 */
function shortCategoryName(name: string): string {
  const separator = name.indexOf(": ");
  return separator === -1 ? name : name.slice(separator + 2);
}

const chipBase =
  "inline-flex items-center rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors";
const chipActive = "border-brand-600 bg-brand-600 text-white shadow-[0_1px_2px_rgb(34_64_221/0.3)]";
const chipIdle = "border-line bg-card text-muted hover:border-brand-300 hover:text-brand-700";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "rentals" });
  return { title: t("indexTitle"), description: t("indexSubtitle") };
}

export default async function RentalsIndexPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ kategoria?: string | string[] }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  // La lecture de searchParams rend la page dynamique — accepté pour ce listing filtrable.
  const sp = await searchParams;
  const t = await getTranslations("rentals");

  const requested = typeof sp.kategoria === "string" ? sp.kategoria : undefined;
  const activeCategory = rentalCategories.find((category) => category.slug === requested);
  const rentals = activeCategory
    ? demoRentals.filter((rental) => rental.categorySlug === activeCategory.slug)
    : demoRentals;

  return (
    <>
      {/* ============ INTRO ÉDITORIALE ============ */}
      <section className="relative overflow-hidden border-b border-line bg-card">
        <div className="bg-hero-wash absolute inset-0" aria-hidden />
        <div className="bg-grid absolute inset-0 opacity-60" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 pb-8 pt-10 sm:px-6 sm:pb-10 sm:pt-14">
          <div className="animate-fade-up max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
              <PackageSearch className="size-3.5" aria-hidden />
              {t("indexEyebrow")}
            </span>
            <h1 className="mt-4 text-3xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
              <span className="text-gradient">{t("indexTitle")}</span>
            </h1>
            <p className="mt-3 max-w-2xl text-base text-muted sm:text-lg">{t("indexSubtitle")}</p>
          </div>

          {/* Filtres par catégorie — rendus côté serveur, l'état vit dans l'URL */}
          <nav
            aria-label={t("filterByCategory")}
            className="animate-fade-up delay-1 mt-7 flex flex-wrap gap-2"
          >
            <Link
              href="/qira"
              aria-current={activeCategory ? undefined : "page"}
              className={cn(chipBase, activeCategory ? chipIdle : chipActive)}
            >
              {t("allCategories")}
            </Link>
            {rentalCategories.map((category) => {
              const isActive = activeCategory?.slug === category.slug;
              return (
                <Link
                  key={category.slug}
                  href={`/qira?kategoria=${category.slug}`}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(chipBase, isActive ? chipActive : chipIdle)}
                >
                  {shortCategoryName(localized(category.name, locale))}
                </Link>
              );
            })}
          </nav>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pt-10">
        {/* Compte honnête d'offres (CDC §103) */}
        <p className="text-sm font-medium text-muted">{t("resultsCount", { count: rentals.length })}</p>

        {/* Annonces — état honnête si la catégorie est vide (CDC §103) */}
        <section className="mt-5">
          {rentals.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rentals.map((rental, i) => (
                <div key={rental.id} className={cn("animate-fade-up", `delay-${(i % 4) + 1}`)}>
                  <RentalCard rental={rental} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<PackageSearch aria-hidden />}
              title={t("emptyTitle")}
              text={t("emptyText")}
              action={
                <Button as={Link} href="/publiko">
                  <Plus className="size-5" aria-hidden />
                  {t("requestCardButton")}
                </Button>
              }
            />
          )}
        </section>

        {/* Demande de location inversée (CDC §36) */}
        <section className="pt-14">
          <Card className="relative overflow-hidden">
            <div className="bg-hero-wash absolute inset-0" aria-hidden />
            <div className="relative flex flex-col items-start gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div className="flex items-start gap-4">
                <span className="hidden size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-(--shadow-brand) sm:inline-flex">
                  <Megaphone className="size-6" aria-hidden />
                </span>
                <div>
                  <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-brand-700">
                    <Sparkles className="size-3.5" aria-hidden />
                    {t("requestCardEyebrow")}
                  </p>
                  <h2 className="mt-1.5 font-display text-xl font-bold">{t("postRentalRequest")}</h2>
                  <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-muted">{t("requestCardText")}</p>
                </div>
              </div>
              <Button as={Link} href="/publiko" className="shrink-0">
                <Plus className="size-5" aria-hidden />
                {t("requestCardButton")}
              </Button>
            </div>
          </Card>
        </section>
      </div>
    </>
  );
}
