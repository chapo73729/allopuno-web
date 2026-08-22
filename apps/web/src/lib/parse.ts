import { cities, matchCategoryFromText } from "@allopuno/data";

/**
 * ────────────────────────────────────────────────────────────────────────
 * STUB NLU CÔTÉ CLIENT — v1 vitrine uniquement.
 *
 * Ce module simule la compréhension du texte libre saisi sur /publiko
 * (catégorie, ville, date, urgence, budget). Il sera REMPLACÉ par le module
 * AIService de l'API (doc 05 §D5) dès que le backend est branché — ne pas
 * investir ici : heuristiques volontairement naïves, sans dépendance.
 * ────────────────────────────────────────────────────────────────────────
 */

export interface ParsedRequest {
  categorySlug?: string;
  subSlug?: string;
  citySlug?: string;
  /** Date suggérée au format ISO local (yyyy-mm-dd), prête pour <input type="date">. */
  dateHint?: string;
  urgent: boolean;
  budgetMin?: number;
  budgetMax?: number;
  /** Titre proposé : le texte, nettoyé et tronqué à ~70 caractères. */
  title: string;
}

/** Minuscules + accents albanais aplatis (ë→e, ç→c) pour comparer sans casse. */
function normalize(text: string): string {
  return text.toLowerCase().replace(/ë/g, "e").replace(/ç/g, "c");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Inclusion bornée par des non-lettres — évite « viti » dans « aktiviteti ». */
function includesWord(haystack: string, needle: string): boolean {
  return new RegExp(`(^|[^a-z])${escapeRegExp(needle)}([^a-z]|$)`).test(haystack);
}

/** Comme includesWord mais la fin du mot est libre (« urgjent » ⊂ « urgjente »). */
function includesWordPrefix(haystack: string, needle: string): boolean {
  return new RegExp(`(^|[^a-z])${escapeRegExp(needle)}`).test(haystack);
}

function toIsoDate(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Prochaine occurrence STRICTEMENT future du jour demandé (0 = dimanche). */
function nextWeekday(from: Date, weekday: number): Date {
  const result = new Date(from);
  result.setDate(result.getDate() + (((weekday - from.getDay() + 6) % 7) + 1));
  return result;
}

/** Jours de semaine albanais à l'accusatif (« të hënën »… ), préfixes normalisés. */
const WEEKDAYS: Array<{ needle: string; day: number }> = [
  { needle: "te hen", day: 1 },
  { needle: "te mart", day: 2 },
  { needle: "te merkur", day: 3 },
  { needle: "te enjt", day: 4 },
  { needle: "te premt", day: 5 },
  { needle: "te shtun", day: 6 },
  { needle: "te diel", day: 0 }
];

function makeTitle(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= 72) return clean;
  const cut = clean.slice(0, 70);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 40 ? lastSpace : 70).trimEnd()}…`;
}

export function parseRequestText(text: string): ParsedRequest {
  const norm = normalize(text);
  const result: ParsedRequest = { urgent: false, title: makeTitle(text) };

  // Catégorie / sous-catégorie — recherche naïve par synonymes (packages/data).
  const match = matchCategoryFromText(text);
  if (match) {
    result.categorySlug = match.category.slug;
    if (match.sub) result.subSlug = match.sub.slug;
  }

  // Ville — inclusion des noms sq/en, les plus longs d'abord (« Fushë Kosovë »).
  const byLength = [...cities].sort((a, b) => b.name.sq.length - a.name.sq.length);
  for (const city of byLength) {
    if (includesWord(norm, normalize(city.name.sq)) || includesWord(norm, normalize(city.name.en))) {
      result.citySlug = city.slug;
      break;
    }
  }

  // Urgence — « urgjent(e) », « urgent », « tani ».
  if (
    includesWordPrefix(norm, "urgjent") ||
    includesWordPrefix(norm, "urgent") ||
    includesWord(norm, "tani")
  ) {
    result.urgent = true;
  }

  // Date — aujourd'hui / demain / prochain jour de semaine albanais.
  const today = new Date();
  if (includesWord(norm, "sot") || includesWord(norm, "today")) {
    result.dateHint = toIsoDate(today);
  } else if (includesWord(norm, "neser") || includesWord(norm, "tomorrow")) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    result.dateHint = toIsoDate(tomorrow);
  } else {
    const weekday = WEEKDAYS.find((w) => includesWordPrefix(norm, w.needle));
    if (weekday) result.dateHint = toIsoDate(nextWeekday(today, weekday.day));
  }

  // Budget — « 100-200 », « 100 deri (në) 200 », sinon « €150 » / « 150 euro ».
  const range = norm.match(/(\d{1,4})\s*(?:-|–|—|deri(?:\s+ne)?|to)\s*(\d{1,4})/);
  if (range) {
    const a = Number(range[1]);
    const b = Number(range[2]);
    result.budgetMin = Math.min(a, b);
    result.budgetMax = Math.max(a, b);
  } else {
    const single = norm.match(/€\s*(\d{1,4})/) ?? norm.match(/(\d{1,4})\s*(?:€|euro)/);
    if (single) result.budgetMax = Number(single[1]);
  }

  return result;
}
