"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Bell,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  Eye,
  ImagePlus,
  Loader2,
  MapPin,
  MessagesSquare,
  Send,
  Sparkles,
  Tag,
  Wallet,
  X,
  Zap
} from "lucide-react";
import { cities, findCategory, serviceCategories } from "@allopuno/data";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input, Textarea } from "@/components/ui/Input";
import { cn } from "@/lib/cn";
import { cityName, localized } from "@/lib/format";
import { parseRequestText } from "@/lib/parse";

/**
 * Wizard de publication en 3 étapes (CDC : publication < 60 s) :
 * Përshkruaj → Konfirmo → Sukses. v1 vitrine : le parsing est un stub client
 * (lib/parse.ts) et « Publiko » ne fait que simuler — aucun backend.
 */

type Step = "describe" | "confirm" | "success";

interface FormState {
  title: string;
  description: string;
  categorySlug: string;
  subSlug: string;
  citySlug: string;
  date: string;
  flexible: boolean;
  urgent: boolean;
  budgetMin: string;
  budgetMax: string;
  visibility: "public" | "private";
}

interface PhotoPreview {
  id: string;
  url: string;
  name: string;
}

const MAX_PHOTOS = 6;

const selectClasses =
  "h-12 w-full appearance-none rounded-(--radius-field) border border-line bg-card px-3.5 pr-10 text-[0.95rem] text-ink transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100";

function emptyForm(): FormState {
  return {
    title: "",
    description: "",
    categorySlug: "",
    subSlug: "",
    citySlug: "",
    date: "",
    flexible: true,
    urgent: false,
    budgetMin: "",
    budgetMax: "",
    visibility: "public"
  };
}

/** Habillage d'un <select> natif : ajoute le chevron cohérent du design system. */
function SelectShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-faint"
        aria-hidden
      />
    </div>
  );
}

/** Petite pastille d'icône pour rythmer les lignes du récapitulatif. */
function RowIcon({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
      {children}
    </span>
  );
}

/** Interrupteur accessible (role=switch) avec zone tactile ≥ 44 px. */
function Switch({
  checked,
  onChange,
  label
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="-m-2 shrink-0 p-2"
    >
      <span
        className={cn(
          "relative block h-7 w-12 rounded-full transition-colors",
          checked ? "bg-brand-600" : "bg-line"
        )}
        aria-hidden
      >
        <span
          className={cn(
            "absolute top-1 size-5 rounded-full bg-white shadow-sm transition-all",
            checked ? "left-6" : "left-1"
          )}
        />
      </span>
    </button>
  );
}

/** Ligne « détecté » : valeur comprise + bouton Ndrysho pour l'éditer. */
function DetectedRow({
  icon,
  label,
  value,
  editLabel,
  onEdit
}: {
  icon: ReactNode;
  label: string;
  value: string;
  editLabel: string;
  onEdit: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <RowIcon>{icon}</RowIcon>
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink">{label}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-[0.95rem] text-muted">
            <CheckCircle2 className="size-4 shrink-0 text-success" aria-hidden />
            <span className="truncate">{value}</span>
          </p>
        </div>
      </div>
      <Button variant="ghost" size="sm" onClick={onEdit} className="shrink-0 text-brand-700">
        {editLabel}
      </Button>
    </div>
  );
}

