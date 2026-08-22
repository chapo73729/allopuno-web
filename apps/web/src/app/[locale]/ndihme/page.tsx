import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ChevronDown, MessageCircleQuestion } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";

interface FaqEntry {
  q: string;
  a: string;
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages" });
  return { title: t("help.title") };
}

export default async function HelpPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.help");

  const faq = t.raw("faq") as FaqEntry[];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
        {t("title")}
      </h1>
      <p className="mt-3 text-base leading-relaxed text-muted sm:text-lg">{t("intro")}</p>

      <div className="mt-8 flex flex-col gap-3">
        {faq.map((item) => (
          <details
            key={item.q}
            className="group rounded-(--radius-card) border border-line bg-card shadow-(--shadow-card)"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 font-display font-semibold [&::-webkit-details-marker]:hidden">
              {item.q}
              <ChevronDown
                className="size-4 shrink-0 text-faint transition-transform group-open:rotate-180"
                aria-hidden
              />
            </summary>
            <p className="px-5 pb-5 text-sm leading-relaxed text-muted">{item.a}</p>
          </details>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <Button as={Link} href="/kontakt" variant="secondary">
          <MessageCircleQuestion className="size-4" aria-hidden />
          {t("contactCta")}
        </Button>
      </div>
    </div>
  );
}
