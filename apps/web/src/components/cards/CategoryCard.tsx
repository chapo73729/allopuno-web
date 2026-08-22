import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Category } from "@allopuno/data";
import { Card } from "@/components/ui/Card";
import { CategoryIcon } from "@/components/CategoryIcon";

export function CategoryCard({ category }: { category: Category }) {
  const locale = useLocale();
  const href = category.kind === "rental" ? `/qira?kategoria=${category.slug}` : `/sherbime/${category.slug}`;

  return (
    <Card className="transition-all hover:-translate-y-0.5 hover:shadow-(--shadow-pop)">
      <Link href={href} className="flex flex-col items-start gap-3 p-4">
        <span className="inline-flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <CategoryIcon name={category.icon} className="size-5.5" />
        </span>
        <span className="font-display text-[0.95rem] font-semibold leading-tight">
          {locale === "en" ? category.name.en : category.name.sq}
        </span>
      </Link>
    </Card>
  );
}
