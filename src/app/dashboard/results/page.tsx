"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ApiError } from "@/lib/api";
import { getResults } from "@/lib/student-api";

type ResultsResponse = Awaited<ReturnType<typeof getResults>>;

export default function ResultsPage() {
  const [data, setData] = useState<ResultsResponse | null>(null);

  useEffect(() => {
    getResults()
      .then(setData)
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Failed to load results."));
  }, []);

  return (
    <DashboardShell title="Results" subtitle="Recent outcomes and department standings highlights.">
      <div className="space-y-4">
        {data?.results.map((result) => (
          <div
            key={result._id}
            className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
          >
            <h2 className="font-heading text-xl text-brand-900">{result.gameTitle}</h2>
            <p className="mt-2 text-sm text-slate-600">Winner: {result.winnerDepartment}</p>
            {result.runnerUpDepartment ? (
              <p className="mt-1 text-sm text-slate-600">Runner-up: {result.runnerUpDepartment}</p>
            ) : null}
            <p className="mt-1 text-sm text-slate-500">
              Played on {new Date(result.playedAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
