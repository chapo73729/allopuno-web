import { setRequestLocale, getTranslations } from "next-intl/server";
import { BadgeCheck, HeartHandshake, Plus, Timer } from "lucide-react";
import { categories, serviceCategories } from "@allopuno/data";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SearchHero } from "@/components/site/SearchHero";
import { CategoryCard } from "@/components/cards/CategoryCard";
import { ProCard } from "@/components/cards/ProCard";
import { RequestCard } from "@/components/cards/RequestCard";
import { RentalCard } from "@/components/cards/RentalCard";
import { demoPros, demoRequests, demoRentals } from "@/lib/demo";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const tc = await getTranslations("common");

  const rentalEntry = categories.find((c) => c.slug === "qira-vegla");

  return (
    <>
      {/* Héros — CDC §7 : la promesse en une question */}
      <section className="border-b border-line bg-card">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-4 pb-14 pt-14 text-center sm:px-6 sm:pb-20 sm:pt-20">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
            <span className="text-brand-600">{t("hero.title")}</span>
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted sm:text-lg">{t("hero.subtitle")}</p>
          <div className="mt-8 w-full max-w-2xl">
            <SearchHero />
          </div>
          <div className="mt-8 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { icon: HeartHandshake, title: t("trust.free"), text: t("trust.freeDetail") },
              { icon: BadgeCheck, title: t("trust.verified"), text: t("trust.verifiedDetail") },
              { icon: Timer, title: t("trust.fast"), text: t("trust.fastDetail") }
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex items-center gap-3 rounded-xl bg-wash px-4 py-3 text-left">
                <Icon className="size-5 shrink-0 text-brand-600" aria-hidden />
                <div>
                  <p className="text-sm font-semibold leading-tight">{title}</p>
                  <p className="text-xs text-muted">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Catégories principales */}
        <section className="pt-12">
          <SectionHeading
            title={t("sections.categories")}
            action={
              <Link href="/sherbime" className="text-sm font-medium text-brand-700 hover:underline">
                {tc("actions.seeAll")}
              </Link>
            }
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {serviceCategories.map((category) => (
              <CategoryCard key={category.slug} category={category} />
            ))}
            {rentalEntry && <CategoryCard category={rentalEntry} />}
          </div>
        </section>

        {/* Kërkesa pranë teje */}
        <section className="pt-14">
          <SectionHeading
            title={t("sections.nearRequests")}
            action={
              <Link href="/kerko?tab=kerkesa" className="text-sm font-medium text-brand-700 hover:underline">
                {tc("actions.seeAll")}
              </Link>
            }
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {demoRequests.slice(0, 4).map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>
        </section>

        {/* Profesionistët pranë teje */}
        <section className="pt-14">
          <SectionHeading
            title={t("sections.nearPros")}
            action={
              <Link href="/kerko" className="text-sm font-medium text-brand-700 hover:underline">
                {tc("actions.seeAll")}
              </Link>
            }
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {demoPros.slice(0, 4).map((pro) => (
              <ProCard key={pro.id} pro={pro} />
            ))}
          </div>
        </section>

        {/* Qira pranë teje */}
        <section className="pt-14">
          <SectionHeading
            title={t("sections.nearRentals")}
            action={
              <Link href="/qira" className="text-sm font-medium text-brand-700 hover:underline">
                {tc("actions.seeAll")}
              </Link>
            }
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {demoRentals.slice(0, 4).map((rental) => (
              <RentalCard key={rental.id} rental={rental} />
            ))}
          </div>
        </section>

        {/* Si funksionon */}
        <section className="pt-16">
          <SectionHeading title={t("how.title")} />
          <div className="grid gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((step) => (
              <div key={step} className="rounded-(--radius-card) border border-line bg-card p-6">
                <span className="inline-flex size-9 items-center justify-center rounded-full bg-brand-600 font-display text-sm font-bold text-white">
                  {step}
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold">
                  {t(`how.step${step}Title` as never)}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  {t(`how.step${step}Text` as never)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA professionnels */}
        <section className="pt-16">
          <div className="flex flex-col items-start gap-5 rounded-2xl bg-brand-950 px-6 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-10">
            <div>
              <h2 className="font-display text-2xl font-bold text-white">{t("proCta.title")}</h2>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-brand-200">{t("proCta.text")}</p>
            </div>
            <Button as={Link} href="/regjistrohu?si=profesionist" size="lg" variant="inverse" className="shrink-0">
              <Plus className="size-5" aria-hidden />
              {t("proCta.button")}
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
