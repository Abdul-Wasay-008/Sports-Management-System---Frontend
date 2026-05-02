"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { TeamManagerShell } from "@/components/team-manager/TeamManagerShell";
import { ApiError } from "@/lib/api";
import {
  getTeamManagerNotifications,
  markTeamManagerNotificationRead,
  type TeamManagerNotificationRow,
} from "@/lib/team-manager-api";

export default function TeamManagerNotificationsPage() {
  const [rows, setRows] = useState<TeamManagerNotificationRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await getTeamManagerNotifications();
      setRows(data.notifications);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), 25_000);
    return () => window.clearInterval(id);
  }, [load]);

  async function markRead(n: TeamManagerNotificationRow) {
    if (n.isRead) return;
    try {
      await markTeamManagerNotificationRead(n.id);
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not mark as read.");
    }
  }

  return (
    <TeamManagerShell
      title="Notifications"
      subtitle="Alerts when students book demos for your assignments. This list refreshes periodically."
    >
      {loading ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 text-slate-600 shadow-sm">
          Loading…
        </div>
      ) : null}

      {!loading && !rows.length ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 text-slate-600 shadow-sm">
          No notifications yet.
        </div>
      ) : null}

      <div className="space-y-3">
        {rows.map((n) => (
          <div
            key={n.id}
            className={`rounded-2xl border p-5 shadow-sm ${
              n.isRead ? "border-slate-200/80 bg-white" : "border-brand-amber-200 bg-amber-50/40"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 className="font-heading text-lg text-brand-900">{n.title}</h2>
              <span className="text-xs text-slate-500">{new Date(n.createdAt).toLocaleString()}</span>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{n.message}</p>
            {!n.isRead ? (
              <button
                type="button"
                className="mt-3 text-sm font-semibold text-brand-amber-700 hover:text-brand-amber-800"
                onClick={() => void markRead(n)}
              >
                Mark as read
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </TeamManagerShell>
  );
}
