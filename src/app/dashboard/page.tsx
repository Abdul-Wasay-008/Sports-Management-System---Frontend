"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ApiError, getPublicSportsWeekStatus, type SportsWeekStatus } from "@/lib/api";
import { getDashboardData } from "@/lib/student-api";

type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sportsWeek, setSportsWeek] = useState<SportsWeekStatus | null>(null);

  useEffect(() => {
    Promise.all([
      getDashboardData(),
      getPublicSportsWeekStatus().catch(() => null),
    ])
      .then(([dashboard, sw]) => {
        setData(dashboard);
        setSportsWeek(sw);
      })
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

      {/* Sports Week inactive banner */}
      {!loading && sportsWeek && !sportsWeek.isActive ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-2xl" aria-hidden>
              🏟️
            </span>
            <div>
              <p className="font-semibold text-amber-900">
                {sportsWeek.seasonLabel
                  ? `${sportsWeek.seasonLabel} — Registrations Closed`
                  : "Sports Week Registrations Are Closed"}
              </p>
              <p className="mt-1 text-sm text-amber-800">
                {sportsWeek.announcementMessage ||
                  "Sports Week registrations are currently closed. Check back soon!"}
              </p>
              {sportsWeek.nextSeasonHint ? (
                <p className="mt-1 text-sm font-medium text-amber-700">
                  {sportsWeek.nextSeasonHint}
                </p>
              ) : null}
              <div className="mt-3 flex gap-3">
                <Link
                  href="/dashboard/results"
                  className="rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-900 transition hover:bg-amber-200"
                >
                  View Past Results
                </Link>
                <Link
                  href="/dashboard/stats"
                  className="rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-900 transition hover:bg-amber-200"
                >
                  View Statistics
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {data ? (
        <>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="font-heading text-2xl text-brand-900">Welcome, {data.student.name}</h2>
              <p className="mt-2 text-slate-600">
                Department:{" "}
                <span className="font-medium text-slate-800">{data.student.department}</span>
              </p>
              <p className="mt-1 text-slate-600">
                Eligible category:{" "}
                <span className="font-medium capitalize text-slate-800">{data.student.gender}</span>
              </p>
              <p className="mt-1 text-slate-600">
                Email: <span className="font-medium text-slate-800">{data.student.email}</span>
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <SummaryCard label="Active games" value={data.summary.activeGames} />
              <SummaryCard label="My registrations" value={data.summary.myRegistrations} />
              <SummaryCard label="Pending approvals" value={data.summary.pendingApprovals} />
              <SummaryCard label="Accepted" value={data.summary.acceptedRegistrations} />
              <SummaryCard label="Unread alerts" value={data.summary.unreadNotifications} />
            </div>
          </div>
        </>
      ) : null}
    </DashboardShell>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 font-heading text-3xl text-brand-900">{value}</p>
    </div>
  );
}
