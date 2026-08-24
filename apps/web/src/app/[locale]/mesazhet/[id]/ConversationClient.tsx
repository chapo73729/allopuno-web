"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, BadgeCheck, CalendarPlus, FileText, MessagesSquare, SendHorizontal } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { RatingStars } from "@/components/ui/RatingStars";
import { cn } from "@/lib/cn";
import {
  markConversationRead,
  proById,
  sendMessage,
  useEngine,
  type LocalMessage
} from "@/lib/engine";
import { localized } from "@/lib/format";

function textOf(message: LocalMessage, locale: string): string {
  return typeof message.text === "string" ? message.text : localized(message.text, locale);
}

export function ConversationClient({ conversationId }: { conversationId: string }) {
  const t = useTranslations("workspace");
  const tc = useTranslations("common");
  const locale = useLocale();
  const { conversations, requests } = useEngine();

  const [mounted, setMounted] = useState(false);
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  const conversation = conversations.find((c) => c.id === conversationId);
  const pro = conversation ? proById(conversation.proId) : undefined;
  const request = conversation ? requests.find((r) => r.id === conversation.requestId) : undefined;
  const messageCount = conversation?.messages.length ?? 0;
  const typing = conversation?.pendingReplyAt !== undefined;

  // Marque lu à l'ouverture et à chaque nouveau message reçu.
  useEffect(() => {
    if (mounted && conversation) markConversationRead(conversation.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, conversationId, messageCount]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messageCount, typing]);

  if (!mounted) return <div className="min-h-[60vh]" aria-hidden />;

  if (!conversation || !pro) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <EmptyState
          icon={<MessagesSquare aria-hidden />}
          title={t("messages.empty")}
          text={t("messages.emptyText")}
          action={
            <Button as={Link} href="/mesazhet" variant="outline">
              {t("messages.title")}
            </Button>
          }
        />
      </div>
    );
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    sendMessage(conversationId, draft);
    setDraft("");
  }

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-8rem)] max-w-2xl flex-col px-4 sm:px-6">
      {/* En-tête conversation */}
      <header className="sticky top-16 z-30 -mx-4 border-b border-line bg-card/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex items-center gap-3">
          <Link
            href="/mesazhet"
            aria-label={tc("actions.back")}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-wash hover:text-ink"
          >
            <ArrowLeft className="size-5" aria-hidden />
          </Link>
          <Link href={`/profesionisti/${pro.id}`} className="group flex min-w-0 flex-1 items-center gap-3">
            <Avatar name={pro.name} size="md" />
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 truncate font-display font-semibold group-hover:text-brand-700">
                {pro.name}
                {(pro.verified.includes("identity") || pro.verified.includes("business")) && (
                  <BadgeCheck
                    role="img"
                    aria-label={tc("badges.identityVerified")}
                    className="size-4 shrink-0 text-brand-600"
                  />
                )}
              </p>
              {typing ? (
                <p className="text-xs font-medium text-brand-700">{t("messages.typing")}</p>
              ) : (
                <RatingStars rating={pro.rating} count={pro.ratingCount} />
              )}
            </div>
          </Link>
        </div>
        {request && (
          <Link
            href={`/kerkesat/${request.id}`}
            className="mt-2.5 flex items-center gap-2 rounded-(--radius-field) bg-wash px-3 py-2 text-xs transition-colors hover:bg-brand-50"
          >
            <span className="font-medium uppercase tracking-wide text-faint">
              {t("messages.aboutRequest")}
            </span>
            <span className="truncate font-medium text-brand-800">{request.title}</span>
          </Link>
        )}
      </header>

      {/* Fil de messages */}
      <div className="flex-1 py-5">
        <ol className="flex flex-col gap-2.5">
          {conversation.messages.map((message) => {
            if (message.from === "system") {
              return (
                <li key={message.id} className="my-2 flex justify-center">
                  <span className="max-w-[85%] truncate rounded-full bg-wash px-3.5 py-1.5 text-xs text-muted">
                    {textOf(message, locale)}
                  </span>
                </li>
              );
            }
            const mine = message.from === "me";
            return (
              <li key={message.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-(--shadow-card)",
                    mine
                      ? "bg-brand-600 text-white rounded-br-md"
                      : "border border-line bg-card text-ink rounded-bl-md"
                  )}
                >
                  {textOf(message, locale)}
                </div>
              </li>
            );
          })}
          {typing && (
            <li className="flex justify-start">
              <span
                className="inline-flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-line bg-card px-4 py-3 shadow-(--shadow-card)"
                aria-label={t("messages.typing")}
              >
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="size-1.5 animate-bounce rounded-full bg-faint"
                    style={{ animationDelay: `${i * 0.15}s` }}
                    aria-hidden
                  />
                ))}
              </span>
            </li>
          )}
        </ol>
        <div ref={endRef} />
      </div>

      {/* Actions rapides (RDV / devis — phase suivante) */}
      <div className="flex gap-2 pb-2">
        {[
          { icon: CalendarPlus, label: t("messages.actions.appointment") },
          { icon: FileText, label: t("messages.actions.quote") }
        ].map(({ icon: Icon, label }) => (
          <span
            key={label}
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-3 py-1.5 text-xs text-faint"
            title={t("messages.actions.soon")}
          >
            <Icon className="size-3.5" aria-hidden />
            {label}
            <Badge tone="neutral">{t("messages.actions.soon")}</Badge>
          </span>
        ))}
      </div>

      {/* Barre de saisie */}
      <form
        onSubmit={submit}
        className="sticky bottom-16 -mx-4 border-t border-line bg-card px-4 py-3 md:bottom-0 sm:-mx-6 sm:px-6"
      >
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t("messages.inputPlaceholder")}
            aria-label={t("messages.inputPlaceholder")}
            enterKeyHint="send"
            className="h-11 min-w-0 flex-1 rounded-full border border-line bg-paper px-4 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            aria-label={t("messages.send")}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white shadow-(--shadow-brand) transition-all hover:bg-brand-700 disabled:opacity-40"
          >
            <SendHorizontal className="size-5" aria-hidden />
          </button>
        </div>
      </form>
    </div>
  );
}
