import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { serviceCategories, rentalCategories } from "@allopuno/data";
import { SectionHeading } from "@/components/ui/SectionHeading";
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

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t("indexTitle")}</h1>
      <p className="mt-3 max-w-2xl text-base text-muted sm:text-lg">{t("indexSubtitle")}</p>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {serviceCategories.map((category) => (
          <CategoryCard key={category.slug} category={category} />
        ))}
      </div>

      {/* Kategoritë e qirasë — pointent vers /qira?kategoria=... via CategoryCard */}
      <section className="pt-14">
        <SectionHeading title={t("rentalTitle")} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {rentalCategories.map((category) => (
            <CategoryCard key={category.slug} category={category} />
          ))}
        </div>
      </section>
    </div>
  );
}
