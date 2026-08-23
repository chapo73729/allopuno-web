import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { LegalPage } from "@/components/site/LegalPage";

interface LegalSection {
  title: string;
  text: string;
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages" });
  return { title: t("privacy.title") };
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.privacy");

  const sections = t.raw("sections") as LegalSection[];

  return (
    <LegalPage
      eyebrow={t("eyebrow")}
      title={t("title")}
      intro={t("intro")}
      tocTitle={t("tocTitle")}
      updated={t("updated")}
      sections={sections}
    />
  );
}
