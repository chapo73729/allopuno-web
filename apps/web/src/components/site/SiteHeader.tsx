"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Menu, Plus, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Wordmark } from "./Wordmark";
import { LocaleSwitcher } from "./LocaleSwitcher";

export function SiteHeader() {
  const t = useTranslations("common");
  const [open, setOpen] = useState(false);

  const navItems = [
    { href: "/sherbime", label: t("nav.services") },
    { href: "/qira", label: t("nav.rentals") },
    { href: "/kerko", label: t("nav.search") }
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-card/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="shrink-0" aria-label="AlloPuno">
          <Wordmark />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label={t("nav.mainLabel")}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-wash hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LocaleSwitcher />
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
          className="inline-flex size-10 items-center justify-center rounded-lg text-ink hover:bg-wash md:hidden"
          aria-expanded={open}
          aria-label={open ? t("nav.close") : t("nav.menu")}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-line bg-card px-4 pb-6 pt-3 md:hidden">
          <nav className="flex flex-col" aria-label={t("nav.mobileLabel")}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-3 text-base font-medium text-ink hover:bg-wash"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/hyr"
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-3 text-base font-medium text-ink hover:bg-wash"
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
