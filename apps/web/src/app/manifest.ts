import type { MetadataRoute } from "next";

// Manifest PWA — fichier unique, non localisé : slogan en shqip (locale par défaut).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AlloPuno",
    short_name: "AlloPuno",
    description: "Kërko. Ofro. Gjej. Puno.",
    theme_color: "#2240dd",
    background_color: "#fafbfd",
    display: "standalone",
    start_url: "/",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }]
  };
}
