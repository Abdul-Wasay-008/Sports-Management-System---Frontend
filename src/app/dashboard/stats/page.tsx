"use client";

import dynamic from "next/dynamic";

/**
 * Chart.js touches the DOM canvas APIs heavily; loading this chunk only on the
 * client avoids SSR/hydration edge cases that manifest as blank chart regions.
 */
const StatsPageClient = dynamic(() => import("./StatsPageClient"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 text-slate-600 shadow-sm">
      Loading charts…
    </div>
  ),
});

export default function StatsPage() {
  return <StatsPageClient />;
}
