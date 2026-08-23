import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * En-tête éditorial réutilisable des pages internes (statiques/légales) :
 * pastille "eyebrow" + titre display + intro. Purement présentationnel — le
 * parent passe des chaînes déjà traduites (next-intl côté page).
 */
export function PageHero({
  eyebrow,
  title,
  intro,
  align = "left",
  children
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  align?: "left" | "center";
  children?: ReactNode;
}) {
  const centered = align === "center";
  return (
    <div className={cn("animate-fade-up", centered && "flex flex-col items-center text-center")}>
      {eyebrow && (
        <span className="inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700">
          {eyebrow}
        </span>
      )}
      <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
        {title}
      </h1>
      {intro && (
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">{intro}</p>
      )}
      {children}
    </div>
  );
}
