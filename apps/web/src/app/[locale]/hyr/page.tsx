import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { AuthAside } from "@/components/site/AuthAside";
import { LoginCard } from "./LoginCard";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: t("login.title") };
}

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <section className="relative overflow-hidden">
      <div className="bg-hero-wash absolute inset-0" aria-hidden />
      <div className="bg-grid absolute inset-0 opacity-60" aria-hidden />
      <div className="relative mx-auto grid max-w-6xl items-stretch gap-8 px-4 py-10 sm:px-6 sm:py-16 lg:grid-cols-2 lg:gap-12">
        <div className="animate-fade-up delay-1">
          <AuthAside />
        </div>
        <div className="animate-fade-up flex items-center justify-center">
          <LoginCard />
        </div>
      </div>
    </section>
  );
}
