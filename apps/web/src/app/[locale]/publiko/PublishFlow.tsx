"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  Coins,
  MapPin,
  Pencil,
  Plus,
  Sparkles,
  Wallet,
  X,
  Zap
} from "lucide-react";
import { categories, cities, findCategory } from "@allopuno/data";
import { Link, useRouter } from "@/i18n/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input, Textarea } from "@/components/ui/Input";
import { CategoryIcon } from "@/components/CategoryIcon";
import { cn } from "@/lib/cn";
import { publishRequest } from "@/lib/engine";
import { cityName, localized } from "@/lib/format";
import { parseRequestText, type ParsedRequest } from "@/lib/parse";

/**
 * Wizard de publication (spec v2, écrans 007→016) :
 * Përshkruaj → Kuptuam (IA + corrections) → Data → Buxheti → Fotot →
 * Përmbledhja → animation « po kërkojmë » → U publikua.
 * Publication réelle dans le moteur client (localStorage) : la demande vit
 * ensuite dans /kerkesat, où les offres simulées arrivent en direct.
 */

type StepKey = "describe" | "understood" | "date" | "budget" | "photos" | "summary";
const STEPS: StepKey[] = ["describe", "understood", "date", "budget", "photos", "summary"];

type Phase = "form" | "publishing" | "published";
type BudgetChoice = "unknown" | "u50" | "b50" | "b100" | "b250" | "o500" | "custom";
type DateChoice = "sot" | "neser" | "kete-jave" | "exact" | "s-e-di";

const BUDGETS: Array<{ key: BudgetChoice; min?: number; max?: number }> = [
  { key: "unknown" },
  { key: "u50", max: 50 },
  { key: "b50", min: 50, max: 100 },
  { key: "b100", min: 100, max: 250 },
  { key: "b250", min: 250, max: 500 },
  { key: "o500", min: 500 },
  { key: "custom" }
];

const BUDGET_LABEL_KEY: Record<BudgetChoice, string> = {
  unknown: "unknown",
  u50: "under50",
  b50: "range50to100",
  b100: "range100to250",
  b250: "range250to500",
  o500: "over500",
  custom: "custom"
};

