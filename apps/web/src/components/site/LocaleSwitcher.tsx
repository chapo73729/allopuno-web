"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales } from "@allopuno/i18n";
import { cn } from "@/lib/cn";

export function LocaleSwitcher() {
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div
      className="inline-flex items-center rounded-full border border-line bg-card p-0.5"
      role="group"
      aria-label={t("language.label")}
    >
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={l === locale}
          aria-label={t(`language.${l}`)}
          onClick={() => router.replace(pathname, { locale: l })}
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide transition-colors",
            l === locale ? "bg-brand-600 text-white" : "text-muted hover:text-ink"
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
