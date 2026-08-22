"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input, Textarea } from "@/components/ui/Input";

/** Formulaire de contact v1 vitrine : soumission simulée, rien n'est envoyé. */
export function ContactForm() {
  const t = useTranslations("pages.contact.form");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  if (sent) {
    return (
      <Card className="flex flex-col items-center gap-3 px-6 py-10 text-center" role="status">
        <span className="inline-flex size-14 items-center justify-center rounded-full bg-success-soft">
          <CheckCircle2 className="size-7 text-success" aria-hidden />
        </span>
        <p className="font-display text-xl font-bold">{t("thanksTitle")}</p>
        <p className="max-w-md text-sm leading-relaxed text-muted">{t("thanksText")}</p>
      </Card>
    );
  }

  return (
    <Card className="p-5 sm:p-7">
      <h2 className="font-display text-xl font-semibold">{t("title")}</h2>
      <form onSubmit={submit} className="mt-5 flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("name")} htmlFor="contact-name">
            <Input
              id="contact-name"
              name="name"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <Field label={t("email")} htmlFor="contact-email">
            <Input
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
        </div>
        <Field label={t("message")} htmlFor="contact-message">
          <Textarea
            id="contact-message"
            name="message"
            required
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </Field>
        <div className="flex justify-end">
          <Button type="submit" className="w-full sm:w-auto">
            <Send className="size-4" aria-hidden />
            {t("submit")}
          </Button>
        </div>
      </form>
    </Card>
  );
}
