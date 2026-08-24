import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { RequestDetailClient } from "./RequestDetailClient";

/**
 * Détail d'une kërkesa du moteur client (écrans 018→023). Les ids vivent
 * en localStorage : la route est dynamique à la demande — PAS de
 * generateStaticParams — et tout le contenu est rendu côté client.
 */

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "workspace" });
  return { title: t("detail.yourRequest") };
}

export default async function KerkesatDetailPage({
  params
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return <RequestDetailClient requestId={id} />;
}
