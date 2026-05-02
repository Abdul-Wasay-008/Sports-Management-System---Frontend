"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { TeamManagerShell } from "@/components/team-manager/TeamManagerShell";
import { ApiError } from "@/lib/api";
import {
  getTeamManagerDemoQueue,
  teamManagerRegistrationDecision,
  type DemoQueueRow,
  type DemoQueueStatusFilter,
} from "@/lib/team-manager-api";

const TABS: ReadonlyArray<{ id: DemoQueueStatusFilter; label: string }> = [
  { id: "pending", label: "Pending" },
  { id: "accepted", label: "Accepted" },
  { id: "rejected", label: "Rejected" },
  { id: "all", label: "All" },
];

const EMPTY_BY_TAB: Record<DemoQueueStatusFilter, string> = {
  pending:
    "No pending demo decisions. When a student books a demo for your department and category, their registration appears here.",
  accepted: "You haven't accepted any students yet.",
  rejected: "You haven't rejected any students yet.",
  all: "No registrations have been booked for your assignments yet.",
};

function StatusBadge({ status }: { status: DemoQueueRow["registrationStatus"] }) {
  if (status === "accepted") {
    return (
      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
        Accepted
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-800">
        Rejected
      </span>
    );
  }
  return (
    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
      Pending demo
    </span>
  );
}

export default function TeamManagerDemoQueuePage() {
  const [activeTab, setActiveTab] = useState<DemoQueueStatusFilter>("pending");
  const [timezone, setTimezone] = useState("");
  const [queue, setQueue] = useState<DemoQueueRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(
    async (filter: DemoQueueStatusFilter) => {
      setLoading(true);
      try {
        const data = await getTeamManagerDemoQueue(filter);
        setTimezone(data.scheduleTimezone);
        setQueue(data.queue);
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : "Failed to load demo queue.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void load(activeTab);
  }, [activeTab, load]);

  async function decide(registrationId: string, status: "accepted" | "rejected") {
    setBusyId(registrationId);
    try {
      const note = notes[registrationId]?.trim();
      const result = await teamManagerRegistrationDecision(registrationId, {
        status,
        ...(note ? { note } : {}),
      });
      toast.success(result.message);
      await load(activeTab);
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
          ? `Students who booked a demo for one of your assignments. Times are stored in ${timezone}.`
          : "Students with a booked demo for your assignments."
      }
    >
      <div className="mb-5 flex flex-wrap gap-2 rounded-2xl border border-slate-200/80 bg-white p-2 shadow-sm">
        {TABS.map((tab) => {
          const active = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={
                "rounded-xl px-4 py-2 text-sm font-semibold transition " +
                (active
                  ? "bg-brand-900 text-brand-amber-300 shadow-sm"
                  : "text-slate-600 hover:bg-slate-100")
              }
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 text-slate-600 shadow-sm">
          Loading…
        </div>
      ) : null}

      {!loading && !queue.length ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 text-slate-600 shadow-sm">
          {EMPTY_BY_TAB[activeTab]}
        </div>
      ) : null}

      <div className="space-y-4">
        {queue.map((row) => {
          const isPending = row.registrationStatus === "demo_booked";
          return (
            <div
              key={row.demoBookingId}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-heading text-xl text-brand-900">
                      {row.game?.title ?? "Game"}
                    </h2>
                    <StatusBadge status={row.registrationStatus} />
                  </div>
                  <p className="mt-1 text-sm text-slate-600">Venue: {row.game?.venue ?? "TBA"}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Department: {row.assignmentDepartment}
                  </p>
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

              {isPending ? (
                <>
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
                </>
              ) : (
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-sm text-slate-600">
                  <p>
                    <span className="font-semibold text-brand-900">Decided:</span>{" "}
                    {row.decidedAt ? formatSlot(row.decidedAt) : "—"}
                  </p>
                  {row.decisionNote ? (
                    <p className="mt-1">
                      <span className="font-semibold text-brand-900">Note:</span> {row.decisionNote}
                    </p>
                  ) : null}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </TeamManagerShell>
  );
}
