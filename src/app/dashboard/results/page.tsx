"use client";

import dynamic from "next/dynamic";

const ResultsPageClient = dynamic(() => import("./ResultsPageClient"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 text-slate-600 shadow-sm">
      Loading charts…
    </div>
  ),
});

export default function ResultsPage() {
  return <ResultsPageClient />;
}
