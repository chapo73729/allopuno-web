"use client";

import { useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, BadgeCheck, Info, ShieldCheck, UserPlus } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Input";

/**
 * Inscription v1 vitrine en 2 étapes : formulaire → OTP factice. Aucun backend —
 * la vérification affiche l'encart « version demo ». Un seul Input maxLength 6
 * pour le code (plus robuste que 6 cases : collage, autofill SMS, clavier numérique).
 */

type Step = "form" | "otp";

export function RegisterCard() {
  const t = useTranslations("auth.register");
  const tc = useTranslations("common");
  const searchParams = useSearchParams();
  const asPro = searchParams.get("si") === "profesionist";

  const [step, setStep] = useState<Step>("form");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [demoNotice, setDemoNotice] = useState(false);

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStep("otp");
  }

  function submitOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDemoNotice(true);
  }

  return (
    <Card className="relative w-full max-w-md overflow-hidden p-6 shadow-(--shadow-pop) sm:p-8">
      <div className="bg-brand-gradient absolute inset-x-0 top-0 h-1" aria-hidden />
      {asPro && (
        <div className="mb-4 flex justify-center">
          <Badge tone="brand">
            <BadgeCheck className="size-3.5" aria-hidden />
            {t("proBadge")}
          </Badge>
        </div>
      )}

      {step === "form" ? (
        <>
          <header className="text-center">
            <span className="mx-auto inline-flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <UserPlus className="size-6" aria-hidden />
            </span>
            <h1 className="mt-4 font-display text-2xl font-bold tracking-tight sm:text-3xl">
              {t("title")}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted">{t("subtitle")}</p>
          </header>

          <form onSubmit={submitForm} className="mt-6 flex flex-col gap-4">
            <Field label={t("name")} htmlFor="register-name">
              <Input
                id="register-name"
                name="name"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
            <Field label={t("phone")} htmlFor="register-phone">
              <Input
                id="register-phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </Field>
            <Field label={t("email")} htmlFor="register-email">
              <Input
                id="register-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Field label={t("password")} htmlFor="register-password">
              <Input
                id="register-password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>

            <p className="text-xs leading-relaxed text-muted">{t("terms")}</p>

            <Button type="submit" className="w-full">
              {t("submit")}
            </Button>
          </form>
        </>
      ) : (
        <>
          <header className="text-center">
            <span className="inline-flex size-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <ShieldCheck className="size-6" aria-hidden />
            </span>
            <h1 className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">
              {t("otpTitle")}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted">{t("otpText", { phone })}</p>
          </header>

          <form onSubmit={submitOtp} className="mt-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="register-otp" className="sr-only">
                {t("otpLabel")}
              </label>
              <Input
                id="register-otp"
                name="otp"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="h-14 text-center font-display text-2xl font-semibold tracking-[0.5em]"
              />
            </div>

            {demoNotice && (
              <p
                role="status"
                className="flex items-start gap-2 rounded-(--radius-field) bg-wash px-3.5 py-3 text-sm leading-relaxed text-muted"
              >
                <Info className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
                {t("demoNote")}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={code.length < 6}>
              {t("otpSubmit")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setDemoNotice(false);
                setStep("form");
              }}
            >
              <ArrowLeft className="size-4" aria-hidden />
              {tc("actions.back")}
            </Button>
          </form>
        </>
      )}

      <p className="mt-6 border-t border-line pt-5 text-center text-sm text-muted">
        {t("haveAccount")}{" "}
        <Link href="/hyr" className="font-medium text-brand-700 hover:underline">
          {t("loginLink")}
        </Link>
      </p>
    </Card>
  );
}
