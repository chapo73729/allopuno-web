import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { RequestsClient } from "./RequestsClient";

/**
 * Kërkesat e mia (écrans 017/037) — espace personnel 100 % client :
 * la page serveur ne fait que la locale + la metadata, la liste vit
 * dans le moteur client (localStorage) via RequestsClient.
 */

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "workspace" });
  return { title: t("requests.title") };
}

export default async function KerkesatPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <RequestsClient />;
}
