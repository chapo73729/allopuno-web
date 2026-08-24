"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Bell, CheckCheck, MessageSquare, Rocket, UserCheck, Wallet } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/cn";
import {
  markNotificationRead,
  markAllNotificationsRead,
  proById,
  useEngine,
  type LocalNotification
} from "@/lib/engine";
import { formatAgo } from "@/lib/format";

const ICONS: Record<LocalNotification["type"], typeof Bell> = {
  request_published: Rocket,
  response_received: Wallet,
  provider_selected: UserCheck,
  message_received: MessageSquare
};

export function NotificationsClient() {
  const t = useTranslations("workspace");
  const locale = useLocale();
  const { notifications } = useEngine();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const sorted = [...notifications].sort((a, b) => b.at - a.at);
  const hasUnread = sorted.some((n) => !n.read);

  function text(n: LocalNotification): string {
    const name = n.proId ? proById(n.proId)?.name ?? "" : "";
    switch (n.type) {
      case "request_published":
        return t("notifications.published");
      case "response_received":
        return t("notifications.response", { name });
      case "provider_selected":
        return t("notifications.selected", { name });
      case "message_received":
        return t("notifications.message", { name });
    }
  }

  function href(n: LocalNotification): string {
    if (n.conversationId) return `/mesazhet/${n.conversationId}`;
    if (n.requestId) return `/kerkesat/${n.requestId}`;
    return "/kerkesat";
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="animate-fade-up flex items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          {t("notifications.title")}
        </h1>
        {mounted && hasUnread && (
          <Button variant="ghost" size="sm" onClick={markAllNotificationsRead}>
            <CheckCheck className="size-4" aria-hidden />
            {t("notifications.markAll")}
          </Button>
        )}
      </header>

      {mounted && sorted.length === 0 && (
        <div className="animate-fade-up delay-1 mt-8">
          <EmptyState
            icon={<Bell aria-hidden />}
            title={t("notifications.empty")}
            text={t("notifications.emptyText")}
          />
        </div>
      )}

      {mounted && sorted.length > 0 && (
        <ul className="mt-8 flex flex-col gap-2.5">
          {sorted.map((n, i) => {
            const Icon = ICONS[n.type];
            return (
              <li key={n.id} className={cn("animate-fade-up", i < 4 && `delay-${Math.min(i + 1, 4)}`)}>
                <Link href={href(n)} onClick={() => markNotificationRead(n.id)} className="group block">
                  <Card
                    className={cn(
                      "flex items-center gap-3.5 p-4 transition-all duration-200 group-hover:border-brand-200 group-hover:shadow-(--shadow-pop)",
                      !n.read && "border-brand-200 bg-brand-50/40"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-flex size-10 shrink-0 items-center justify-center rounded-xl",
                        n.read ? "bg-wash text-muted" : "bg-brand-600 text-white"
                      )}
                    >
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-sm leading-snug", !n.read && "font-semibold")}>{text(n)}</p>
                      <p className="mt-0.5 text-xs text-faint">
                        {formatAgo((Date.now() - n.at) / 3600000, locale)}
                      </p>
                    </div>
                    {!n.read && <span className="size-2.5 shrink-0 rounded-full bg-brand-600" aria-hidden />}
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-8 text-center text-xs text-faint">{t("demoNote")}</p>
    </div>
  );
}
