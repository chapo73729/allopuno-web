import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ProfileClient } from "./ProfileClient";

/** Profili (écran 040) — espace personnel, version demo (compte à venir). */

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "workspace" });
  return { title: t("profile.title") };
}

export default async function ProfiliPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ProfileClient />;
}
