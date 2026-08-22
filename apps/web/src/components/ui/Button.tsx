import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "inverse";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-[0_1px_2px_rgb(34_64_221/0.3)]",
  secondary: "bg-brand-50 text-brand-700 hover:bg-brand-100 active:bg-brand-200",
  outline: "border border-line bg-card text-ink hover:border-brand-300 hover:text-brand-700",
  ghost: "text-muted hover:bg-wash hover:text-ink",
  danger: "bg-danger text-white hover:opacity-90",
  // Pour les fonds sombres (bandeaux brand-950) — évite le conflit text-white/className.
  inverse: "bg-white text-brand-800 hover:bg-brand-50 active:bg-brand-100"
};

const sizes: Record<Size, string> = {
  sm: "min-h-9 px-3.5 py-1 text-sm gap-1.5",
  md: "min-h-11 px-5 py-1.5 text-[0.95rem] gap-2",
  lg: "min-h-13 px-7 py-2 text-base gap-2.5"
};

type ButtonProps<T extends ElementType> = {
  as?: T;
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

export function Button<T extends ElementType = "button">({
  as,
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: ButtonProps<T>) {
  const Component = (as ?? "button") as ElementType;
  return (
    <Component
      className={cn(
        "inline-flex items-center justify-center rounded-(--radius-field) font-medium transition-colors duration-150 select-none text-center disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}
