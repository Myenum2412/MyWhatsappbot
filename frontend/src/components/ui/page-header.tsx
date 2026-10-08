import * as React from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}
        <h1 className="text-xl font-semibold tracking-[-0.02em] text-foreground sm:text-2xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-xl text-[13.5px] leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="surface-card skeleton-shimmer p-5" aria-hidden="true">
      <div className="h-4 w-1/3 rounded-md bg-muted" />
      <div className="mt-2 h-3 w-1/2 rounded-md bg-muted" />
      <div className="mt-5 space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="h-8 rounded-xl bg-muted/70" />
        ))}
      </div>
    </div>
  );
}
