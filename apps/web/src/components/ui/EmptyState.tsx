import type { ReactNode } from "react";
import { Card } from "./Card";

export function EmptyState({
  icon,
  title,
  text,
  action
}: {
  icon?: ReactNode;
  title: string;
  text?: string;
  action?: ReactNode;
}) {
  return (
    <Card className="flex flex-col items-center gap-3 px-6 py-10 text-center">
      {icon && <div className="text-faint [&>svg]:size-8">{icon}</div>}
      <p className="font-display text-lg font-semibold">{title}</p>
      {text && <p className="max-w-sm text-sm text-muted">{text}</p>}
      {action && <div className="mt-2">{action}</div>}
    </Card>
  );
}
