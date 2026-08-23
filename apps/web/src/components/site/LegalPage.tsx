import { CalendarClock, TriangleAlert } from "lucide-react";
import { PageHero } from "./PageHero";

interface LegalSection {
  title: string;
  text: string;
}

/**
 * Gabarit des pages légales (kushtet, privatesia) : en-tête éditorial, sommaire
 * ancré collant (≥ lg) et sections numérotées. Présentationnel — le parent passe
 * des chaînes déjà traduites. Le sommaire réutilise les titres de sections
 * (aucune chaîne en dur).
 */
export function LegalPage({
  eyebrow,
  title,
  intro,
  tocTitle,
  updated,
  sections
}: {
  eyebrow: string;
  title: string;
  intro: string;
  tocTitle: string;
  updated: string;
  sections: LegalSection[];
}) {
  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-card">
        <div className="bg-hero-wash absolute inset-0" aria-hidden />
        <div className="bg-grid absolute inset-0 opacity-60" aria-hidden />
        <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <PageHero eyebrow={eyebrow} title={title} />
          <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-faint">
            <CalendarClock className="size-3.5" aria-hidden />
            {updated}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[220px_1fr] lg:gap-14">
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <p className="text-xs font-semibold uppercase tracking-wider text-faint">{tocTitle}</p>
              <nav className="mt-3 flex flex-col gap-1.5" aria-label={tocTitle}>
                {sections.map((section, i) => (
                  <a
                    key={section.title}
                    href={`#section-${i}`}
                    className="rounded-lg px-2 py-1.5 text-sm text-muted transition-colors hover:bg-wash hover:text-brand-700"
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          <div className="min-w-0">
            {/* « Version pune » : brouillon honnête, pas un texte juridique final */}
            <p className="flex items-start gap-2 rounded-(--radius-field) bg-warning-soft px-3.5 py-3 text-sm leading-relaxed text-warning">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
              {intro}
            </p>

            <div className="mt-8 flex flex-col gap-8">
              {sections.map((section, i) => (
                <section key={section.title} id={`section-${i}`} className="scroll-mt-24">
                  <h2 className="flex items-baseline gap-2.5 font-display text-xl font-semibold">
                    <span className="font-display text-sm font-bold text-brand-300">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {section.title}
                  </h2>
                  <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">{section.text}</p>
                </section>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
