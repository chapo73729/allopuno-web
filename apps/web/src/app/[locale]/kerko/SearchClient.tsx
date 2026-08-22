"use client";

import { useEffect, useMemo, useState, type ReactNode, type SelectHTMLAttributes } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronDown, Search, SearchX, SlidersHorizontal } from "lucide-react";
import {
  categories,
  cities,
  findCategory,
  findSubcategory,
  rentalCategories,
  serviceCategories,
  type Category
} from "@allopuno/data";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Field } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProCard } from "@/components/cards/ProCard";
import { RequestCard } from "@/components/cards/RequestCard";
import { RentalCard } from "@/components/cards/RentalCard";
import { demoPros, demoRequests, demoRentals, type DemoPro, type DemoRequest, type DemoRental } from "@/lib/demo";
import { localized } from "@/lib/format";
import { cn } from "@/lib/cn";

type Tab = "pros" | "kerkesa" | "qira";
type SortKey = "relevance" | "distance" | "rating" | "responseTime";

type Results =
  | { kind: "pros"; items: DemoPro[] }
  | { kind: "kerkesa"; items: DemoRequest[] }
  | { kind: "qira"; items: DemoRental[] };

const TAB_LABEL_KEYS: Record<Tab, "pros" | "requests" | "rentals"> = {
  pros: "pros",
  kerkesa: "requests",
  qira: "rentals"
};

const SORT_OPTIONS: Record<Tab, SortKey[]> = {
  pros: ["relevance", "distance", "rating", "responseTime"],
  kerkesa: ["relevance", "distance"],
  qira: ["relevance", "distance", "rating"]
};

function parseTab(value: string | null): Tab {
  return value === "kerkesa" || value === "qira" ? value : "pros";
}

function categoriesForTab(tab: Tab): Category[] {
  if (tab === "qira") return rentalCategories;
  if (tab === "kerkesa") return categories;
  return serviceCategories;
}

/** Recherche insensible aux accents (CDC §77) : ë→e, ç→c + diacritiques restants. */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/ë/g, "e")
    .replace(/ç/g, "c")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function categoryTerms(categorySlug: string, subSlugs: readonly string[]): string[] {
  const terms: string[] = [];
  const category = findCategory(categorySlug);
  if (category) terms.push(category.name.sq, category.name.en);
  for (const slug of subSlugs) {
    const found = findSubcategory(slug);
    if (found) terms.push(found.sub.name.sq, found.sub.name.en, ...(found.sub.synonyms ?? []));
  }
  return terms;
}

function matchesTokens(tokens: string[], parts: string[]): boolean {
  if (tokens.length === 0) return true;
  const haystack = normalizeText(parts.join(" "));
  return tokens.every((token) => haystack.includes(token));
}

function isVerifiedPro(pro: DemoPro): boolean {
  return pro.verified.includes("identity") || pro.verified.includes("business");
}

