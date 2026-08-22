"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Info, LogIn } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Input";

/**
 * Formulaire de connexion v1 vitrine : aucun backend — toute action affiche
 * l'encart « version demo » (les boutons OAuth sont factices, type button).
 */

/** Logo « G » de Google (les logos de marque n'existent pas dans lucide). */
function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="size-4 shrink-0" aria-hidden>
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

/** Logo Apple monochrome. */
function AppleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="currentColor" aria-hidden>
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

export function LoginCard() {
  const t = useTranslations("auth.login");

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [demoNotice, setDemoNotice] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDemoNotice(true);
  }

  return (
    <Card className="w-full max-w-md p-6 sm:p-8">
      <header className="text-center">
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{t("title")}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">{t("subtitle")}</p>
      </header>

      {/* OAuth factice — même destin que le submit : encart demo */}
      <div className="mt-6 flex flex-col gap-2.5">
        <Button type="button" variant="outline" className="w-full" onClick={() => setDemoNotice(true)}>
          <GoogleMark />
          {t("withGoogle")}
        </Button>
        <Button type="button" variant="outline" className="w-full" onClick={() => setDemoNotice(true)}>
          <AppleMark />
          {t("withApple")}
        </Button>
      </div>

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-line" aria-hidden />
        <span className="text-xs font-medium uppercase tracking-wide text-faint">{t("or")}</span>
        <span className="h-px flex-1 bg-line" aria-hidden />
      </div>

      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field label={t("phoneOrEmail")} htmlFor="login-identifier">
          <Input
            id="login-identifier"
            name="identifier"
            autoComplete="username"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
        </Field>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-3">
            <label htmlFor="login-password" className="text-sm font-medium text-ink">
              {t("password")}
            </label>
            {/* Placeholder : le flux « fjalëkalimi i harruar » n'existe pas encore */}
            <Link href="/hyr" className="text-xs font-medium text-brand-700 hover:underline">
              {t("forgot")}
            </Link>
          </div>
          <Input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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

        <Button type="submit" className="w-full">
          <LogIn className="size-4" aria-hidden />
          {t("submit")}
        </Button>
      </form>

      <p className="mt-6 border-t border-line pt-5 text-center text-sm text-muted">
        {t("noAccount")}{" "}
        <Link href="/regjistrohu" className="font-medium text-brand-700 hover:underline">
          {t("registerLink")}
        </Link>
      </p>
    </Card>
  );
}
