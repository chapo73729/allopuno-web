import { getTranslations } from "next-intl/server";
import { BadgeCheck, HeartHandshake, Sparkles, Star } from "lucide-react";
import { Photo } from "@/components/ui/Photo";
import { media } from "@/lib/media";
import { Wordmark } from "./Wordmark";

/**
 * Panneau de marque des pages d'authentification (visible ≥ lg). Photo unifiée
 * sous voile ultramarine + points de confiance — cohérent avec le héros v2.
 */
export async function AuthAside() {
  const t = await getTranslations("auth.aside");

  const points = [
    { icon: HeartHandshake, label: t("point1") },
    { icon: BadgeCheck, label: t("point2") },
    { icon: Star, label: t("point3") }
  ];

  return (
    <aside className="relative hidden min-h-[34rem] flex-col justify-between overflow-hidden rounded-3xl bg-brand-950 p-9 shadow-(--shadow-pop) lg:flex">
      <div className="absolute inset-0 opacity-30" aria-hidden>
        <Photo src={media.hero} alt="" className="h-full w-full" />
      </div>
      <div className="bg-brand-gradient absolute inset-0 opacity-85" aria-hidden />
      <div className="bg-grid absolute inset-0 opacity-20" aria-hidden />

      <div className="relative">
        <Wordmark mark tone="inverse" />
        <span className="mt-8 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
          <Sparkles className="size-3.5" aria-hidden />
          {t("eyebrow")}
        </span>
        <h2 className="mt-4 max-w-sm font-display text-3xl font-bold leading-tight text-white">
          {t("title")}
        </h2>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-brand-100">{t("subtitle")}</p>
      </div>

      <ul className="relative mt-8 flex flex-col gap-3">
        {points.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-3 text-sm font-medium text-white">
            <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white backdrop-blur">
              <Icon className="size-4" aria-hidden />
            </span>
            {label}
          </li>
        ))}
      </ul>
    </aside>
  );
}
