"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import { getDemoSlots, registerForDemo } from "@/lib/student-api";

function shiftCalendarIso(iso: string, deltaDays: number): string {
  const [y, mo, d] = iso.split("-").map((x) => Number.parseInt(x, 10));
  const dt = new Date(Date.UTC(y, mo - 1, d));
  dt.setUTCDate(dt.getUTCDate() + deltaDays);
  return dt.toISOString().slice(0, 10);
}

function dateKeyInTz(iso: string, timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

type Props = {
  gameId: string;
  onClose: () => void;
  onBooked: () => void | Promise<void>;
};

export function DemoScheduleModal({ gameId, onClose, onBooked }: Props) {
  const [weekQuery, setWeekQuery] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState<Awaited<ReturnType<typeof getDemoSlots>> | null>(null);
  const [selectedStartsAt, setSelectedStartsAt] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reflect loading before async fetch
    setLoading(true);
    getDemoSlots(gameId, weekQuery)
      .then((data) => {
        if (!cancelled) setPayload(data);
      })
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Failed to load demo slots."))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [gameId, weekQuery]);

  const grouped = useMemo(() => {
    if (!payload) return [];
    const tz = payload.timezone;
    const map = new Map<string, typeof payload.slots>();
    for (const slot of payload.slots) {
      const key = dateKeyInTz(slot.startsAt, tz);
      const arr = map.get(key) ?? [];
      arr.push(slot);
      map.set(key, arr);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [payload]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/50"
        onClick={() => !submitting && onClose()}
      />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="font-heading text-xl font-semibold text-brand-900">Pick a demo time</h2>
          <p className="mt-1 text-sm text-slate-600">
            Available slots are shown in{" "}
            <span className="font-medium">{payload?.timezone ?? "your schedule timezone"}</span>. Booked
            times are unavailable.
          </p>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-100 px-5 py-3">
          <button
            type="button"
            disabled={loading || !payload}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            onClick={() => {
              if (!payload) return;
              setWeekQuery(shiftCalendarIso(payload.weekStart, -7));
            }}
          >
            Previous week
          </button>
          <span className="text-sm font-medium text-brand-900">
            Week of {payload?.weekStart ?? "…"}
          </span>
          <button
            type="button"
            disabled={loading || !payload}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            onClick={() => {
              if (!payload) return;
              setWeekQuery(shiftCalendarIso(payload.weekStart, 7));
            }}
          >
            Next week
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <p className="text-sm text-slate-600">Loading slots…</p>
          ) : !payload ? (
            <p className="text-sm text-slate-600">No data.</p>
          ) : grouped.length === 0 ? (
            <p className="text-sm text-slate-600">No slots this week.</p>
          ) : (
            <div className="space-y-6">
              {grouped.map(([dayKey, slots]) => (
                <div key={dayKey}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {new Intl.DateTimeFormat(undefined, {
                      timeZone: payload.timezone,
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }).format(new Date(slots[0]!.startsAt))}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {slots.map((slot) => {
                      const free = slot.status === "free";
                      const selected = selectedStartsAt === slot.startsAt;
                      return (
                        <button
                          key={slot.startsAt}
                          type="button"
                          disabled={!free || submitting}
                          onClick={() => free && setSelectedStartsAt(slot.startsAt)}
                          className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                            !free
                              ? "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-400 line-through"
                              : selected
                                ? "border-brand-amber-500 bg-brand-amber-50 text-brand-900"
                                : "border-slate-200 text-slate-800 hover:border-brand-amber-400 hover:bg-amber-50/50"
                          }`}
                        >
                          {new Date(slot.startsAt).toLocaleTimeString(undefined, {
                            timeZone: payload.timezone,
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                          {!free ? " · Taken" : ""}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            disabled={submitting}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            onClick={() => onClose()}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selectedStartsAt || submitting}
            className="rounded-lg bg-linear-to-r from-brand-amber-500 to-amber-600 px-4 py-2 text-sm font-semibold text-brand-950 shadow-sm hover:brightness-110 disabled:opacity-50"
            onClick={async () => {
              if (!selectedStartsAt) return;
              setSubmitting(true);
              try {
                const result = await registerForDemo(gameId, selectedStartsAt);
                toast.success(result.message);
                await onBooked();
                onClose();
              } catch (err) {
                toast.error(err instanceof ApiError ? err.message : "Could not book demo.");
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {submitting ? "Booking…" : "Confirm demo"}
          </button>
        </div>
      </div>
    </div>
  );
}
