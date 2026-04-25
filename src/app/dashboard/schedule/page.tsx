"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ApiError } from "@/lib/api";
import { getSchedule } from "@/lib/student-api";

type ScheduleResponse = Awaited<ReturnType<typeof getSchedule>>;

export default function SchedulePage() {
  const [data, setData] = useState<ScheduleResponse | null>(null);

  useEffect(() => {
    getSchedule()
      .then(setData)
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Failed to load schedule."));
  }, []);

  return (
    <DashboardShell
      title="Schedule"
      subtitle="Upcoming activities. Timings may change based on committee updates."
    >
      <div className="space-y-4">
        {data?.schedule.map((item) => (
          <div key={`${item.title}-${item.datetime}`} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <h2 className="font-heading text-xl text-brand-900">{item.title}</h2>
            <p className="mt-1 text-sm text-slate-600">
              {new Date(item.datetime).toLocaleString()} - {item.venue}
            </p>
            <p className="mt-2 text-sm text-slate-500">{item.note}</p>
          </div>
        ))}
        {!data?.schedule.length ? (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 text-slate-600 shadow-sm">
            No schedule items published yet.
          </div>
        ) : null}
      </div>
    </DashboardShell>
  );
}
