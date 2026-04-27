"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { ApiError } from "@/lib/api";
import { getAdminGameRegistrations, listAdminGames } from "@/lib/admin-api";

export default function AdminRegistrationsPage() {
  const [games, setGames] = useState<Array<{ id: string; title: string; slug: string }>>([]);
  const [gameId, setGameId] = useState("");
  const [status, setStatus] = useState("");
  const [loadingGames, setLoadingGames] = useState(true);
  const [loadingRegs, setLoadingRegs] = useState(false);
  const [payload, setPayload] = useState<Awaited<ReturnType<typeof getAdminGameRegistrations>> | null>(null);

  useEffect(() => {
    listAdminGames()
      .then((res) =>
        setGames(
          res.games.map((g) => ({
            id: g.id,
            title: g.title,
            slug: g.slug,
          })),
        ),
      )
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Failed to load games."))
      .finally(() => setLoadingGames(false));
  }, []);

  useEffect(() => {
    if (!gameId) {
      setPayload(null);
      return;
    }
    setLoadingRegs(true);
    getAdminGameRegistrations(gameId, status || undefined)
      .then(setPayload)
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Failed to load registrations."))
      .finally(() => setLoadingRegs(false));
  }, [gameId, status]);

  return (
    <AdminShell
      title="Registrations"
      subtitle="Inspect student registration requests per game with optional status filter."
    >
      <div className="mb-6 flex flex-wrap items-end gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Game</label>
          <select
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            className="min-w-[240px] rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">{loadingGames ? "Loading games…" : "Select a game"}</option>
            {games.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {!gameId ? (
        <p className="text-slate-600">Choose a game to load registrations.</p>
      ) : loadingRegs ? (
        <p className="text-slate-600">Loading registrations…</p>
      ) : !payload ? (
        <p className="text-slate-600">No data.</p>
      ) : payload.registrations.length === 0 ? (
        <p className="text-slate-600">No registrations for this filter.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Reg #</th>
                <th className="px-4 py-3">Dept</th>
                <th className="px-4 py-3">Gender</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Decided</th>
              </tr>
            </thead>
            <tbody>
              {payload.registrations.map((r) => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="px-4 py-3">
                    {r.student ? (
                      <>
                        <div className="font-medium text-brand-900">{r.student.name}</div>
                        <div className="text-xs text-slate-500">{r.student.email}</div>
                      </>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{r.student?.registrationNumber ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{r.student?.department ?? "—"}</td>
                  <td className="px-4 py-3 capitalize text-slate-600">{r.student?.gender ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium capitalize text-slate-800">
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {r.decidedAt ? new Date(r.decidedAt).toLocaleString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}
