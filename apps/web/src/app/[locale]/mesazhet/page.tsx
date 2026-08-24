import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { MessagesClient } from "./MessagesClient";

/** Mesazhet (écran 026) — liste des conversations du moteur client. */

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "workspace" });
  return { title: t("messages.title") };
}

export default async function MesazhetPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <MessagesClient />;
}
