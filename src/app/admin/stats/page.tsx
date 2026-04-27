"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { ApiError } from "@/lib/api";
import { getAdminStats, type AdminStats } from "@/lib/admin-api";

export default function AdminStatsPage() {
  const [data, setData] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats()
      .then(setData)
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Failed to load statistics."))
      .finally(() => setLoading(false));
  }, []);

  const genderTotal = data ? data.byGender.male + data.byGender.female : 0;

  return (
    <AdminShell
      title="Statistics"
      subtitle="Accepted registrations by gender, game workload, and department participation."
    >
      {loading ? (
        <p className="text-slate-600">Loading…</p>
      ) : !data ? (
        <p className="text-slate-600">No statistics available.</p>
      ) : (
        <div className="space-y-10">
          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <h2 className="font-heading text-xl text-brand-900">Accepted registrations by gender</h2>
            <p className="mt-1 text-sm text-slate-600">Based on accepted registrations with recorded student gender.</p>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <GenderBar label="Male" value={data.byGender.male} total={genderTotal} color="bg-brand-sky-500" />
              <GenderBar label="Female" value={data.byGender.female} total={genderTotal} color="bg-brand-amber-500" />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <h2 className="font-heading text-xl text-brand-900">Per game (pending vs accepted vs rejected)</h2>
            <div className="mt-4 space-y-4">
              {data.byGame.length === 0 ? (
                <p className="text-sm text-slate-600">No registration activity yet.</p>
              ) : (
                data.byGame.map((g) => {
                  const sum = (g.pending + g.accepted + g.rejected) || 1;
                  return (
                    <div key={g.gameId}>
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-brand-900">{g.title}</span>
                        <span className="text-slate-500 capitalize">{g.gender}</span>
                      </div>
                      <div className="mt-1 flex h-3 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="bg-amber-400"
                          style={{ width: `${(g.pending / sum) * 100}%` }}
                          title={`Pending: ${g.pending}`}
                        />
                        <div
                          className="bg-emerald-500"
                          style={{ width: `${(g.accepted / sum) * 100}%` }}
                          title={`Accepted: ${g.accepted}`}
                        />
                        <div
                          className="bg-red-400"
                          style={{ width: `${(g.rejected / sum) * 100}%` }}
                          title={`Rejected: ${g.rejected}`}
                        />
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        Pending {g.pending} · Accepted {g.accepted} · Rejected {g.rejected}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <h2 className="font-heading text-xl text-brand-900">Accepted registrations by department</h2>
            <div className="mt-6 flex flex-wrap items-end gap-4">
              {data.byDepartment.length === 0 ? (
                <p className="text-sm text-slate-600">No department data yet.</p>
              ) : (
                data.byDepartment.map((d) => {
                  const max = Math.max(...data.byDepartment.map((x) => x.accepted), 1);
                  const h = Math.round((d.accepted / max) * 120);
                  return (
                    <div key={d.department} className="flex flex-col items-center gap-1">
                      <div
                        className="w-10 rounded-t-md bg-linear-to-t from-brand-900 to-brand-700"
                        style={{ height: `${Math.max(h, 8)}px` }}
                        title={`${d.department}: ${d.accepted}`}
                      />
                      <span className="max-w-[72px] text-center text-[10px] leading-tight text-slate-600">
                        {d.department}
                      </span>
                      <span className="text-xs font-semibold text-brand-900">{d.accepted}</span>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      )}
    </AdminShell>
  );
}

function GenderBar({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="font-medium text-slate-800">{label}</span>
        <span className="text-slate-600">
          {value} ({pct}%)
        </span>
      </div>
      <div className="mt-2 h-4 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
