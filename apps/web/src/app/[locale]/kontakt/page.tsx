import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Mail } from "lucide-react";
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
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
        {t("title")}
      </h1>
      <p className="mt-3 text-base leading-relaxed text-muted sm:text-lg">{t("intro")}</p>

      <p className="mt-8 text-sm font-medium text-ink">{t("emailLabel")}</p>
      <a
        href={`mailto:${email}`}
        className="mt-2 inline-flex items-center gap-2 rounded-(--radius-field) border border-line bg-card px-4 py-3 text-sm font-medium text-brand-700 transition-colors hover:border-brand-300"
      >
        <Mail className="size-4" aria-hidden />
        {email}
      </a>

      <div className="mt-10">
        <ContactForm />
      </div>
    </div>
  );
}
