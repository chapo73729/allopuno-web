import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Albert_Sans, Bricolage_Grotesque, Spline_Sans_Mono } from "next/font/google";
import { routing } from "@/i18n/routing";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { media } from "@/lib/media";
import "../globals.css";

const SITE_URL = "https://allopuno-web.vercel.app";

const keywords: Record<string, string[]> = {
  sq: [
    "AlloPuno",
    "shërbime Kosovë",
    "mjeshtër Kosovë",
    "qira Kosovë",
    "profesionistë",
    "elektricist",
    "hidraulik",
    "transport",
    "Prishtinë"
  ],
  en: [
    "AlloPuno",
    "Kosovo services",
    "handyman Kosovo",
    "rentals Kosovo",
    "local marketplace",
    "professionals",
    "electrician",
    "plumber",
    "Pristina"
  ]
};

const albert = Albert_Sans({ subsets: ["latin"], variable: "--font-albert", display: "swap" });
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap"
});
const splineMono = Spline_Sans_Mono({
  subsets: ["latin"],
  variable: "--font-spline-mono",
  weight: ["400", "500"],
  display: "swap"
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "common" });
  const title = `AlloPuno — ${t("brand.tagline")}`;
  const description = t("brand.motto");
  const ogLocale = locale === "en" ? "en_US" : "sq_AL";
  const path = locale === "en" ? "/en" : "/";

  return {
    metadataBase: new URL(SITE_URL),
    applicationName: "AlloPuno",
    title: {
      default: title,
      template: "%s · AlloPuno"
    },
    description,
    keywords: keywords[locale] ?? keywords.sq,
    alternates: {
      canonical: path,
      languages: { sq: "/", en: "/en" }
    },
    openGraph: {
      type: "website",
      siteName: "AlloPuno",
      title,
      description,
      url: path,
      locale: ogLocale,
      images: [{ url: media.hero, width: 1200, height: 630, alt: title }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [media.hero]
    }
  };
}

export const viewport: Viewport = {
  themeColor: "#2240dd",
  width: "device-width",
  initialScale: 1
};

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <html lang={locale} className={`${albert.variable} ${bricolage.variable} ${splineMono.variable}`}>
      <body>
        <NextIntlClientProvider>
          <div className="flex min-h-dvh flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
