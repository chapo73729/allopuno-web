import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ChevronDown, MessageCircleQuestion } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/site/PageHero";

interface FaqEntry {
  q: string;
  a: string;
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages" });
  return { title: t("help.title") };
}

export default async function HelpPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.help");

  const faq = t.raw("faq") as FaqEntry[];

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
        <h2 className="font-display text-xl font-semibold">{t("faqTitle")}</h2>
        <div className="mt-5 flex flex-col gap-3">
          {faq.map((item) => (
            <details
              key={item.q}
              className="group rounded-(--radius-card) border border-line bg-card shadow-(--shadow-card) transition-shadow open:shadow-(--shadow-pop)"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 font-display font-semibold transition-colors hover:text-brand-700 [&::-webkit-details-marker]:hidden">
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

        <div className="mt-10 flex flex-col items-center gap-3 rounded-(--radius-card) border border-line bg-wash px-6 py-8 text-center">
          <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <MessageCircleQuestion className="size-6" aria-hidden />
          </span>
          <p className="max-w-md text-sm leading-relaxed text-muted">{t("intro")}</p>
          <Button as={Link} href="/kontakt" variant="secondary" className="mt-1">
            <MessageCircleQuestion className="size-4" aria-hidden />
            {t("contactCta")}
          </Button>
        </div>
      </div>
    </>
  );
}
