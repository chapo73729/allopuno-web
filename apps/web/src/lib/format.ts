import { findCity } from "@allopuno/data";
import type { Localized } from "./demo";

export function localized(value: Localized, locale: string): string {
  return locale === "en" ? value.en : value.sq;
}

export function cityName(slug: string, locale: string): string {
  const city = findCity(slug);
  if (!city) return slug;
  return locale === "en" ? city.name.en : city.name.sq;
}

export function formatAgo(hoursAgo: number, locale: string): string {
  const rtf = new Intl.RelativeTimeFormat(locale === "en" ? "en" : "sq", { numeric: "auto" });
  if (hoursAgo < 1) return rtf.format(-Math.max(1, Math.round(hoursAgo * 60)), "minute");
  if (hoursAgo < 24) return rtf.format(-Math.round(hoursAgo), "hour");
  return rtf.format(-Math.round(hoursAgo / 24), "day");
}

export function formatEur(amount: number): string {
  return `${amount} €`;
}
