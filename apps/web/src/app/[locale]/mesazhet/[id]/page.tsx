import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ConversationClient } from "./ConversationClient";

/** Conversation (écran 027) — dynamique : les ids vivent en localStorage. */

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "workspace" });
  return { title: t("messages.title") };
}

export default async function ConversationPage({
  params
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return <ConversationClient conversationId={id} />;
}
