import {
  Camera,
  Car,
  CarFront,
  GraduationCap,
  Hammer,
  Home,
  Laptop,
  PartyPopper,
  Sparkles,
  Truck,
  Wrench,
  type LucideIcon
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  Hammer,
  Home,
  Car,
  CarFront,
  Truck,
  Laptop,
  GraduationCap,
  PartyPopper,
  Wrench,
  Camera,
  Sparkles
};

export function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = icons[name] ?? Hammer;
  return <Icon className={className} aria-hidden />;
}
