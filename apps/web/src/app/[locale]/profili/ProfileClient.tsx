"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  BadgePlus,
  ChevronRight,
  ClipboardList,
  FileQuestion,
  Languages,
  Plus,
  ScrollText,
  ShieldCheck,
  UserRound
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Card } from "@/components/ui/Card";
import { LocaleSwitcher } from "@/components/site/LocaleSwitcher";
import { useEngine } from "@/lib/engine";

export function ProfileClient() {
  const t = useTranslations("workspace");
  const { requests, conversations } = useEngine();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const offers = requests.reduce((acc, r) => acc + r.responses.length, 0);
  const stats = [
    { value: requests.length, label: t("profile.statRequests") },
    { value: offers, label: t("profile.statOffers") },
    { value: conversations.length, label: t("profile.statConversations") }
  ];

  const links = [
    { href: "/kerkesat", icon: ClipboardList, label: t("profile.links.myRequests") },
    { href: "/publiko", icon: Plus, label: t("profile.links.publish") },
    { href: "/regjistrohu?si=profesionist", icon: BadgePlus, label: t("profile.links.becomePro") },
    { href: "/ndihme", icon: FileQuestion, label: t("profile.links.help") },
    { href: "/kushtet", icon: ScrollText, label: t("profile.links.terms") },
    { href: "/privatesia", icon: ShieldCheck, label: t("profile.links.privacy") }
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="animate-fade-up">
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          {t("profile.title")}
        </h1>
      </header>

      {/* Carte identité (compte à venir) */}
      <Card className="animate-fade-up delay-1 mt-8 flex items-center gap-4 p-5">
        <span className="inline-flex size-16 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
          <UserRound className="size-8" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="font-display text-lg font-bold">{t("profile.guestName")}</p>
          <p className="mt-0.5 text-sm leading-snug text-muted">{t("profile.guestText")}</p>
        </div>
      </Card>

      {/* Statistiques locales */}
      <div className="animate-fade-up delay-2 mt-4 grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <Card key={s.label} className="p-4 text-center">
            <p className="font-display text-2xl font-extrabold text-brand-700">
              {mounted ? s.value : "–"}
            </p>
            <p className="mt-0.5 text-xs text-muted">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Liens */}
      <Card className="animate-fade-up delay-3 mt-4 overflow-hidden p-0">
        <ul className="divide-y divide-line">
          {links.map(({ href, icon: Icon, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="group flex items-center gap-3.5 px-5 py-4 transition-colors hover:bg-wash"
              >
                <Icon className="size-5 text-brand-600" aria-hidden />
                <span className="flex-1 text-sm font-medium">{label}</span>
                <ChevronRight
                  className="size-4 text-faint transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
          <li className="flex items-center gap-3.5 px-5 py-4">
            <Languages className="size-5 text-brand-600" aria-hidden />
            <span className="flex-1 text-sm font-medium">{t("profile.language")}</span>
            <LocaleSwitcher />
          </li>
        </ul>
      </Card>

      <p className="mt-8 text-center text-xs text-faint">{t("demoNote")}</p>
    </div>
  );
}
