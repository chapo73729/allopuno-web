"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "@/i18n/navigation";

/**
 * Barre héro : saisie libre du besoin. Route vers /publiko avec le texte —
 * le flow de publication fait le parsing (stub NLU, remplacé par AIService).
 */
export function SearchHero() {
  const t = useTranslations("home");
  const router = useRouter();
  const [value, setValue] = useState("");
  const [exampleIndex, setExampleIndex] = useState(0);
  const examples = t.raw("hero.examples") as string[];
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setExampleIndex((i) => (i + 1) % examples.length);
    }, 2800);
    return () => clearInterval(id);
  }, [examples.length]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const q = value.trim();
    router.push(q ? `/publiko?q=${encodeURIComponent(q)}` : "/publiko");
  }

  return (
    <form onSubmit={submit} className="w-full max-w-2xl">
      <div className="flex items-center gap-2 rounded-2xl border border-line bg-card p-2 shadow-(--shadow-pop) focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-100">
        <Sparkles className="ml-2 size-5 shrink-0 text-brand-500" aria-hidden />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={value ? undefined : examples[exampleIndex] ?? t("hero.searchPlaceholder")}
          aria-label={t("hero.searchPlaceholder")}
          className="h-12 w-full min-w-0 bg-transparent text-base text-ink placeholder:text-faint focus:outline-none"
          autoComplete="off"
          enterKeyHint="go"
        />
        <button
          type="submit"
          aria-label={t("hero.publishCta")}
          className="inline-flex h-12 shrink-0 items-center gap-2 rounded-xl bg-brand-600 px-4 font-medium text-white transition-colors hover:bg-brand-700 sm:px-6"
        >
          <span className="hidden sm:inline">{t("hero.publishCta")}</span>
          <ArrowRight className="size-5" aria-hidden />
        </button>
      </div>
    </form>
  );
}
