"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ApiError } from "@/lib/api";
import { getDashboardData, getStats } from "@/lib/student-api";

type StatsResponse = Awaited<ReturnType<typeof getStats>>;

export default function StatsPage() {
  const [data, setData] = useState<StatsResponse | null>(null);

  useEffect(() => {
    getDashboardData()
      .then((dashboard) =>
        getStats({ department: dashboard.student.department, gender: dashboard.student.gender }),
      )
      .then(setData)
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Failed to load stats."));
  }, []);

  return (
    <DashboardShell title="Statistics" subtitle="Department and game participation trends.">
      <div className="grid gap-4 lg:grid-cols-2">
        <StatsCard title="Participation by Department" items={data?.byDepartment ?? []} />
        <StatsCard title="Participation by Game" items={data?.byGame ?? []} />
      </div>
    </DashboardShell>
  );
}

function StatsCard({ title, items }: { title: string; items: Array<{ label: string; value: number }> }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <h2 className="font-heading text-xl text-brand-900">{title}</h2>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item.label}>
            <div className="mb-1 flex items-center justify-between text-sm text-slate-700">
              <span>{item.label}</span>
              <span className="font-semibold">{item.value}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-200">
              <div
                className="h-2 rounded-full bg-linear-to-r from-brand-amber-500 to-amber-600"
                style={{ width: `${Math.min(100, item.value * 10)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
