import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { NotificationsClient } from "./NotificationsClient";

/** Njoftimet (écran 038) — flux du moteur client. */

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "workspace" });
  return { title: t("notifications.title") };
}

export default async function NjoftimetPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <NotificationsClient />;
}