export function PublishFlow() {
  const t = useTranslations("publish");
  const tc = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [phase, setPhase] = useState<Phase>("form");
  const [step, setStep] = useState(0);

  const [text, setText] = useState("");
  const [parsed, setParsed] = useState<ParsedRequest | null>(null);
  const [categorySlug, setCategorySlug] = useState("");
  const [subSlug, setSubSlug] = useState("");
  const [citySlug, setCitySlug] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [dateChoice, setDateChoice] = useState<DateChoice>("s-e-di");
  const [exactDate, setExactDate] = useState("");
  const [timeChoice, setTimeChoice] = useState("");
  const [budgetChoice, setBudgetChoice] = useState<BudgetChoice>("unknown");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [publishedId, setPublishedId] = useState("");
  const photosRef = useRef<string[]>([]);
  photosRef.current = photos;

  // Pré-remplissage depuis ?q= (barre héro de l'accueil).
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setText(q);
  }, [searchParams]);

  // Nettoyage des aperçus photo (URLs objet locales).
  useEffect(() => () => photosRef.current.forEach((url) => URL.revokeObjectURL(url)), []);

  const category = categorySlug ? findCategory(categorySlug) : undefined;

  function analyze() {
    const result = parseRequestText(text);
    setParsed(result);
    setCategorySlug(result.categorySlug ?? "");
    setSubSlug(result.subSlug ?? "");
    setCitySlug(result.citySlug ?? "");
    setUrgent(result.urgent);
    if (result.dateHint) {
      setDateChoice("exact");
      setExactDate(result.dateHint);
    }
    if (result.budgetMin !== undefined || result.budgetMax !== undefined) {
      setBudgetChoice("custom");
      setBudgetMin(result.budgetMin !== undefined ? String(result.budgetMin) : "");
      setBudgetMax(result.budgetMax !== undefined ? String(result.budgetMax) : "");
    }
    setStep(1);
  }

  const budgetValues = useMemo((): { min?: number; max?: number } => {
    if (budgetChoice === "custom") {
      const min = budgetMin ? Number(budgetMin) : undefined;
      const max = budgetMax ? Number(budgetMax) : undefined;
      return { min: Number.isFinite(min) ? min : undefined, max: Number.isFinite(max) ? max : undefined };
    }
    const preset = BUDGETS.find((b) => b.key === budgetChoice);
    return { min: preset?.min, max: preset?.max };
  }, [budgetChoice, budgetMin, budgetMax]);

  function budgetLabel(): string {
    if (budgetChoice === "custom") {
      const { min, max } = budgetValues;
      if (min !== undefined && max !== undefined) return t("budget.customRange", { min, max });
      if (max !== undefined) return t("budget.customMax", { max });
      if (min !== undefined) return t("budget.customMin", { min });
      return t("budget.unknown");
    }
    return t(`budget.${BUDGET_LABEL_KEY[budgetChoice]}` as never);
  }

  function dateLabel(): string {
    if (dateChoice === "exact" && exactDate) return exactDate;
    const map: Record<DateChoice, string> = {
      sot: "today",
      neser: "tomorrow",
      "kete-jave": "thisWeek",
      exact: "exact",
      "s-e-di": "unknown"
    };
    const base = t(`date.${map[dateChoice]}` as never);
    if (!timeChoice) return base;
    return `${base} · ${t(`date.${timeChoice}` as never)}`;
  }

  function addPhotos(files: FileList | null) {
    if (!files) return;
    const urls = Array.from(files)
      .slice(0, 10 - photos.length)
      .map((f) => URL.createObjectURL(f));
    setPhotos((prev) => [...prev, ...urls].slice(0, 10));
  }

  function publish() {
    setPhase("publishing");
    const id = publishRequest({
      title: parsed?.title || text.trim().slice(0, 70),
      description: text.trim(),
      categorySlug: categorySlug || undefined,
      subSlug: subSlug || undefined,
      citySlug: citySlug || undefined,
      dateChoice: dateChoice === "exact" ? exactDate || "s-e-di" : dateChoice,
      timeChoice: timeChoice || undefined,
      urgent,
      budgetMin: budgetValues.min,
      budgetMax: budgetValues.max,
      photosCount: photos.length
    });
    setPublishedId(id);
    window.setTimeout(() => setPhase("published"), 1900);
  }

  const canContinue =
    step === 0
      ? text.trim().length >= 8
      : step === 1
        ? Boolean(categorySlug && citySlug)
        : step === 2
          ? dateChoice !== "exact" || Boolean(exactDate)
          : true;

  /* ────────────────────── Phases publication / publiée ────────────────────── */

  if (phase === "publishing") {
    return (
      <div className="animate-fade-in flex flex-col items-center py-16 text-center">
        <span className="relative flex size-20 items-center justify-center" aria-hidden>
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-200 opacity-60" />
          <span className="relative inline-flex size-16 items-center justify-center rounded-full bg-brand-600 text-white shadow-(--shadow-brand)">
            <Sparkles className="size-7" />
          </span>
        </span>
        <h1 className="mt-6 font-display text-2xl font-bold">{t("publishing.title")}</h1>
        <p className="mt-2 max-w-sm text-muted">{t("publishing.text")}</p>
      </div>
    );
  }

  if (phase === "published") {
    return (
      <div className="animate-fade-up flex flex-col items-center py-10 text-center">
        <span className="inline-flex size-16 items-center justify-center rounded-full bg-success-soft text-success">
          <CheckCircle2 className="size-8" aria-hidden />
        </span>
        <Badge tone="success" className="mt-4">{t("published.badge")}</Badge>
        <h1 className="mt-3 font-display text-3xl font-extrabold">{t("published.title")}</h1>
        <p className="mt-3 max-w-md text-muted">{t("published.text")}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button as={Link} href={`/kerkesat/${publishedId}`} size="lg">
            {t("published.viewRequest")}
            <ArrowRight className="size-5" aria-hidden />
          </Button>
          <Button as={Link} href="/" variant="outline" size="lg">
            {t("published.backHome")}
          </Button>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────── Formulaire ─────────────────────────────── */

  return (
    <div className="animate-fade-up">
      <header className="text-center">
        <Badge tone="success">{t("badge")}</Badge>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          {t("title")}
        </h1>
      </header>

      {/* Indicateur d'étapes */}
      <div className="mt-6">
        <div className="flex items-center justify-between text-xs font-medium text-muted">
          <span>{t("steps.progress", { current: step + 1, total: STEPS.length })}</span>
          <span className="text-brand-700">{t(`steps.${STEPS[step]}` as never)}</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-wash" role="presentation">
          <div
            className="bg-brand-gradient h-full rounded-full transition-all duration-500"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <Card className="mt-6 p-5 sm:p-7">
        {/* ÉTAPE 1 — Décrire (écran 007) */}
        {step === 0 && (
          <div className="flex flex-col gap-4">
            <Field label={t("freeText.label")} hint={t("freeText.hint")} htmlFor="pub-text">
              <Textarea
                id="pub-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t("freeText.placeholder")}
                className="min-h-36 text-base"
                autoFocus
              />
            </Field>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-faint">
                {t("freeText.examplesLabel")}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(t.raw("freeText.examples") as string[]).map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => setText(example)}
                    className="rounded-full border border-line bg-paper px-3 py-1.5 text-xs text-muted transition-colors hover:border-brand-300 hover:text-brand-700"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ÉTAPE 2 — Kuptuam (écran 008/009/010 : IA + corrections) */}
        {step === 1 && (
          <div className="flex flex-col gap-5">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="size-5 text-brand-600" aria-hidden />
                <h2 className="font-display text-xl font-bold">{t("understood.title")}</h2>
              </div>
              <p className="mt-1 text-sm text-muted">{t("understood.subtitle")}</p>
            </div>

            <blockquote className="rounded-(--radius-field) border-l-2 border-brand-300 bg-wash px-4 py-3 text-sm italic text-muted">
              {text}
            </blockquote>

            <Field label={t("understood.category")} htmlFor="pub-cat">
              <div className="flex flex-col gap-2">
                <select
                  id="pub-cat"
                  value={categorySlug}
                  onChange={(e) => {
                    setCategorySlug(e.target.value);
                    setSubSlug("");
                  }}
                  className="h-11 w-full rounded-(--radius-field) border border-line bg-card px-3 text-[0.95rem] focus:border-brand-400 focus:outline-none"
                >
                  <option value="">{t("category.title")}</option>
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {localized(c.name, locale)}
                    </option>
                  ))}
                </select>
                {parsed?.categorySlug && categorySlug === parsed.categorySlug ? (
                  <span className="inline-flex items-center gap-1 self-start rounded-full bg-brand-50 px-2 py-0.5 text-[0.7rem] font-medium text-brand-700">
                    <Check className="size-3" aria-hidden />
                    {t("understood.autoDetected")}
                  </span>
                ) : !categorySlug ? (
                  <span className="text-xs text-warning">{t("understood.missing")}</span>
                ) : null}
              </div>
            </Field>

            {category && category.children.length > 0 && (
              <Field label={t("category.subLabel")} htmlFor="pub-sub">
                <select
                  id="pub-sub"
                  value={subSlug}
                  onChange={(e) => setSubSlug(e.target.value)}
                  className="h-11 w-full rounded-(--radius-field) border border-line bg-card px-3 text-[0.95rem] focus:border-brand-400 focus:outline-none"
                >
                  <option value="">{t("category.subAny")}</option>
                  {category.children.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {localized(s.name, locale)}
                    </option>
                  ))}
                </select>
              </Field>
            )}

            <Field label={t("understood.city")} htmlFor="pub-city">
              <div className="flex flex-col gap-2">
                <select
                  id="pub-city"
                  value={citySlug}
                  onChange={(e) => setCitySlug(e.target.value)}
                  className="h-11 w-full rounded-(--radius-field) border border-line bg-card px-3 text-[0.95rem] focus:border-brand-400 focus:outline-none"
                >
                  <option value="">{t("city.title")}</option>
                  {cities.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {localized(c.name, locale)}
                    </option>
                  ))}
                </select>
                {parsed?.citySlug && citySlug === parsed.citySlug ? (
                  <span className="inline-flex items-center gap-1 self-start rounded-full bg-brand-50 px-2 py-0.5 text-[0.7rem] font-medium text-brand-700">
                    <Check className="size-3" aria-hidden />
                    {t("understood.autoDetected")}
                  </span>
                ) : !citySlug ? (
                  <span className="text-xs text-warning">{t("understood.missing")}</span>
                ) : null}
              </div>
            </Field>

            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">{t("understood.urgency")}</span>
              <div className="grid grid-cols-2 gap-2" role="group" aria-label={t("understood.urgency")}>
                <button
                  type="button"
                  aria-pressed={!urgent}
                  onClick={() => setUrgent(false)}
                  className={cn(
                    "h-11 rounded-(--radius-field) border text-sm font-medium transition-colors",
                    !urgent ? "border-brand-400 bg-brand-50 text-brand-700" : "border-line bg-card text-muted"
                  )}
                >
                  {t("understood.urgentNo")}
                </button>
                <button
                  type="button"
                  aria-pressed={urgent}
                  onClick={() => setUrgent(true)}
                  className={cn(
                    "inline-flex h-11 items-center justify-center gap-1.5 rounded-(--radius-field) border text-sm font-medium transition-colors",
                    urgent ? "border-danger bg-danger-soft text-danger" : "border-line bg-card text-muted"
                  )}
                >
                  <Zap className="size-4" aria-hidden />
                  {t("understood.urgentYes")}
                </button>
              </div>
              <p className="text-xs text-muted">{t("understood.urgentHint")}</p>
            </div>
          </div>
        )}

        {/* ÉTAPE 3 — Data (écran 011) */}
        {step === 2 && (
          <div className="flex flex-col gap-5">
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="size-5 text-brand-600" aria-hidden />
                <h2 className="font-display text-xl font-bold">{t("date.title")}</h2>
              </div>
              <p className="mt-1 text-sm text-muted">{t("date.subtitle")}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" role="group" aria-label={t("date.title")}>
              {(
                [
                  ["sot", "today"],
                  ["neser", "tomorrow"],
                  ["kete-jave", "thisWeek"],
                  ["exact", "exact"],
                  ["s-e-di", "unknown"]
                ] as Array<[DateChoice, string]>
              ).map(([value, key]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={dateChoice === value}
                  onClick={() => setDateChoice(value)}
                  className={cn(
                    "h-11 rounded-(--radius-field) border text-sm font-medium transition-colors",
                    dateChoice === value
                      ? "border-brand-400 bg-brand-50 text-brand-700"
                      : "border-line bg-card text-muted hover:border-brand-200"
                  )}
                >
                  {t(`date.${key}` as never)}
                </button>
              ))}
            </div>
            {dateChoice === "exact" && (
              <Field label={t("date.pickDate")} htmlFor="pub-date">
                <Input
                  id="pub-date"
                  type="date"
                  value={exactDate}
                  onChange={(e) => setExactDate(e.target.value)}
                />
              </Field>
            )}
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">{t("date.timeLabel")}</span>
              <div className="grid grid-cols-3 gap-2" role="group" aria-label={t("date.timeLabel")}>
                {["morning", "afternoon", "evening"].map((key) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={timeChoice === key}
                    onClick={() => setTimeChoice((prev) => (prev === key ? "" : key))}
                    className={cn(
                      "h-11 rounded-(--radius-field) border text-sm font-medium transition-colors",
                      timeChoice === key
                        ? "border-brand-400 bg-brand-50 text-brand-700"
                        : "border-line bg-card text-muted hover:border-brand-200"
                    )}
                  >
                    {t(`date.${key}` as never)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ÉTAPE 4 — Buxheti (écran 012, jamais bloquant) */}
        {step === 3 && (
          <div className="flex flex-col gap-5">
            <div>
              <div className="flex items-center gap-2">
                <Wallet className="size-5 text-brand-600" aria-hidden />
                <h2 className="font-display text-xl font-bold">{t("budget.title")}</h2>
              </div>
              <p className="mt-1 text-sm text-muted">{t("budget.subtitle")}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" role="group" aria-label={t("budget.title")}>
              {BUDGETS.map(({ key }) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={budgetChoice === key}
                  onClick={() => setBudgetChoice(key)}
                  className={cn(
                    "h-11 rounded-(--radius-field) border text-sm font-medium transition-colors",
                    budgetChoice === key
                      ? "border-brand-400 bg-brand-50 text-brand-700"
                      : "border-line bg-card text-muted hover:border-brand-200"
                  )}
                >
                  {t(`budget.${BUDGET_LABEL_KEY[key]}` as never)}
                </button>
              ))}
            </div>
            {budgetChoice === "custom" && (
              <div className="grid grid-cols-2 gap-3">
                <Field label={t("budget.min")} htmlFor="pub-bmin">
                  <Input
                    id="pub-bmin"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(e.target.value)}
                  />
                </Field>
                <Field label={t("budget.max")} htmlFor="pub-bmax">
                  <Input
                    id="pub-bmax"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value)}
                  />
                </Field>
              </div>
            )}
          </div>
        )}

        {/* ÉTAPE 5 — Fotot (écran 013) */}
        {step === 4 && (
          <div className="flex flex-col gap-5">
            <div>
              <div className="flex items-center gap-2">
                <Camera className="size-5 text-brand-600" aria-hidden />
                <h2 className="font-display text-xl font-bold">{t("photos.title")}</h2>
              </div>
              <p className="mt-1 text-sm text-muted">{t("photos.subtitle")}</p>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {photos.map((url, i) => (
                <div key={url} className="group relative aspect-square overflow-hidden rounded-(--radius-field) border border-line bg-wash">
                  {/* Aperçu local uniquement (URL objet) — jamais envoyé (version demo) */}
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    aria-label={`${t("photos.remove")} ${i + 1}`}
                    onClick={() => {
                      URL.revokeObjectURL(url);
                      setPhotos((prev) => prev.filter((p) => p !== url));
                    }}
                    className="absolute right-1 top-1 inline-flex size-6 items-center justify-center rounded-full bg-ink/70 text-white opacity-90 transition-opacity hover:opacity-100"
                  >
                    <X className="size-3.5" aria-hidden />
                  </button>
                </div>
              ))}
              {photos.length < 10 && (
                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-(--radius-field) border-2 border-dashed border-line text-muted transition-colors hover:border-brand-300 hover:text-brand-700">
                  <Plus className="size-6" aria-hidden />
                  <span className="text-xs font-medium">{t("photos.add")}</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    onChange={(e) => {
                      addPhotos(e.target.files);
                      e.target.value = "";
                    }}
                  />
                </label>
              )}
            </div>
            <p className="text-xs text-faint">{t("photos.hint")}</p>
          </div>
        )}

        {/* ÉTAPE 6 — Përmbledhja (écran 014) */}
        {step === 5 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="font-display text-xl font-bold">{t("summary.title")}</h2>
              <p className="mt-1 text-sm text-muted">{t("summary.subtitle")}</p>
            </div>
            <div className="rounded-(--radius-field) bg-wash p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-faint">{t("summary.request")}</p>
              <p className="mt-1.5 font-display text-lg font-semibold">{parsed?.title || text.trim().slice(0, 70)}</p>
              <p className="mt-1 line-clamp-3 text-sm text-muted">{text}</p>
            </div>
            <ul className="flex flex-col divide-y divide-line rounded-(--radius-field) border border-line">
              {[
                {
                  icon: category ? (
                    <CategoryIcon name={category.icon} className="size-4 text-brand-600" />
                  ) : (
                    <Sparkles className="size-4 text-brand-600" aria-hidden />
                  ),
                  label: t("understood.category"),
                  value: category
                    ? `${localized(category.name, locale)}${
                        subSlug
                          ? ` · ${localized(category.children.find((s) => s.slug === subSlug)?.name ?? { sq: "", en: "" }, locale)}`
                          : ""
                      }`
                    : "—",
                  goTo: 1
                },
                {
                  icon: <MapPin className="size-4 text-brand-600" aria-hidden />,
                  label: t("understood.city"),
                  value: citySlug ? cityName(citySlug, locale) : "—",
                  goTo: 1
                },
                {
                  icon: <Calendar className="size-4 text-brand-600" aria-hidden />,
                  label: t("understood.date"),
                  value: dateLabel(),
                  goTo: 2
                },
                {
                  icon: <Coins className="size-4 text-brand-600" aria-hidden />,
                  label: t("understood.budget"),
                  value: budgetLabel(),
                  goTo: 3
                },
                {
                  icon: <Camera className="size-4 text-brand-600" aria-hidden />,
                  label: t("photos.title"),
                  value: t("photos.count", { count: photos.length }),
                  goTo: 4
                }
              ].map((row) => (
                <li key={row.label} className="flex items-center gap-3 px-4 py-3">
                  {row.icon}
                  <span className="w-24 shrink-0 text-xs font-medium uppercase tracking-wide text-faint">
                    {row.label}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{row.value}</span>
                  <button
                    type="button"
                    aria-label={`${t("understood.edit")} — ${row.label}`}
                    onClick={() => setStep(row.goTo)}
                    className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-faint transition-colors hover:bg-wash hover:text-brand-700"
                  >
                    <Pencil className="size-4" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
            {urgent && (
              <Badge tone="danger" className="self-start">
                <Zap className="size-3" aria-hidden />
                {t("understood.urgentYes")}
              </Badge>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-7 flex items-center justify-between gap-3 border-t border-line pt-5">
          {step > 0 ? (
            <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
              <ArrowLeft className="size-4" aria-hidden />
              {tc("actions.back")}
            </Button>
          ) : (
            <span />
          )}
          {step === 0 && (
            <Button onClick={analyze} disabled={!canContinue}>
              {tc("actions.continue")}
              <ArrowRight className="size-4" aria-hidden />
            </Button>
          )}
          {step > 0 && step < STEPS.length - 1 && (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canContinue}>
              {tc("actions.continue")}
              <ArrowRight className="size-4" aria-hidden />
            </Button>
          )}
          {step === STEPS.length - 1 && (
            <Button size="lg" onClick={publish}>
              {t("submit")}
              <ArrowRight className="size-5" aria-hidden />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
