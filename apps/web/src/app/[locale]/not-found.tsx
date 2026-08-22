import { getTranslations } from "next-intl/server";
import { SearchX } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";

/**
 * 404 localisée du segment [locale] — déclenchée par les appels notFound() des
 * pages, et par le catch-all app/[locale]/[...rest]/page.tsx pour les URLs
 * inconnues.
 */
export default async function NotFound() {
  const t = await getTranslations("pages.notFound");

  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-20 text-center sm:px-6 sm:py-28">
      <span className="inline-flex size-16 items-center justify-center rounded-full bg-wash text-faint">
        <SearchX className="size-8" aria-hidden />
      </span>
      <h1 className="mt-5 font-display text-2xl font-bold sm:text-3xl">{t("title")}</h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">{t("text")}</p>
      <Button as={Link} href="/" className="mt-6">
        {t("backHome")}
      </Button>
    </div>
  );
}
