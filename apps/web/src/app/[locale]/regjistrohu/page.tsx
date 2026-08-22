import { Suspense } from "react";
import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { RegisterCard } from "./RegisterCard";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: t("register.title") };
}

export default async function RegisterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="mx-auto flex max-w-6xl justify-center px-4 py-10 sm:px-6 sm:py-16">
      {/* useSearchParams (?si=profesionist) oblige : la carte client vit sous <Suspense>. */}
      <Suspense fallback={null}>
        <RegisterCard />
      </Suspense>
    </div>
  );
}
