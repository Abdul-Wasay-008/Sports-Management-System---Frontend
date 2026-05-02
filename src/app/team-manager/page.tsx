"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { TeamManagerShell } from "@/components/team-manager/TeamManagerShell";
import { ApiError } from "@/lib/api";
import { getTeamManagerDashboard, type TeamManagerDashboard } from "@/lib/team-manager-api";

export default function TeamManagerOverviewPage() {
  const [data, setData] = useState<TeamManagerDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTeamManagerDashboard()
      .then(setData)
      .catch((err) =>
        toast.error(err instanceof ApiError ? err.message : "Failed to load team manager dashboard."),
      )
      .finally(() => setLoading(false));
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const a of data?.assignments ?? []) {
      const list = map.get(a.department) ?? [];
      list.push(a.categoryName);
      map.set(a.department, list);
    }
    return Array.from(map.entries())
      .map(([department, categories]) => ({
        department,
        categories: categories.slice().sort((a, b) => a.localeCompare(b)),
      }))
      .sort((a, b) => a.department.localeCompare(b.department));
  }, [data]);

  return (
    <TeamManagerShell
      title="Overview"
      subtitle={
        data
          ? `Signed in as ${data.manager.name}. Demo slots use timezone ${data.scheduleTimezone}.`
          : "Pending demos and notifications for your department assignments."
      }
    >
      {loading ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 text-slate-600 shadow-sm">
          Loading…
        </div>
      ) : null}

      {data ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Pending demo decisions
              </p>
              <p className="mt-2 font-heading text-3xl text-brand-900">
                {data.summary.pendingDemoApprovals}
              </p>
              <Link
                href="/team-manager/demo-queue"
                className="mt-3 inline-block text-sm font-semibold text-brand-amber-600 hover:text-brand-amber-700"
              >
                Open demo queue →
              </Link>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Unread notifications
              </p>
              <p className="mt-2 font-heading text-3xl text-brand-900">
                {data.summary.unreadNotifications}
              </p>
              <Link
                href="/team-manager/notifications"
                className="mt-3 inline-block text-sm font-semibold text-brand-amber-600 hover:text-brand-amber-700"
              >
                View notifications →
              </Link>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Assigned cells
              </p>
              <p className="mt-2 font-heading text-3xl text-brand-900">
                {data.summary.totalAssignments}
              </p>
              <p className="mt-3 text-sm text-slate-500">
                {grouped.length === 1
                  ? `${grouped.length} department`
                  : `${grouped.length} departments`}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <h2 className="font-heading text-xl text-brand-900">My assignments</h2>
            <p className="mt-1 text-sm text-slate-600">
              You will see student demo bookings only for the (department × game) cells listed below.
            </p>

            {grouped.length === 0 ? (
              <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-sm text-amber-900">
                No assignments are linked to your account yet. Please contact the sports office if
                you believe this is an error.
              </p>
            ) : (
              <div className="mt-4 space-y-4">
                {grouped.map((dept) => (
                  <div key={dept.department}>
                    <p className="text-sm font-semibold text-brand-900">{dept.department}</p>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {dept.categories.map((category) => (
                        <li
                          key={`${dept.department}-${category}`}
                          className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
                        >
                          {category}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </TeamManagerShell>
  );
}
