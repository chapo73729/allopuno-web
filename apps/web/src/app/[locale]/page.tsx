import { setRequestLocale, getTranslations } from "next-intl/server";
import { BadgeCheck, Clock, HeartHandshake, MapPin, Plus, Scale, ShieldCheck, Sparkles, Star, Timer } from "lucide-react";
import { categories, serviceCategories, launchCities, cities } from "@allopuno/data";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Photo } from "@/components/ui/Photo";
import { SearchHero } from "@/components/site/SearchHero";
import { CategoryCard } from "@/components/cards/CategoryCard";
import { ProCard } from "@/components/cards/ProCard";
import { RequestCard } from "@/components/cards/RequestCard";
import { RentalCard } from "@/components/cards/RentalCard";
import { demoPros, demoRequests, demoRentals } from "@/lib/demo";
import { media } from "@/lib/media";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const tc = await getTranslations("common");
  const rentalEntry = categories.find((c) => c.slug === "qira-vegla");

  const stats = [
    { value: String(launchCities.length), label: t("stats.cities") },
    { value: `${serviceCategories.length}+`, label: t("stats.categories") },
    { value: t("stats.freeValue"), label: t("stats.free") },
    { value: t("stats.responseValue"), label: t("stats.response") }
  ];

  const why = [
    { icon: BadgeCheck, title: t("why.point1Title"), text: t("why.point1Text") },
    { icon: Scale, title: t("why.point2Title"), text: t("why.point2Text") },
    { icon: Star, title: t("why.point3Title"), text: t("why.point3Text") }
  ];

  return (
    <>
      {/* ============ HÉROS ============ */}
      <section className="relative overflow-hidden border-b border-line bg-card">
        <div className="bg-hero-wash absolute inset-0" aria-hidden />
        <div className="bg-grid absolute inset-0 opacity-70" aria-hidden />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 pb-14 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12">
          {/* Colonne texte */}
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
              <Sparkles className="size-3.5" aria-hidden />
              {t("hero.badge")}
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
              <span className="text-gradient">{t("hero.title")}</span>
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted sm:text-lg">{t("hero.subtitle")}</p>
            <div className="mt-7 max-w-xl">
              <SearchHero />
            </div>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              {[
                { icon: HeartHandshake, label: t("trust.free") },
                { icon: BadgeCheck, label: t("trust.verified") },
                { icon: Timer, label: t("trust.fast") }
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-1.5 font-medium text-ink">
                  <Icon className="size-4 text-brand-600" aria-hidden />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Colonne visuelle */}
          <div className="animate-fade-up delay-2 relative">
            <Photo
              src={media.hero}
              alt={t("hero.title")}
              priority
              overlay
              className="aspect-[4/3] w-full rounded-3xl shadow-(--shadow-pop) sm:aspect-[5/4]"
              fallback={<Sparkles className="size-10 text-brand-300" />}
            />
            {/* Carte "kërkesë e re" flottante */}
            <div className="animate-float absolute -bottom-5 -left-3 w-64 max-w-[85%] rounded-2xl border border-line bg-card/95 p-3.5 shadow-(--shadow-pop) backdrop-blur sm:-left-6">
              <div className="flex items-center gap-2">
                <span className="inline-flex size-9 items-center justify-center rounded-xl bg-brand-600 text-white">
                  <MapPin className="size-4" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-[0.7rem] font-medium uppercase tracking-wide text-faint">{t("hero.liveTitle")}</p>
                  <p className="truncate text-sm font-semibold">{t("hero.liveCategory")}</p>
                </div>
              </div>
              <div className="mt-2.5 flex items-center justify-between text-xs text-muted">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3.5" aria-hidden />
                  {t("hero.liveLocation")}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-3.5" aria-hidden />
                  {t("hero.liveTime")}
                </span>
              </div>
              <div className="mt-2.5 flex items-center justify-between">
                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">
                  {t("hero.liveBudget")}
                </span>
                <span className="text-xs font-semibold text-success">{t("hero.liveRespond")} →</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bandeau stats */}
        <div className="relative border-t border-line bg-paper/60">
          <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-line px-4 sm:px-6 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="px-3 py-5 text-center">
                <p className="font-display text-2xl font-extrabold text-brand-700 sm:text-3xl">{s.value}</p>
                <p className="mt-0.5 text-xs font-medium text-muted sm:text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Catégories */}
        <section className="pt-14">
          <SectionHeading
            title={t("sections.categories")}
            action={
              <Link href="/sherbime" className="text-sm font-medium text-brand-700 hover:underline">
                {tc("actions.seeAll")}
              </Link>
            }
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {serviceCategories.map((category) => (
              <CategoryCard key={category.slug} category={category} />
            ))}
            {rentalEntry && <CategoryCard category={rentalEntry} />}
          </div>
        </section>

        {/* Kërkesa pranë teje */}
        <section className="pt-16">
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

        {/* Comment ça marche */}
        <section className="pt-16">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold sm:text-3xl">{t("how.title")}</h2>
            <p className="mt-1.5 text-muted">{t("how.subtitle")}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((step, i) => (
              <div
                key={step}
                className={`animate-fade-up delay-${i + 1} relative overflow-hidden rounded-(--radius-card) border border-line bg-card p-6`}
              >
                <span className="absolute right-4 top-3 font-display text-5xl font-extrabold text-brand-50">{step}</span>
                <span className="relative inline-flex size-10 items-center justify-center rounded-xl bg-brand-600 font-display text-base font-bold text-white shadow-(--shadow-brand)">
                  {step}
                </span>
                <h3 className="relative mt-4 font-display text-lg font-semibold">{t(`how.step${step}Title` as never)}</h3>
                <p className="relative mt-1.5 text-sm leading-relaxed text-muted">{t(`how.step${step}Text` as never)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Professionnels */}
        <section className="pt-16">
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

        {/* Confiance */}
        <section className="pt-16">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold sm:text-3xl">{t("why.title")}</h2>
            <p className="mt-1.5 text-muted">{t("why.subtitle")}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {why.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-(--radius-card) border border-line bg-card p-6">
                <span className="inline-flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Qira */}
        <section className="pt-16">
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

        {/* Villes */}
        <section className="pt-16">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold sm:text-3xl">{t("cities.title")}</h2>
            <p className="mt-1.5 text-muted">{t("cities.subtitle")}</p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {launchCities.map((city) => (
              <span
                key={city.slug}
                className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1.5 text-sm font-medium text-brand-800"
              >
                <MapPin className="size-3.5" aria-hidden />
                {locale === "en" ? city.name.en : city.name.sq}
              </span>
            ))}
            {cities
              .filter((c) => !c.launch)
              .slice(0, 6)
              .map((city) => (
                <span
                  key={city.slug}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-3.5 py-1.5 text-sm text-faint"
                >
                  {locale === "en" ? city.name.en : city.name.sq}
                  <span className="text-[0.65rem] uppercase tracking-wide">{t("cities.soon")}</span>
                </span>
              ))}
          </div>
        </section>

        {/* CTA professionnels */}
        <section className="pt-16">
          <div className="relative overflow-hidden rounded-3xl bg-brand-950">
            <div className="absolute inset-0 opacity-25">
              <Photo src={media.proCta} alt="" className="h-full w-full" />
            </div>
            <div className="bg-brand-gradient absolute inset-0 opacity-80" aria-hidden />
            <div className="relative flex flex-col gap-6 px-6 py-10 sm:px-10 sm:py-12 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <p className="text-xs font-semibold uppercase tracking-widest text-brand-200">{t("proCta.eyebrow")}</p>
                <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">{t("proCta.title")}</h2>
                <p className="mt-2 text-sm leading-relaxed text-brand-100">{t("proCta.text")}</p>
                <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white">
                  {[t("proCta.point1"), t("proCta.point2"), t("proCta.point3")].map((p) => (
                    <li key={p} className="inline-flex items-center gap-1.5">
                      <ShieldCheck className="size-4 text-brand-200" aria-hidden />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                as={Link}
                href="/regjistrohu?si=profesionist"
                size="lg"
                variant="inverse"
                className="shrink-0 shadow-lg"
              >
                <Plus className="size-5" aria-hidden />
                {t("proCta.button")}
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
