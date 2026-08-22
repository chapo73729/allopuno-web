import type { MetadataRoute } from "next";
import { serviceCategories } from "@allopuno/data";

const BASE_URL = "https://allopuno.com";

/** URL absolue d'un chemin pour une locale (sq sans préfixe, en sous /en). */
function localizedUrl(locale: "sq" | "en", path: string): string {
  if (locale === "sq") {
    return `${BASE_URL}${path || "/"}`;
  }
  return `${BASE_URL}/en${path}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  // Routes publiques indexables ("" = ballina) — les fiches démo (/profesionisti,
  // /kerkesa, /qira/[id]) restent hors sitemap tant que les données sont fictives.
  const paths = [
    "",
    "/publiko",
    "/kerko",
    "/sherbime",
    ...serviceCategories.map((category) => `/sherbime/${category.slug}`),
    "/qira",
    "/hyr",
    "/regjistrohu",
    "/rreth-nesh",
    "/ndihme",
    "/kontakt",
    "/kushtet",
    "/privatesia"
  ];

  const lastModified = new Date();

  return paths.flatMap((path) => {
    const languages = {
      sq: localizedUrl("sq", path),
      en: localizedUrl("en", path)
    };
    return (["sq", "en"] as const).map((locale) => ({
      url: localizedUrl(locale, path),
      lastModified,
      alternates: { languages }
    }));
  });
}
