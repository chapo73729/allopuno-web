import { getTranslations } from "next-intl/server";
import { Compass, Plus, Search, SearchX } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";

/**
 * 404 localisée du segment [locale] — déclenchée par les appels notFound() des
 * pages, et par le catch-all app/[locale]/[...rest]/page.tsx pour les URLs
 * inconnues.
 */
export default async function NotFound() {
  const t = await getTranslations("pages.notFound");
  const tc = await getTranslations("common");

  const links = [
    { href: "/sherbime", label: tc("nav.services"), icon: Compass },
    { href: "/kerko", label: tc("nav.search"), icon: Search },
    { href: "/publiko", label: tc("nav.publish"), icon: Plus }
  ];

  return (
    <section className="relative overflow-hidden">
      <div className="bg-hero-wash absolute inset-0" aria-hidden />
      <div className="bg-grid absolute inset-0 opacity-60" aria-hidden />
      <div className="relative mx-auto flex max-w-2xl flex-col items-center px-4 py-20 text-center sm:px-6 sm:py-28">
        <span className="inline-flex size-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 shadow-(--shadow-card)">
          <SearchX className="size-8" aria-hidden />
        </span>
        <span className="mt-5 inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700">
          {t("eyebrow")}
        </span>
        <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">{t("text")}</p>
        <Button as={Link} href="/" className="mt-6">
          {t("backHome")}
        </Button>

        <div className="mt-12 w-full border-t border-line pt-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-faint">
            {t("linksTitle")}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2.5">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-brand-300 hover:text-brand-700"
              >
                <Icon className="size-4 text-brand-600" aria-hidden />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
