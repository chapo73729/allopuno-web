import type { ReactNode } from "react";

export function SectionHeading({
  title,
  action
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex items-baseline justify-between gap-4">
      <h2 className="text-xl font-semibold sm:text-2xl">{title}</h2>
      {action}
    </div>
  );
}
