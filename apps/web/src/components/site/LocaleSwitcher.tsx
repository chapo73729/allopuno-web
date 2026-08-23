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
      className="inline-flex items-center rounded-full border border-line bg-card p-0.5 shadow-[0_1px_2px_rgb(16_23_40/0.04)]"
      role="group"
      aria-label={t("language.label")}
    >
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={l === locale}
          aria-label={t(`language.${l}`)}
          onClick={() => {
            const query = Object.fromEntries(new URLSearchParams(window.location.search));
            router.replace({ pathname, query }, { locale: l });
          }}
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide transition-all",
            l === locale
              ? "bg-brand-600 text-white shadow-[0_1px_2px_rgb(34_64_221/0.35)]"
              : "text-muted hover:text-ink"
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
