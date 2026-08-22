import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Bell, ChevronDown, Plus, UserSearch } from "lucide-react";
import { findCategory, serviceCategories } from "@allopuno/data";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EmptyState } from "@/components/ui/EmptyState";
import { CategoryIcon } from "@/components/CategoryIcon";
import { ProCard } from "@/components/cards/ProCard";
import { RequestCard } from "@/components/cards/RequestCard";
import { demoPros, demoRequests } from "@/lib/demo";
import { localized } from "@/lib/format";

interface FaqEntry {
  q: string;
  a: string;
}

export function generateStaticParams() {
  return serviceCategories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const category = findCategory(slug);
  if (!category || category.kind !== "service") return {};
  return {
    title: localized(category.name, locale),
    description: localized(category.description, locale)
  };
}

export default async function ServiceCategoryPage({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const category = findCategory(slug);
  if (!category || category.kind !== "service") {
    notFound();
  }

  const t = await getTranslations("categories");
  const name = localized(category.name, locale);
  const description = localized(category.description, locale);
  const pros = demoPros.filter((pro) => pro.categorySlug === category.slug);
  const requests = demoRequests.filter((request) => request.categorySlug === category.slug).slice(0, 4);
  const faq = ((t.raw(`faq.${category.slug}`) as FaqEntry[] | undefined) ?? []).slice(0, 3);

  // JSON-LD construit uniquement à partir de la taxonomie et des catalogues i18n — aucun contenu utilisateur.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name,
        description,
        areaServed: "Kosovo",
        provider: { "@type": "Organization", name: "AlloPuno" }
      },
      {
        "@type": "FAQPage",
        mainEntity: faq.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a }
        }))
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Héros catégorie */}
      <section className="border-b border-line bg-card">
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-10 sm:px-6 sm:pb-14 sm:pt-14">
          <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <CategoryIcon name={category.icon} className="size-7" />
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">{name}</h1>
          <p className="mt-3 max-w-2xl text-base text-muted sm:text-lg">{description}</p>
          <div className="mt-6">
            <Button as={Link} href={`/publiko?q=${encodeURIComponent(category.name.sq)}`} size="lg">
              <Plus className="size-5" aria-hidden />
              {t("publishInCategory", { category: name })}
            </Button>
          </div>

          {/* Nënkategoritë — chips non cliquables pour l'instant */}
          <h2 className="sr-only">{t("subcategories")}</h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {category.children.map((sub) => (
              <span
                key={sub.slug}
                className="rounded-full border border-line bg-wash px-3 py-1 text-sm text-muted"
              >
                {localized(sub.name, locale)}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        {/* Profesionistë të kategorisë */}
        <section className="pt-12">
          <SectionHeading title={t("prosInCategory", { category: name })} />
          {pros.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {pros.map((pro) => (
                <ProCard key={pro.id} pro={pro} />
              ))}
            </div>
          ) : (
            /* État honnête (CDC §103) : pas de fausse abondance */
            <EmptyState
              icon={<UserSearch aria-hidden />}
              title={t("emptyPros")}
              action={
                <Button type="button" variant="secondary">
                  <Bell className="size-4" aria-hidden />
                  {t("emptyProsNotify")}
                </Button>
              }
            />
          )}
        </section>

        {/* Kërkesa të fundit */}
        {requests.length > 0 && (
          <section className="pt-14">
            <SectionHeading title={t("requestsInCategory")} />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {requests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          </section>
        )}

        {/* FAQ SEO */}
        {faq.length > 0 && (
          <section className="pt-14">
            <SectionHeading title={t("faqTitle")} />
            <div className="flex max-w-3xl flex-col gap-3">
              {faq.map((item) => (
                <details
                  key={item.q}
                  className="group rounded-(--radius-card) border border-line bg-card shadow-(--shadow-card)"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 font-display font-semibold [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <ChevronDown
                      className="size-4 shrink-0 text-faint transition-transform group-open:rotate-180"
                      aria-hidden
                    />
                  </summary>
                  <p className="px-5 pb-5 text-sm leading-relaxed text-muted">{item.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
