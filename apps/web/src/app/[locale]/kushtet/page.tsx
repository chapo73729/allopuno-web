import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { TriangleAlert } from "lucide-react";

interface LegalSection {
  title: string;
  text: string;
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages" });
  return { title: t("terms.title") };
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.terms");

  const sections = t.raw("sections") as LegalSection[];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
        {t("title")}
      </h1>
      {/* « Version pune » : brouillon honnête, pas un texte juridique final */}
      <p className="mt-4 flex items-start gap-2 rounded-(--radius-field) bg-warning-soft px-3.5 py-3 text-sm leading-relaxed text-warning">
        <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
        {t("intro")}
      </p>

      <div className="mt-8 flex flex-col gap-8">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="font-display text-xl font-semibold">{section.title}</h2>
            <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">{section.text}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
