"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/cn";

type Day = {
  key: number;
  weekday: string;
  dayOfMonth: number;
  booked: boolean;
};

/**
 * Grille des 14 prochains jours, calculée côté client au chargement — la page
 * est SSG (generateStaticParams), un calcul au rendu serveur figerait les dates
 * au moment du build. Calendrier FACTICE mais honnête : ~3 jours « réservés »
 * de façon déterministe (index % 5 === 2).
 */
export function AvailabilityDays() {
  const locale = useLocale();
  const t = useTranslations("rentals");
  const [days, setDays] = useState<Day[]>([]);

  useEffect(() => {
    const dayFormatter = new Intl.DateTimeFormat(locale === "en" ? "en" : "sq", {
      weekday: "short"
    });
    const today = new Date();
    setDays(
      Array.from({ length: 14 }, (_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        return {
          key: i,
          weekday: dayFormatter.format(date),
          dayOfMonth: date.getDate(),
          booked: i % 5 === 2
        };
      })
    );
  }, [locale]);

  return (
    <ol className="mt-4 grid grid-cols-7 gap-1.5 sm:gap-2">
      {days.length === 0
        ? // Cellules de même hauteur avant le calcul client — évite tout saut
          // de mise en page entre le HTML statique et l'hydratation.
          Array.from({ length: 14 }, (_, i) => (
            <li
              key={i}
              aria-hidden
              className="flex flex-col items-center gap-0.5 rounded-(--radius-field) border border-line bg-card py-2"
            >
              <span className="invisible text-[10px] uppercase tracking-wide">·</span>
              <span className="invisible text-sm font-semibold tabular-nums">0</span>
            </li>
          ))
        : days.map((day) => (
            <li
              key={day.key}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-(--radius-field) border py-2",
                day.booked ? "border-transparent bg-wash" : "border-line bg-card"
              )}
            >
              <span
                className={cn(
                  "text-[10px] uppercase tracking-wide",
                  day.booked ? "text-faint" : "text-muted"
                )}
              >
                {day.weekday}
              </span>
              <span
                className={cn(
                  "text-sm font-semibold tabular-nums",
                  day.booked && "text-faint line-through"
                )}
              >
                {day.dayOfMonth}
              </span>
              <span className="sr-only">
                {day.booked ? t("legendBooked") : t("legendAvailable")}
              </span>
            </li>
          ))}
    </ol>
  );
}
