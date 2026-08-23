import { useTranslations } from "next-intl";
import { HeartHandshake } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Wordmark } from "./Wordmark";

export function SiteFooter() {
  const t = useTranslations("common");
  const year = new Date().getFullYear();

  const columns = [
    {
      title: t("footer.product"),
      links: [
        { href: "/sherbime", label: t("nav.services") },
        { href: "/qira", label: t("nav.rentals") },
        { href: "/publiko", label: t("nav.publish") },
        { href: "/regjistrohu", label: t("nav.becomePro") }
      ]
    },
    {
      title: t("footer.company"),
      links: [
        { href: "/rreth-nesh", label: t("footer.about") },
        { href: "/ndihme", label: t("footer.help") },
        { href: "/kontakt", label: t("footer.contact") }
      ]
    },
    {
      title: t("footer.legal"),
      links: [
        { href: "/kushtet", label: t("footer.terms") },
        { href: "/privatesia", label: t("footer.privacy") }
      ]
    }
  ];

  return (
    <footer className="mt-20 border-t border-line bg-card">
      {/* Filet d'accent ultramarine — sépare franchement le contenu du pied */}
      <div className="bg-brand-gradient h-0.5 w-full" aria-hidden />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_repeat(3,1fr)] md:gap-12">
        <div className="flex flex-col items-start gap-4">
          <Wordmark mark />
          <p className="max-w-xs text-sm leading-relaxed text-muted">
            {t("brand.tagline")} — {t("brand.motto")}
          </p>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-3 py-1 text-xs font-semibold text-success">
            <HeartHandshake className="size-3.5" aria-hidden />
            {t("footer.freeNote")}
          </span>
        </div>
        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title} className="flex flex-col gap-2.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-faint">{col.title}</p>
            {col.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted transition-colors hover:text-brand-700"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-faint sm:flex-row sm:px-6">
          <p>{t("footer.copyright", { year })}</p>
          <div className="flex items-center gap-4">
            <Link href="/kushtet" className="transition-colors hover:text-brand-700">
              {t("footer.terms")}
            </Link>
            <Link href="/privatesia" className="transition-colors hover:text-brand-700">
              {t("footer.privacy")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
