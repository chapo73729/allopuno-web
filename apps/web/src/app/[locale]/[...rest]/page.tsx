import { notFound } from "next/navigation";

/**
 * Catch-all des URLs inconnues sous [locale] (pattern next-intl « handling
 * unknown routes ») : déclenche notFound() pour que toute URL non matchée
 * tombe sur la 404 localisée de app/[locale]/not-found.tsx, dans le layout
 * [locale] (header/footer + traductions), au lieu de la 404 par défaut de Next.
 */
export default function CatchAllPage() {
  notFound();
}
