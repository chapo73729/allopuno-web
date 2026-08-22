import { useTranslations } from "next-intl";
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
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="flex flex-col gap-3">
          <Wordmark />
          <p className="max-w-xs text-sm text-muted">{t("brand.tagline")} — {t("brand.motto")}</p>
          <p className="text-sm font-medium text-success">{t("footer.freeNote")}</p>
        </div>
        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title} className="flex flex-col gap-2.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-faint">{col.title}</p>
            {col.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted transition-colors hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        ))}
      </div>
      <div className="border-t border-line py-5 text-center text-xs text-faint">
        {t("footer.copyright", { year })}
      </div>
    </footer>
  );
}
