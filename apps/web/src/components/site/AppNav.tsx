"use client";

import { useTranslations } from "next-intl";
import { Bell, ClipboardList, Home, MessageCircle, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { useUnreadCounts } from "@/lib/engine";
import { cn } from "@/lib/cn";

type Tab = {
  href: string;
  labelKey: "home" | "requests" | "messages" | "notifications" | "profile";
  icon: LucideIcon;
};

const tabs: Tab[] = [
  { href: "/", labelKey: "home", icon: Home },
  { href: "/kerkesat", labelKey: "requests", icon: ClipboardList },
  { href: "/mesazhet", labelKey: "messages", icon: MessageCircle },
  { href: "/njoftimet", labelKey: "notifications", icon: Bell },
  { href: "/profili", labelKey: "profile", icon: User }
];

/**
 * Barre de navigation basse, mobile uniquement. Fixe, safe-area aware.
 * Montée une seule fois dans le shell (via EngineBoot).
 */
export function AppNav() {
  const t = useTranslations("workspace");
  const tc = useTranslations("common");
  const pathname = usePathname();
  const counts = useUnreadCounts();

  const badgeFor = (href: string) =>
    href === "/mesazhet" ? counts.messages : href === "/njoftimet" ? counts.notifications : 0;

  return (
    <nav
      aria-label={tc("nav.mobileLabel")}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <div className="mx-auto flex h-16 max-w-lg items-stretch">
        {tabs.map((tab) => {
          const active =
            tab.href === "/"
              ? pathname === "/"
              : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          const badge = badgeFor(tab.href);
          const label = t(`nav.${tab.labelKey}`);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              aria-label={badge > 0 ? `${label} (${badge})` : label}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
                active ? "text-brand-700" : "text-muted hover:text-ink"
              )}
            >
              {active && (
                <span
                  className="absolute inset-x-6 top-0 h-0.5 rounded-full bg-brand-600"
                  aria-hidden
                />
              )}
              <span className="relative">
                <Icon className={cn("size-5", active && "stroke-[2.5]")} aria-hidden />
                {badge > 0 && (
                  <span
                    aria-hidden
                    className="absolute -right-2 -top-1.5 inline-flex min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold leading-4 text-white"
                  >
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </span>
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
