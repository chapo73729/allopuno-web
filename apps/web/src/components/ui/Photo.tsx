import { cn } from "@/lib/cn";

/**
 * Image "intelligente" et robuste : l'image est posée en fond CSS (background-image)
 * au-dessus d'un dégradé de repli TOUJOURS présent. Si l'URL échoue (réseau, URL
 * expirée), on voit le dégradé — JAMAIS l'icône « image cassée ». Robuste aux URL
 * externes, aucune limite d'optimisation, aucun saut de layout (ratio réservé via
 * la classe utilitaire, ex. aspect-[4/3]).
 */
export function Photo({
  src,
  alt,
  className,
  overlay = false,
  fallback
}: {
  src?: string;
  alt: string;
  className?: string;
  overlay?: boolean;
  priority?: boolean;
  fallback?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gradient-to-br from-brand-50 to-wash",
        className
      )}
    >
      {src ? (
        <div
          {...(alt ? { role: "img", "aria-label": alt } : { "aria-hidden": true })}
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500"
          style={{ backgroundImage: `url("${src}")` }}
        />
      ) : (
        fallback && <div className="absolute inset-0 flex items-center justify-center">{fallback}</div>
      )}
      {overlay && src && <div className="photo-overlay pointer-events-none absolute inset-0" />}
    </div>
  );
}
