import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Eye, HeartHandshake, Target } from "lucide-react";
import { Card } from "@/components/ui/Card";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages" });
  return { title: t("about.title") };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.about");

  const blocks = [
    { icon: Target, title: t("mission.title"), text: t("mission.text") },
    { icon: Eye, title: t("vision.title"), text: t("vision.text") },
    { icon: HeartHandshake, title: t("values.title"), text: t("values.text") }
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
        {t("title")}
      </h1>
      <p className="mt-3 text-base leading-relaxed text-muted sm:text-lg">{t("intro")}</p>

      <div className="mt-10 flex flex-col gap-4">
        {blocks.map(({ icon: Icon, title, text }) => (
          <Card key={title} className="p-6 sm:p-7">
            <span className="inline-flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Icon className="size-5" aria-hidden />
            </span>
            <h2 className="mt-4 font-display text-xl font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted sm:text-[0.95rem]">{text}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
