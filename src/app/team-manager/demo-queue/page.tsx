"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { TeamManagerShell } from "@/components/team-manager/TeamManagerShell";
import { ApiError } from "@/lib/api";
import {
  getTeamManagerDemoQueue,
  teamManagerRegistrationDecision,
  type DemoQueueRow,
} from "@/lib/team-manager-api";

export default function TeamManagerDemoQueuePage() {
  const [timezone, setTimezone] = useState("");
  const [queue, setQueue] = useState<DemoQueueRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await getTeamManagerDemoQueue();
      setTimezone(data.scheduleTimezone);
      setQueue(data.queue);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load demo queue.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function decide(registrationId: string, status: "accepted" | "rejected") {
    setBusyId(registrationId);
    try {
      const note = notes[registrationId]?.trim();
      const result = await teamManagerRegistrationDecision(registrationId, {
        status,
        ...(note ? { note } : {}),
      });
      toast.success(result.message);
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not update registration.");
    } finally {
      setBusyId(null);
    }
  }

  function formatSlot(iso: string) {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  }

  return (
    <TeamManagerShell
      title="Demo queue"
      subtitle={
        timezone
          ? `Registrations awaiting your accept or reject after a demo was booked. Times are stored in ${timezone}.`
          : "Students with status demo booked for your assignments."
      }
    >
      {loading ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 text-slate-600 shadow-sm">
          Loading…
        </div>
      ) : null}

      {!loading && !queue.length ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 text-slate-600 shadow-sm">
          No pending demo decisions. When a student books a demo for your department and category, their
          registration appears here.
        </div>
      ) : null}

      <div className="space-y-4">
        {queue.map((row) => (
          <div
            key={row.demoBookingId}
            className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-heading text-xl text-brand-900">{row.game?.title ?? "Game"}</h2>
                <p className="mt-1 text-sm text-slate-600">Venue: {row.game?.venue ?? "TBA"}</p>
                <p className="mt-1 text-sm text-slate-600">Department: {row.assignmentDepartment}</p>
              </div>
            </div>
            <p className="mt-3 text-sm font-medium text-brand-900">
              Demo: {formatSlot(row.startsAt)} — {formatSlot(row.endsAt)}
            </p>
            {row.student ? (
              <div className="mt-3 text-sm text-slate-600">
                <p>
                  <span className="font-medium text-brand-900">{row.student.name}</span> ·{" "}
                  {row.student.email}
                </p>
                <p className="mt-1">
                  Reg: {row.student.registrationNumber || "—"} · Dept:{" "}
                  {row.student.department || "—"}
                </p>
              </div>
            ) : null}
            <label className="mt-4 block">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Optional note to student
              </span>
              <textarea
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm text-slate-900 outline-none ring-brand-amber-500/30 focus:border-brand-amber-500 focus:bg-white focus:ring-4"
                rows={2}
                placeholder="Shown with the registration decision notification."
                value={notes[row.registrationId] ?? ""}
                onChange={(e) =>
                  setNotes((prev) => ({ ...prev, [row.registrationId]: e.target.value }))
                }
              />
            </label>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busyId === row.registrationId}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                onClick={() => void decide(row.registrationId, "accepted")}
              >
                Accept
              </button>
              <button
                type="button"
                disabled={busyId === row.registrationId}
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
                onClick={() => void decide(row.registrationId, "rejected")}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </TeamManagerShell>
  );
}
