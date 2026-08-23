import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { CalendarDays, Clock, Mail } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { ContactForm } from "./ContactForm";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages" });
  return { title: t("contact.title") };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.contact");
  const email = t("email");

  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-card">
        <div className="bg-hero-wash absolute inset-0" aria-hidden />
        <div className="bg-grid absolute inset-0 opacity-60" aria-hidden />
        <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <PageHero eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")} />
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-10">
          <aside className="animate-fade-up flex flex-col gap-4">
            <div className="rounded-(--radius-card) border border-line bg-card p-5 shadow-(--shadow-card)">
              <span className="inline-flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Mail className="size-5" aria-hidden />
              </span>
              <p className="mt-3 text-sm font-medium text-ink">{t("emailLabel")}</p>
              <a
                href={`mailto:${email}`}
                className="mt-2 inline-flex items-center gap-2 rounded-(--radius-field) border border-line bg-paper px-3.5 py-2.5 text-sm font-medium text-brand-700 transition-colors hover:border-brand-300"
              >
                <Mail className="size-4" aria-hidden />
                {email}
              </a>
            </div>

            <div className="rounded-(--radius-card) border border-line bg-card p-5 shadow-(--shadow-card)">
              <span className="inline-flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Clock className="size-5" aria-hidden />
              </span>
              <p className="mt-3 font-display font-semibold">{t("responseTitle")}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{t("responseText")}</p>
            </div>

            <div className="rounded-(--radius-card) border border-line bg-card p-5 shadow-(--shadow-card)">
              <span className="inline-flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <CalendarDays className="size-5" aria-hidden />
              </span>
              <p className="mt-3 font-display font-semibold">{t("hoursTitle")}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{t("hoursText")}</p>
            </div>
          </aside>

          <div className="animate-fade-up delay-1">
            <ContactForm />
          </div>
        </div>
      </div>
    </>
  );
}