function Select({
  className,
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return (
    <div className="relative">
      <select
        className={cn(
          "h-11 w-full appearance-none rounded-(--radius-field) border border-line bg-card px-3.5 pr-9 text-[0.95rem] text-ink transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100",
          className
        )}
        {...rest}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-faint" aria-hidden />
    </div>
  );
}

export function SearchClient({ locale }: { locale: string }) {
  const t = useTranslations("search");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlTab = parseTab(searchParams.get("tab"));
  const urlQuery = searchParams.get("q") ?? "";

  const [tab, setTab] = useState<Tab>(urlTab);
  const [query, setQuery] = useState(urlQuery);
  const [category, setCategory] = useState("all");
  const [city, setCity] = useState("all");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [availableNow, setAvailableNow] = useState(false);
  const [sort, setSort] = useState<SortKey>("relevance");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Resynchronise l'état avec l'URL : lors d'une navigation client vers le même
  // pathname (ex. lien « Kërko » du header depuis /kerko?tab=qira), App Router
  // préserve l'état du composant — sans cet effet, l'UI resterait sur l'ancien
  // onglet alors que l'URL a changé.
  useEffect(() => {
    setTab(urlTab);
    setQuery(urlQuery);
    setCategory((current) =>
      current !== "all" && !categoriesForTab(urlTab).some((c) => c.slug === current)
        ? "all"
        : current
    );
    setSort((current) => (SORT_OPTIONS[urlTab].includes(current) ? current : "relevance"));
  }, [urlTab, urlQuery]);

  function changeTab(next: Tab) {
    setTab(next);
    if (category !== "all" && !categoriesForTab(next).some((c) => c.slug === category)) {
      setCategory("all");
    }
    if (!SORT_OPTIONS[next].includes(sort)) {
      setSort("relevance");
    }
    router.replace(
      { pathname, query: next === "pros" ? {} : { tab: next } },
      { scroll: false }
    );
  }

  function clearFilters() {
    setCategory("all");
    setCity("all");
    setVerifiedOnly(false);
    setAvailableNow(false);
    setSort("relevance");
  }

  const results = useMemo<Results>(() => {
    const trimmed = normalizeText(query.trim());
    const tokens = trimmed.length > 0 ? trimmed.split(/\s+/) : [];

    if (tab === "kerkesa") {
      const items = demoRequests.filter(
        (request) =>
          (category === "all" || request.categorySlug === category) &&
          (city === "all" || request.citySlug === city) &&
          matchesTokens(tokens, [
            request.title.sq,
            request.title.en,
            ...categoryTerms(request.categorySlug, request.subSlug ? [request.subSlug] : [])
          ])
      );
      if (sort === "distance") items.sort((a, b) => a.distanceKm - b.distanceKm);
      return { kind: "kerkesa", items };
    }

    if (tab === "qira") {
      const items = demoRentals.filter(
        (rental) =>
          (category === "all" || rental.categorySlug === category) &&
          (city === "all" || rental.citySlug === city) &&
          matchesTokens(tokens, [
            rental.title.sq,
            rental.title.en,
            ...categoryTerms(rental.categorySlug, [rental.subSlug])
          ])
      );
      if (sort === "distance") items.sort((a, b) => a.distanceKm - b.distanceKm);
      if (sort === "rating") items.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      return { kind: "qira", items };
    }

    const items = demoPros.filter(
      (pro) =>
        (category === "all" || pro.categorySlug === category) &&
        (city === "all" || pro.citySlug === city) &&
        (!verifiedOnly || isVerifiedPro(pro)) &&
        (!availableNow || pro.availableNow) &&
        matchesTokens(tokens, [
          pro.name,
          pro.headline.sq,
          pro.headline.en,
          ...categoryTerms(pro.categorySlug, pro.subSlugs)
        ])
    );
    if (sort === "distance") items.sort((a, b) => a.distanceKm - b.distanceKm);
    if (sort === "rating") items.sort((a, b) => b.rating - a.rating);
    if (sort === "responseTime") items.sort((a, b) => a.avgResponseMin - b.avgResponseMin);
    return { kind: "pros", items };
  }, [tab, query, category, city, verifiedOnly, availableNow, sort]);

  const count = results.items.length;
  const activeFilterCount =
    (category !== "all" ? 1 : 0) +
    (city !== "all" ? 1 : 0) +
    (tab === "pros" && verifiedOnly ? 1 : 0) +
    (tab === "pros" && availableNow ? 1 : 0);

  const publishHref = query.trim()
    ? `/publiko?q=${encodeURIComponent(query.trim())}`
    : "/publiko";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{t("title")}</h1>

      {/* Barre de recherche */}
      <div className="relative mt-4">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-faint" aria-hidden />
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("placeholder")}
          aria-label={t("title")}
          className="pl-11"
          autoComplete="off"
          enterKeyHint="search"
        />
      </div>

      {/* Onglets Profesionistë / Kërkesa / Qira */}
      <div
        role="tablist"
        aria-label={t("title")}
        className="mt-4 flex gap-1 rounded-(--radius-field) border border-line bg-wash p-1"
      >
        {(Object.keys(TAB_LABEL_KEYS) as Tab[]).map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            aria-controls="search-results"
            onClick={() => changeTab(key)}
            className={cn(
              "min-w-0 flex-1 truncate rounded-[calc(var(--radius-field)-4px)] px-3 py-2 text-sm font-medium transition-colors",
              tab === key
                ? "bg-card text-brand-700 shadow-(--shadow-card)"
                : "text-muted hover:text-ink"
            )}
          >
            {t(`tabs.${TAB_LABEL_KEYS[key]}`)}
          </button>
        ))}
      </div>

      {/* Bouton Filtrat (mobile) */}
      <div className="mt-4 lg:hidden">
        <Button
          variant="outline"
          size="sm"
          aria-expanded={filtersOpen}
          aria-controls="search-filters"
          onClick={() => setFiltersOpen((open) => !open)}
        >
          <SlidersHorizontal className="size-4" aria-hidden />
          {t("filters.title")}
          {activeFilterCount > 0 && (
            <span className="inline-flex size-5 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white tabular-nums">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      <div className="mt-4 lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start lg:gap-8">
        {/* Panneau de filtres */}
        <aside
          id="search-filters"
          className={cn("mb-6 lg:mb-0 lg:block", filtersOpen ? "block" : "hidden")}
        >
          <div className="flex flex-col gap-4 rounded-(--radius-card) border border-line bg-card p-4 shadow-(--shadow-card)">
            <p className="hidden font-display font-semibold lg:block">{t("filters.title")}</p>

            <Field label={t("filters.category")} htmlFor="filter-category">
              <Select
                id="filter-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                <option value="all">{t("filters.allCategories")}</option>
                {categoriesForTab(tab).map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {localized(c.name, locale)}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label={t("filters.city")} htmlFor="filter-city">
              <Select id="filter-city" value={city} onChange={(event) => setCity(event.target.value)}>
                <option value="all">{t("filters.allCities")}</option>
                {cities.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {localized(c.name, locale)}
                  </option>
                ))}
              </Select>
            </Field>

            {tab === "pros" && (
              <div className="flex flex-col gap-2.5">
                <label className="flex items-center gap-2.5 text-sm text-ink">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(event) => setVerifiedOnly(event.target.checked)}
                    className="size-4 shrink-0 accent-brand-600"
                  />
                  {t("filters.verifiedOnly")}
                </label>
                <label className="flex items-center gap-2.5 text-sm text-ink">
                  <input
                    type="checkbox"
                    checked={availableNow}
                    onChange={(event) => setAvailableNow(event.target.checked)}
                    className="size-4 shrink-0 accent-brand-600"
                  />
                  {t("filters.availableNow")}
                </label>
              </div>
            )}

            <Field label={t("sort.label")} htmlFor="filter-sort">
              <Select
                id="filter-sort"
                value={sort}
                onChange={(event) => setSort(event.target.value as SortKey)}
              >
                {SORT_OPTIONS[tab].map((key) => (
                  <option key={key} value={key}>
                    {t(`sort.${key}`)}
                  </option>
                ))}
              </Select>
            </Field>

            <Button variant="ghost" size="sm" onClick={clearFilters} className="self-start">
              {t("filters.clear")}
            </Button>
          </div>
        </aside>

        {/* Résultats */}
        <section id="search-results" role="tabpanel" aria-label={t(`tabs.${TAB_LABEL_KEYS[tab]}`)}>
          <p aria-live="polite" className="text-sm text-muted">
            {t("results.count", { count })}
          </p>

          {count === 0 ? (
            <div className="mt-4">
              <EmptyState
                icon={<SearchX aria-hidden />}
                title={t("results.emptyTitle")}
                text={t("results.emptyText")}
                action={
                  <Button as={Link} href={publishHref}>
                    {t("results.emptyCta")}
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {results.kind === "pros" &&
                results.items.map((pro) => <ProCard key={pro.id} pro={pro} />)}
              {results.kind === "kerkesa" &&
                results.items.map((request) => <RequestCard key={request.id} request={request} />)}
              {results.kind === "qira" &&
                results.items.map((rental) => <RentalCard key={rental.id} rental={rental} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
