"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ApiError } from "@/lib/api";
import { decideRegistration, getRegistrations } from "@/lib/student-api";

type RegistrationsResponse = Awaited<ReturnType<typeof getRegistrations>>;

export default function RegistrationsPage() {
  const [data, setData] = useState<RegistrationsResponse | null>(null);

  async function load() {
    try {
      const response = await getRegistrations();
      setData(response);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load registrations.");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <DashboardShell
      title="My Registrations"
      subtitle="Track approval status and updates from game managers."
    >
      <div className="space-y-4">
        {data?.registrations.map((row) => (
          <div key={row.id} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-heading text-xl text-brand-900">{row.game?.title ?? "Game"}</h2>
                <p className="mt-1 text-sm text-slate-600">Venue: {row.game?.venue ?? "TBA"}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                  row.status === "accepted"
                    ? "bg-emerald-100 text-emerald-700"
                    : row.status === "rejected"
                      ? "bg-rose-100 text-rose-700"
                      : row.status === "demo_booked"
                        ? "bg-sky-100 text-sky-800"
                        : "bg-amber-100 text-amber-700"
                }`}
              >
                {row.status.replace("_", " ")}
              </span>
            </div>

            <p className="mt-2 text-sm text-slate-600">
              Applied on {new Date(row.createdAt).toLocaleString()}
            </p>
            {row.demo ? (
              <p className="mt-1 text-sm font-medium text-brand-900">
                Demo: {new Date(row.demo.startsAt).toLocaleString()}
              </p>
            ) : null}
            {row.decisionNote ? (
              <p className="mt-1 text-sm text-slate-600">Manager note: {row.decisionNote}</p>
            ) : null}

            {row.status === "pending" || row.status === "demo_booked" ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                  onClick={async () => {
                    try {
                      const result = await decideRegistration(row.id, "accepted");
                      toast.success(result.message);
                      await load();
                    } catch (err) {
                      toast.error(err instanceof ApiError ? err.message : "Unable to update status.");
                    }
                  }}
                >
                  Simulate manager accept
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
                  onClick={async () => {
                    try {
                      const result = await decideRegistration(row.id, "rejected");
                      toast.success(result.message);
                      await load();
                    } catch (err) {
                      toast.error(err instanceof ApiError ? err.message : "Unable to update status.");
                    }
                  }}
                >
                  Simulate manager reject
                </button>
              </div>
            ) : null}
          </div>
        ))}

        {!data?.registrations.length ? (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 text-slate-600 shadow-sm">
            You have not submitted any registrations yet.
          </div>
        ) : null}
      </div>
    </DashboardShell>
  );
}
