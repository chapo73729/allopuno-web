import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { LayoutGrid } from "lucide-react";
import { serviceCategories, rentalCategories } from "@allopuno/data";
import { CategoryCard } from "@/components/cards/CategoryCard";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "categories" });
  return { title: t("indexTitle"), description: t("indexSubtitle") };
}

export default async function ServicesIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("categories");

  const subcategoryCount = serviceCategories.reduce((total, c) => total + c.children.length, 0);
  const stats = [
    { value: String(serviceCategories.length), label: t("statCategories") },
    { value: `${subcategoryCount}+`, label: t("statSubcategories") },
    { value: "100%", label: t("statFree") }
  ];

  return (
    <>
      {/* Intro visuelle éditoriale */}
      <section className="relative overflow-hidden border-b border-line bg-card">
        <div className="bg-hero-wash absolute inset-0" aria-hidden />
        <div className="bg-grid absolute inset-0 opacity-60" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-12 sm:px-6 sm:pb-12 sm:pt-16">
          <div className="animate-fade-up max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
              <LayoutGrid className="size-3.5" aria-hidden />
              {t("indexBadge")}
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
              <span className="text-gradient">{t("indexTitle")}</span>
            </h1>
            <p className="mt-4 text-base text-muted sm:text-lg">{t("indexSubtitle")}</p>
          </div>
          <dl className="animate-fade-up delay-1 mt-8 grid max-w-lg grid-cols-3 gap-3 sm:gap-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-(--radius-card) border border-line bg-card/70 px-3 py-3 text-center shadow-(--shadow-card) backdrop-blur sm:px-4"
              >
                <dt className="font-display text-2xl font-extrabold text-brand-700 sm:text-3xl">{s.value}</dt>
                <dd className="mt-0.5 text-xs font-medium text-muted">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-12">
        {/* Grille des catégories de services */}
        <div className="animate-fade-up grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {serviceCategories.map((category) => (
            <CategoryCard key={category.slug} category={category} />
          ))}
        </div>

        {/* Kategoritë e qirasë — pointent vers /qira?kategoria=... via CategoryCard */}
        <section className="pt-14">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold sm:text-3xl">{t("rentalTitle")}</h2>
            <p className="mt-1.5 text-muted">{t("rentalSubtitle")}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {rentalCategories.map((category) => (
              <CategoryCard key={category.slug} category={category} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
