"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronRight, MessagesSquare } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/cn";
import { proById, useEngine, type LocalMessage } from "@/lib/engine";
import { formatAgo, localized } from "@/lib/format";

function messageText(message: LocalMessage | undefined, locale: string): string {
  if (!message) return "";
  return typeof message.text === "string" ? message.text : localized(message.text, locale);
}

export function MessagesClient() {
  const t = useTranslations("workspace");
  const locale = useLocale();
  const { conversations, requests } = useEngine();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const sorted = [...conversations].sort((a, b) => {
    const la = a.messages[a.messages.length - 1]?.at ?? a.createdAt;
    const lb = b.messages[b.messages.length - 1]?.at ?? b.createdAt;
    return lb - la;
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="animate-fade-up">
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          {t("messages.title")}
        </h1>
      </header>

      {mounted && sorted.length === 0 && (
        <div className="animate-fade-up delay-1 mt-8">
          <EmptyState
            icon={<MessagesSquare aria-hidden />}
            title={t("messages.empty")}
            text={t("messages.emptyText")}
            action={
              <Button as={Link} href="/kerkesat" variant="outline">
                {t("messages.emptyCta")}
              </Button>
            }
          />
        </div>
      )}

      {mounted && sorted.length > 0 && (
        <ul className="mt-8 flex flex-col gap-3">
          {sorted.map((conversation, i) => {
            const pro = proById(conversation.proId);
            const request = requests.find((r) => r.id === conversation.requestId);
            const last = conversation.messages[conversation.messages.length - 1];
            const unread = conversation.messages.some(
              (m) => m.from === "pro" && m.at > conversation.lastReadAt
            );
            if (!pro) return null;
            return (
              <li key={conversation.id} className={cn("animate-fade-up", i < 4 && `delay-${Math.min(i + 1, 4)}`)}>
                <Link href={`/mesazhet/${conversation.id}`} className="group block">
                  <Card className="flex items-center gap-3.5 p-4 transition-all duration-200 group-hover:border-brand-200 group-hover:shadow-(--shadow-pop)">
                    <Avatar name={pro.name} size="lg" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p
                          className={cn(
                            "truncate font-display font-semibold",
                            unread && "text-brand-800"
                          )}
                        >
                          {pro.name}
                        </p>
                        <span className="shrink-0 text-xs text-faint">
                          {last ? formatAgo((Date.now() - last.at) / 3600000, locale) : ""}
                        </span>
                      </div>
                      {request && (
                        <p className="truncate text-xs font-medium text-brand-700">{request.title}</p>
                      )}
                      <p className={cn("truncate text-sm", unread ? "font-medium text-ink" : "text-muted")}>
                        {conversation.pendingReplyAt !== undefined
                          ? t("messages.typing")
                          : messageText(last, locale)}
                      </p>
                    </div>
                    {unread ? (
                      <span className="size-2.5 shrink-0 rounded-full bg-brand-600" aria-hidden />
                    ) : (
                      <ChevronRight className="size-5 shrink-0 text-faint" aria-hidden />
                    )}
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