export function PublishFlow() {
  const t = useTranslations("publish");
  const tc = useTranslations("common");
  const locale = useLocale();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<Step>("describe");
  const [text, setText] = useState(() => searchParams.get("q") ?? "");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editCategory, setEditCategory] = useState(false);
  const [editCity, setEditCity] = useState(false);
  const [photos, setPhotos] = useState<PhotoPreview[]>([]);
  const [publishing, setPublishing] = useState(false);

  const publishTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const photosRef = useRef<PhotoPreview[]>([]);

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  // Nettoyage : aperçus locaux (les fichiers ne sont jamais envoyés) + timer.
  useEffect(() => {
    return () => {
      photosRef.current.forEach((p) => URL.revokeObjectURL(p.url));
      if (publishTimer.current) clearTimeout(publishTimer.current);
    };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [step]);

  const todayIso = useMemo(() => {
    const now = new Date();
    const month = `${now.getMonth() + 1}`.padStart(2, "0");
    const day = `${now.getDate()}`.padStart(2, "0");
    return `${now.getFullYear()}-${month}-${day}`;
  }, []);

  // Le stub peut détecter une catégorie « qira » : on l'ajoute aux options.
  const categoryOptions = useMemo(() => {
    const base = [...serviceCategories];
    if (form.categorySlug && !base.some((c) => c.slug === form.categorySlug)) {
      const extra = findCategory(form.categorySlug);
      if (extra) base.push(extra);
    }
    return base;
  }, [form.categorySlug]);

  const selectedCategory = form.categorySlug ? findCategory(form.categorySlug) : undefined;
  const selectedSub = selectedCategory?.children.find((s) => s.slug === form.subSlug);

  const categoryValueLabel = selectedCategory
    ? selectedSub
      ? `${localized(selectedCategory.name, locale)} · ${localized(selectedSub.name, locale)}`
      : localized(selectedCategory.name, locale)
    : "";

  const canPublish = Boolean(form.categorySlug && form.citySlug);

  const examples = t.raw("freeText.examples") as string[];

  function patch(partial: Partial<FormState>) {
    setForm((prev) => ({ ...prev, ...partial }));
  }

  function analyze() {
    const trimmed = text.trim();
    if (!trimmed) return;
    const parsed = parseRequestText(trimmed);
    setForm({
      title: parsed.title,
      description: trimmed,
      categorySlug: parsed.categorySlug ?? "",
      subSlug: parsed.subSlug ?? "",
      citySlug: parsed.citySlug ?? "",
      date: parsed.dateHint ?? "",
      flexible: !parsed.dateHint,
      urgent: parsed.urgent,
      budgetMin: parsed.budgetMin != null ? String(parsed.budgetMin) : "",
      budgetMax: parsed.budgetMax != null ? String(parsed.budgetMax) : "",
      visibility: "public"
    });
    // Ne redemander que ce qui manque : le reste s'affiche déjà rempli.
    setEditCategory(!parsed.categorySlug);
    setEditCity(!parsed.citySlug);
    setStep("confirm");
  }

  function onPhotosSelected(event: ChangeEvent<HTMLInputElement>) {
    const remaining = Math.max(0, MAX_PHOTOS - photos.length);
    const files = Array.from(event.target.files ?? []).slice(0, remaining);
    if (files.length > 0) {
      const next = files.map((file, index) => ({
        id: `${Date.now()}-${index}-${file.name}`,
        url: URL.createObjectURL(file),
        name: file.name
      }));
      setPhotos((prev) => [...prev, ...next]);
    }
    event.target.value = "";
  }

  function removePhoto(id: string) {
    setPhotos((prev) => {
      const removed = prev.find((p) => p.id === id);
      if (removed) URL.revokeObjectURL(removed.url);
      return prev.filter((p) => p.id !== id);
    });
  }

  function publish() {
    if (!canPublish || publishing) return;
    setPublishing(true);
    // Simulation v1 vitrine : aucun appel réseau, la kërkesa n'est pas enregistrée.
    publishTimer.current = setTimeout(() => {
      setPublishing(false);
      setStep("success");
    }, 700);
  }

  const stepIndex = step === "describe" ? 0 : step === "confirm" ? 1 : 2;
  const stepLabels = [t("steps.describe"), t("steps.confirm"), t("steps.done")];

  return (
    <div>
      <header className="text-center">
        {step === "describe" && (
          <span className="animate-fade-in mb-4 inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            <Sparkles className="size-3.5" aria-hidden />
            {t("badge")}
          </span>
        )}
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          {t("title")}
        </h1>
        {step === "describe" && <p className="mt-2 text-muted">{t("subtitle")}</p>}
      </header>

      {/* Indicateur d'étapes */}
      <nav aria-label={t("title")} className="mt-7">
        <p className="mb-3 text-center text-xs font-medium uppercase tracking-wide text-faint">
          {t("steps.progress", { current: stepIndex + 1, total: stepLabels.length })}
        </p>
        <ol className="flex items-center justify-center">
          {stepLabels.map((label, i) => {
            const done = i < stepIndex;
            const current = i === stepIndex;
            return (
              <li key={label} className="flex items-center" aria-current={current ? "step" : undefined}>
                {i > 0 && (
                  <span
                    className={cn(
                      "mx-2 h-0.5 w-7 rounded-full transition-colors sm:mx-3 sm:w-12",
                      i <= stepIndex ? "bg-brand-500" : "bg-line"
                    )}
                    aria-hidden
                  />
                )}
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex size-8 items-center justify-center rounded-full text-sm font-bold transition-all",
                      done && "bg-brand-600 text-white",
                      current && "bg-brand-600 text-white shadow-(--shadow-brand) ring-4 ring-brand-100",
                      !done && !current && "bg-wash text-faint"
                    )}
                  >
                    {done ? <Check className="size-4" aria-hidden /> : i + 1}
                  </span>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      current ? "inline text-ink" : "hidden text-faint sm:inline"
                    )}
                  >
                    {label}
                  </span>
                </span>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* ÉTAPE 1 — Përshkruaj */}
      {step === "describe" && (
        <Card className="animate-fade-up mt-8 p-4 sm:p-6">
          <Field label={t("freeText.label")} htmlFor="publiko-text" hint={t("freeText.hint")}>
            <Textarea
              id="publiko-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("freeText.placeholder")}
              rows={5}
              className="min-h-36 text-base"
              autoComplete="off"
            />
          </Field>

          {/* Exemples cliquables — remplissent le champ, aucun envoi */}
          <div className="mt-4">
            <p className="text-xs font-medium text-faint">{t("freeText.examplesLabel")}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {examples.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => setText(example)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-3 py-1.5 text-left text-xs font-medium text-muted transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                >
                  <Sparkles className="size-3.5 shrink-0 text-brand-400" aria-hidden />
                  {example}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <Button
              size="lg"
              onClick={analyze}
              disabled={!text.trim()}
              className="w-full sm:w-auto"
            >
              {t("freeText.analyze")}
              <ArrowRight className="size-5" aria-hidden />
            </Button>
          </div>
        </Card>
      )}

      {/* ÉTAPE 2 — Konfirmo */}
      {step === "confirm" && (
        <div className="animate-fade-up mt-8">
          <Card className="overflow-hidden">
            <div className="relative overflow-hidden border-b border-line bg-hero-wash px-4 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <span className="inline-flex size-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-(--shadow-brand)">
                  <Sparkles className="size-5" aria-hidden />
                </span>
                <h2 className="font-display text-lg font-semibold">{t("understood.title")}</h2>
              </div>
            </div>

            {/* Rappel de ce qui a été écrit */}
            <div className="mx-4 mt-4 rounded-(--radius-field) border-l-2 border-brand-300 bg-wash px-3.5 py-3 sm:mx-6">
              <p className="text-[0.7rem] font-medium uppercase tracking-wide text-faint">
                {t("understood.yourText")}
              </p>
              <p className="mt-1 text-sm font-medium text-ink">{form.title}</p>
              {form.description !== form.title && (
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
                  {form.description}
                </p>
              )}
            </div>

            <div className="divide-y divide-line px-4 sm:px-6">
              {/* Kategoria */}
              <div className="py-4">
                {!editCategory && selectedCategory ? (
                  <DetectedRow
                    icon={<Tag className="size-4.5" aria-hidden />}
                    label={t("understood.category")}
                    value={categoryValueLabel}
                    editLabel={t("understood.edit")}
                    onEdit={() => setEditCategory(true)}
                  />
                ) : (
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="flex flex-1 flex-col gap-1.5">
                      <label htmlFor="publiko-category" className="text-sm font-medium text-ink">
                        {t("understood.category")}
                      </label>
                      <SelectShell>
                        <select
                          id="publiko-category"
                          className={selectClasses}
                          value={form.categorySlug}
                          onChange={(e) => patch({ categorySlug: e.target.value, subSlug: "" })}
                        >
                          <option value="">{t("understood.missingCategory")}</option>
                          {categoryOptions.map((category) => (
                            <option key={category.slug} value={category.slug}>
                              {localized(category.name, locale)}
                            </option>
                          ))}
                        </select>
                      </SelectShell>
                    </div>
                    {selectedCategory && selectedCategory.children.length > 0 && (
                      <div className="flex flex-1 flex-col gap-1.5">
                        <label htmlFor="publiko-sub" className="text-sm font-medium text-ink">
                          {t("fields.subcategory")}
                        </label>
                        <SelectShell>
                          <select
                            id="publiko-sub"
                            className={selectClasses}
                            value={form.subSlug}
                            onChange={(e) => patch({ subSlug: e.target.value })}
                          >
                            <option value="">{localized(selectedCategory.name, locale)}</option>
                            {selectedCategory.children.map((sub) => (
                              <option key={sub.slug} value={sub.slug}>
                                {localized(sub.name, locale)}
                              </option>
                            ))}
                          </select>
                        </SelectShell>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Qyteti */}
              <div className="py-4">
                {!editCity && form.citySlug ? (
                  <DetectedRow
                    icon={<MapPin className="size-4.5" aria-hidden />}
                    label={t("understood.city")}
                    value={cityName(form.citySlug, locale)}
                    editLabel={t("understood.edit")}
                    onEdit={() => setEditCity(true)}
                  />
                ) : (
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="publiko-city" className="text-sm font-medium text-ink">
                      {t("understood.city")}
                    </label>
                    <SelectShell>
                      <select
                        id="publiko-city"
                        className={selectClasses}
                        value={form.citySlug}
                        onChange={(e) => patch({ citySlug: e.target.value })}
                      >
                        <option value="">{t("understood.missingCity")}</option>
                        {cities.map((city) => (
                          <option key={city.slug} value={city.slug}>
                            {localized(city.name, locale)}
                          </option>
                        ))}
                      </select>
                    </SelectShell>
                  </div>
                )}
              </div>

              {/* Data + fleksibilitet */}
              <div className="py-4">
                <label htmlFor="publiko-date" className="flex items-center gap-2 text-sm font-medium text-ink">
                  <CalendarDays className="size-4 text-brand-500" aria-hidden />
                  {t("fields.date")}
                </label>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Input
                    id="publiko-date"
                    type="date"
                    value={form.date}
                    min={todayIso}
                    disabled={form.flexible}
                    onChange={(e) => patch({ date: e.target.value })}
                    className="disabled:opacity-60 sm:max-w-52"
                  />
                  <label
                    className={cn(
                      "inline-flex h-11 cursor-pointer items-center gap-2 rounded-(--radius-field) border px-3.5 text-sm font-medium transition-colors",
                      form.flexible
                        ? "border-brand-400 bg-brand-50 text-brand-700"
                        : "border-line text-muted hover:border-brand-300"
                    )}
                  >
                    <input
                      type="checkbox"
                      className="size-4 accent-brand-600"
                      checked={form.flexible}
                      onChange={(e) => patch({ flexible: e.target.checked })}
                    />
                    {t("fields.dateFlexible")}
                  </label>
                </div>
              </div>

              {/* Urgjenca */}
              <div className="flex items-center justify-between gap-4 py-4">
                <div className="flex min-w-0 items-center gap-3">
                  <RowIcon>
                    <Zap className="size-4.5" aria-hidden />
                  </RowIcon>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">{t("fields.urgent")}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted">
                      {t("fields.urgentHint")}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={form.urgent}
                  onChange={(urgent) => patch({ urgent })}
                  label={t("fields.urgent")}
                />
              </div>

              {/* Buxheti */}
              <div className="py-4">
                <p className="flex items-center gap-2 text-sm font-medium text-ink">
                  <Wallet className="size-4 text-brand-500" aria-hidden />
                  {t("fields.budgetLabel")}
                </p>
                <div className="mt-2 grid grid-cols-2 gap-3 sm:max-w-sm">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="publiko-budget-min" className="text-xs text-muted">
                      {t("fields.budgetMin")}
                    </label>
                    <Input
                      id="publiko-budget-min"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      value={form.budgetMin}
                      onChange={(e) => patch({ budgetMin: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="publiko-budget-max" className="text-xs text-muted">
                      {t("fields.budgetMax")}
                    </label>
                    <Input
                      id="publiko-budget-max"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      value={form.budgetMax}
                      onChange={(e) => patch({ budgetMax: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Dukshmëria */}
              <div className="py-4">
                <p className="flex items-center gap-2 text-sm font-medium text-ink">
                  <Eye className="size-4 text-brand-500" aria-hidden />
                  {t("fields.visibility")}
                </p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {(
                    [
                      { value: "public", title: t("fields.visibilityPublic"), hint: t("fields.visibilityPublicHint") },
                      { value: "private", title: t("fields.visibilityPrivate"), hint: t("fields.visibilityPrivateHint") }
                    ] as const
                  ).map((option) => (
                    <label
                      key={option.value}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-(--radius-field) border p-3.5 transition-colors",
                        form.visibility === option.value
                          ? "border-brand-400 bg-brand-50/60 ring-2 ring-brand-100"
                          : "border-line hover:border-brand-300"
                      )}
                    >
                      <input
                        type="radio"
                        name="publiko-visibility"
                        value={option.value}
                        checked={form.visibility === option.value}
                        onChange={() => patch({ visibility: option.value })}
                        className="mt-0.5 size-4 accent-brand-600"
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-ink">{option.title}</span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-muted">
                          {option.hint}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Fotot — aperçu local uniquement, rien n'est envoyé */}
              <div className="py-4">
                <p className="flex items-center gap-2 text-sm font-medium text-ink">
                  <Camera className="size-4 text-brand-500" aria-hidden />
                  {t("fields.photos")}
                </p>
                <div className="mt-2.5 flex flex-wrap gap-3">
                  {photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="relative size-20 overflow-hidden rounded-(--radius-field) border border-line bg-wash"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- aperçu blob local */}
                      <img src={photo.url} alt={photo.name} className="size-full object-cover" />
                      <button
                        type="button"
                        aria-label={t("fields.removePhoto")}
                        onClick={() => removePhoto(photo.id)}
                        className="absolute right-1 top-1 inline-flex size-6 items-center justify-center rounded-full bg-ink/70 text-white transition-colors hover:bg-ink"
                      >
                        <X className="size-3.5" aria-hidden />
                      </button>
                    </div>
                  ))}
                  {photos.length < MAX_PHOTOS && (
                    <label className="flex size-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-(--radius-field) border border-dashed border-line text-muted transition-colors hover:border-brand-300 hover:bg-brand-50/40 hover:text-brand-600">
                      <ImagePlus className="size-5" aria-hidden />
                      <span className="text-[0.65rem] font-medium">{t("fields.addPhotos")}</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="sr-only"
                        onChange={onPhotosSelected}
                      />
                    </label>
                  )}
                </div>
                <p className="mt-2 text-xs text-muted">{t("fields.photosHint")}</p>
              </div>
            </div>
          </Card>

          {/* Validation douce + actions */}
          <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-end sm:justify-between">
            <Button variant="ghost" onClick={() => setStep("describe")} className="sm:self-center">
              <ArrowLeft className="size-4" aria-hidden />
              {tc("actions.back")}
            </Button>
            <div className="flex flex-col gap-2 sm:items-end">
              {!canPublish && (
                <p className="text-xs font-medium text-warning">
                  {[
                    !form.categorySlug ? t("understood.missingCategory") : null,
                    !form.citySlug ? t("understood.missingCity") : null
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}
              <Button size="lg" onClick={publish} disabled={!canPublish || publishing}>
                {publishing ? (
                  <Loader2 className="size-5 animate-spin" aria-hidden />
                ) : (
                  <Send className="size-5" aria-hidden />
                )}
                {t("submit")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ÉTAPE 3 — Sukses (simulation, rien n'est enregistré) */}
      {step === "success" && (
        <Card className="animate-fade-up mt-8 overflow-hidden">
          <div className="relative overflow-hidden bg-hero-wash px-6 py-12 text-center">
            <div className="bg-grid absolute inset-0 opacity-60" aria-hidden />
            <div className="relative flex flex-col items-center gap-4">
              <span className="relative inline-flex size-20 items-center justify-center">
                <span className="animate-float absolute inset-0 rounded-full bg-success-soft" aria-hidden />
                <span className="absolute inset-2 rounded-full bg-success/15" aria-hidden />
                <CheckCircle2 className="relative size-10 text-success" aria-hidden />
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-3 py-1 text-xs font-semibold text-success">
                <Check className="size-3.5" aria-hidden />
                {t("success.badge")}
              </span>
              <h2 className="font-display text-2xl font-bold sm:text-3xl">{t("success.title")}</h2>
              <p className="max-w-md text-sm leading-relaxed text-muted">{t("success.text")}</p>
            </div>
          </div>

          <div className="px-6 py-8">
            {/* Çfarë ndodh tani */}
            <div className="mx-auto max-w-md rounded-(--radius-card) border border-line bg-paper p-5">
              <p className="text-sm font-semibold text-ink">{t("success.nextTitle")}</p>
              <ul className="mt-3 flex flex-col gap-3">
                {[
                  { icon: <Bell className="size-4" aria-hidden />, text: t("success.next1") },
                  { icon: <MessagesSquare className="size-4" aria-hidden />, text: t("success.next2") },
                  { icon: <BadgeCheck className="size-4" aria-hidden />, text: t("success.next3") }
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                      {item.icon}
                    </span>
                    <span className="text-sm text-muted">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button as={Link} href="/kerkesa/kerkesa-hidraulik-prishtine" size="lg">
                {t("success.viewRequest")}
                <ArrowRight className="size-5" aria-hidden />
              </Button>
              <Button as={Link} href="/" variant="outline" size="lg">
                {t("success.backHome")}
              </Button>
            </div>
            <p className="mt-5 text-center text-xs text-faint">{t("success.demoNote")}</p>
          </div>
        </Card>
      )}
    </div>
  );
}
