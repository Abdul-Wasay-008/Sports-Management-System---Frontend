"use client";

import type { ReactNode } from "react";

/**
 * Card frame for charts. Keeps the existing dashboard "white card with rounded
 * corner + soft border + soft shadow" pattern so chart sections sit alongside
 * the rest of the app without visual mismatch.
 */
export function ChartCard({
  title,
  subtitle,
  action,
  height = 320,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  height?: number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`min-w-0 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm ${className}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-lg text-brand-900">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div
        className="relative mt-4 min-h-0 min-w-0 w-full"
        style={{ height: `${height}px` }}
      >
        {children}
      </div>
    </section>
  );
}

export function ChartEmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-full items-center justify-center">
      <p className="max-w-xs text-center text-sm text-slate-500">{message}</p>
    </div>
  );
}
