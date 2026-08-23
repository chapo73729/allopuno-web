import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Eye, HeartHandshake, Plus, Target } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Photo } from "@/components/ui/Photo";
import { PageHero } from "@/components/site/PageHero";
import { media } from "@/lib/media";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages" });
  return { title: t("about.title") };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.about");
  const tc = await getTranslations("common");

  const blocks = [
    { icon: Target, title: t("mission.title"), text: t("mission.text") },
    { icon: Eye, title: t("vision.title"), text: t("vision.text") },
    { icon: HeartHandshake, title: t("values.title"), text: t("values.text") }
  ];

  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-card">
        <div className="bg-hero-wash absolute inset-0" aria-hidden />
        <div className="bg-grid absolute inset-0 opacity-60" aria-hidden />
        <div className="relative mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
          <PageHero eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")} />
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <Photo
          src={media.hero}
          alt={t("title")}
          overlay
          className="animate-fade-up aspect-[16/9] w-full rounded-3xl shadow-(--shadow-pop)"
          fallback={<HeartHandshake className="size-10 text-brand-300" />}
        />

        <div className="mt-10 flex flex-col gap-4">
          {blocks.map(({ icon: Icon, title, text }, i) => (
            <Card
              key={title}
              className={`animate-fade-up delay-${i + 1} p-6 transition-shadow hover:shadow-(--shadow-pop) sm:p-7`}
            >
              <span className="inline-flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Icon className="size-5" aria-hidden />
              </span>
              <h2 className="mt-4 font-display text-xl font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted sm:text-[0.95rem]">{text}</p>
            </Card>
          ))}
        </div>

        <div className="relative mt-12 overflow-hidden rounded-3xl bg-brand-950">
          <div className="bg-brand-gradient absolute inset-0 opacity-90" aria-hidden />
          <div className="bg-grid absolute inset-0 opacity-15" aria-hidden />
          <div className="relative flex flex-col gap-5 px-6 py-9 sm:px-9 sm:py-10">
            <div>
              <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
                {t("ctaTitle")}
              </h2>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-brand-100">{t("ctaText")}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button as={Link} href="/publiko" variant="inverse" className="shadow-lg">
                <Plus className="size-4" aria-hidden />
                {tc("nav.publish")}
              </Button>
              <Link
                href="/regjistrohu?si=profesionist"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-(--radius-field) border border-white/30 px-5 text-[0.95rem] font-medium text-white transition-colors hover:border-white hover:bg-white/10"
              >
                {tc("nav.becomePro")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
