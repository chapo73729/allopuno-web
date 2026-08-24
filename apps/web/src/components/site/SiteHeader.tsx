"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Menu, Plus, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { useUnreadCounts } from "@/lib/engine";
import { cn } from "@/lib/cn";
import { Wordmark } from "./Wordmark";
import { LocaleSwitcher } from "./LocaleSwitcher";

export function SiteHeader() {
  const t = useTranslations("common");
  const tw = useTranslations("workspace");
  const counts = useUnreadCounts();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Ombre + fond plus dense dès qu'on quitte le haut de page (premium, discret).
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navItems = [
    { href: "/sherbime", label: t("nav.services") },
    { href: "/qira", label: t("nav.rentals") },
    { href: "/kerko", label: t("nav.search") }
  ];

  // Espace personnel : liens discrets + badge non-lus sur Mesazhet.
  const workspaceItems = [
    { href: "/kerkesat", label: tw("nav.requests"), badge: 0 },
    { href: "/mesazhet", label: tw("nav.messages"), badge: counts.messages }
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-[background-color,box-shadow,border-color] duration-300",
        scrolled
          ? "border-line bg-card/85 shadow-(--shadow-card) backdrop-blur-md"
          : "border-transparent bg-card/70 backdrop-blur"
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="shrink-0 rounded-xl transition-opacity hover:opacity-90"
          aria-label="AlloPuno"
        >
          <Wordmark mark />
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex" aria-label={t("nav.mainLabel")}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-wash hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
          <span className="mx-1 h-4 w-px bg-line" aria-hidden />
          {workspaceItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.badge > 0 ? `${item.label} (${item.badge})` : undefined}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-wash hover:text-ink"
            >
              {item.label}
              {item.badge > 0 && (
                <span
                  aria-hidden
                  className="ml-1.5 inline-flex min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold leading-4 text-white align-middle"
                >
                  {item.badge > 9 ? "9+" : item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LocaleSwitcher />
          <span className="h-5 w-px bg-line" aria-hidden />
          <Link
            href="/hyr"
            className="text-sm font-medium text-muted transition-colors hover:text-ink"
          >
            {t("nav.login")}
          </Link>
          <Button as={Link} href="/publiko" size="sm">
            <Plus className="size-4" aria-hidden />
            {t("nav.publish")}
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-lg text-ink transition-colors hover:bg-wash md:hidden"
          aria-expanded={open}
          aria-label={open ? t("nav.close") : t("nav.menu")}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="animate-fade-in border-t border-line bg-card px-4 pb-6 pt-3 md:hidden">
          <nav className="flex flex-col" aria-label={t("nav.mobileLabel")}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-base font-medium text-ink transition-colors hover:bg-wash"
              >
                {item.label}
              </Link>
            ))}
            {workspaceItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-label={item.badge > 0 ? `${item.label} (${item.badge})` : undefined}
                className="flex items-center gap-2 rounded-lg px-3 py-3 text-base font-medium text-ink transition-colors hover:bg-wash"
              >
                {item.label}
                {item.badge > 0 && (
                  <span
                    aria-hidden
                    className="inline-flex min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold leading-4 text-white"
                  >
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </Link>
            ))}
            <Link
              href="/hyr"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 text-base font-medium text-ink transition-colors hover:bg-wash"
            >
              {t("nav.login")}
            </Link>
          </nav>
          <div className="mt-3 flex items-center justify-between gap-3">
            <Button as={Link} href="/publiko" className="flex-1" onClick={() => setOpen(false)}>
              <Plus className="size-4" aria-hidden />
              {t("nav.publish")}
            </Button>
            <LocaleSwitcher />
          </div>
        </div>
      )}
    </header>
  );
}
