import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Category } from "@allopuno/data";
import { CategoryIcon } from "@/components/CategoryIcon";
import { Photo } from "@/components/ui/Photo";
import { categoryPhoto } from "@/lib/media";

/**
 * Tuile catégorie éditoriale : photo (si dispo) ou dégradé + icône, voile
 * ultramarine unifiant, titre en surimpression. Cohérent que la tuile soit
 * photographique ou non.
 */
export function CategoryCard({ category }: { category: Category }) {
  const locale = useLocale();
  const href = category.kind === "rental" ? `/qira?kategoria=${category.slug}` : `/sherbime/${category.slug}`;
  const photo = categoryPhoto(category.slug);
  const name = locale === "en" ? category.name.en : category.name.sq;

  return (
    <Link
      href={href}
      className="group relative block overflow-hidden rounded-(--radius-card) border border-line shadow-(--shadow-card) transition-all duration-300 hover:-translate-y-1 hover:shadow-(--shadow-pop)"
    >
      <Photo
        src={photo}
        alt={name}
        overlay
        className="aspect-[4/5] w-full transition-transform duration-500 group-hover:scale-[1.05]"
        fallback={
          <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-600">
            <CategoryIcon name={category.icon} className="size-7" />
          </span>
        }
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center gap-2 p-3.5">
        {!photo && (
          <span className="inline-flex size-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <CategoryIcon name={category.icon} className="size-4" />
          </span>
        )}
        <span
          className={
            photo
              ? "font-display text-[0.95rem] font-semibold leading-tight text-white drop-shadow"
              : "font-display text-[0.95rem] font-semibold leading-tight text-ink"
          }
        >
          {name}
        </span>
      </div>
    </Link>
  );
}
