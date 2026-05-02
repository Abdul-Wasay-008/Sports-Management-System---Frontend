"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
          <div className="grid gap-4 sm:grid-cols-2">
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
          </div>
        </div>
      ) : null}
    </TeamManagerShell>
  );
}
