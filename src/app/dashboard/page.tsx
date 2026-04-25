"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ApiError } from "@/lib/api";
import { getDashboardData } from "@/lib/student-api";

type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardData()
      .then(setData)
      .catch((err) => {
        toast.error(err instanceof ApiError ? err.message : "Failed to load dashboard.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardShell
      title="Student Dashboard"
      subtitle="Track your registrations, game opportunities, and updates in one place."
    >
      {loading ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 text-slate-600 shadow-sm">
          Loading dashboard...
        </div>
      ) : null}

      {data ? (
        <>
          <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <SummaryCard label="Active games" value={data.summary.activeGames} />
            <SummaryCard label="My registrations" value={data.summary.myRegistrations} />
            <SummaryCard label="Pending approvals" value={data.summary.pendingApprovals} />
            <SummaryCard label="Accepted" value={data.summary.acceptedRegistrations} />
            <SummaryCard label="Unread alerts" value={data.summary.unreadNotifications} />
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <h2 className="font-heading text-xl text-brand-900">Welcome, {data.student.name}</h2>
            <p className="mt-2 text-slate-600">
              Department: <span className="font-medium text-slate-800">{data.student.department}</span>
            </p>
            <p className="mt-1 text-slate-600">
              Eligible category:{" "}
              <span className="font-medium capitalize text-slate-800">{data.student.gender}</span>
            </p>
            <p className="mt-1 text-slate-600">
              Email: <span className="font-medium text-slate-800">{data.student.email}</span>
            </p>
          </div>
        </>
      ) : null}
    </DashboardShell>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 font-heading text-3xl text-brand-900">{value}</p>
    </div>
  );
}
