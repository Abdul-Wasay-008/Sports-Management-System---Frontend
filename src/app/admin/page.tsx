"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { ApiError } from "@/lib/api";
import { getAdminOverview, type AdminOverview } from "@/lib/admin-api";

export default function AdminOverviewPage() {
  const [data, setData] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminOverview()
      .then(setData)
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Failed to load overview."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminShell
      title="Admin overview"
      subtitle="Platform-wide counts for students, games, registrations, and organizational roles."
    >
      {loading ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 text-slate-600 shadow-sm">
          Loading…
        </div>
      ) : null}

      {data ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <SummaryCard label="Students (total)" value={data.students.total} />
          <SummaryCard label="Students (male)" value={data.students.byGender.male} />
          <SummaryCard label="Students (female)" value={data.students.byGender.female} />
          <SummaryCard label="Active student accounts" value={data.students.byStatus.active} />
          <SummaryCard label="Suspended students" value={data.students.byStatus.suspended} />
          <SummaryCard label="Games organized" value={data.games.total} />
          <SummaryCard label="Accepted slots (sum on games)" value={data.games.totalAcceptedRegistrations} />
          <SummaryCard label="Total registrations" value={data.registrations.total} />
          <SummaryCard label="Pending registrations" value={data.registrations.byStatus.pending} />
          <SummaryCard label="Core committee members" value={data.committee.total} />
          <SummaryCard label="Game managers (records)" value={data.gameManagers.total} />
        </div>
      ) : null}
    </AdminShell>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 font-heading text-3xl text-brand-900">{value}</p>
    </div>
  );
}
