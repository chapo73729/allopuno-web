import { Suspense } from "react";
import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { PublishFlow } from "./PublishFlow";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "publish" });
  return { title: t("title") };
}

export default async function PublikoPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      {/* useSearchParams (?q=) oblige : le wizard client vit sous <Suspense>. */}
      <Suspense fallback={null}>
        <PublishFlow />
      </Suspense>
    </div>
  );
}
