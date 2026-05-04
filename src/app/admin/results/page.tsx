"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { ApiError } from "@/lib/api";
import {
  createAdminResult,
  deleteAdminResult,
  getAdminLookups,
  listAdminGames,
  listAdminResults,
  updateAdminResult,
  type AdminResultRow,
} from "@/lib/admin-api";

type Mode = "create" | "edit";
type GameRow = Awaited<ReturnType<typeof listAdminGames>>["games"][number];
type Lookups = Awaited<ReturnType<typeof getAdminLookups>>;

export default function AdminResultsPage() {
  const [results, setResults] = useState<AdminResultRow[]>([]);
  const [games, setGames] = useState<GameRow[]>([]);
  const [lookups, setLookups] = useState<Lookups | null>(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ mode: Mode; row?: AdminResultRow } | null>(null);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState<{ gameCategoryId: string; gender: string }>({
    gameCategoryId: "",
    gender: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [r, g, l] = await Promise.all([
        listAdminResults({
          gameCategoryId: filter.gameCategoryId || undefined,
          gender: filter.gender || undefined,
          limit: 200,
        }),
        listAdminGames(),
        getAdminLookups(),
      ]);
      setResults(r.results);
      setGames(g.games);
      setLookups(l);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load results.");
    } finally {
      setLoading(false);
    }
  }, [filter.gameCategoryId, filter.gender]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <AdminShell
      title="Results"
      subtitle="Record final outcomes that drive student standings and medal-table charts."
    >
      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm">
        <div className="flex flex-col">
          <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Category
          </label>
          <select
            value={filter.gameCategoryId}
            onChange={(e) => setFilter((prev) => ({ ...prev, gameCategoryId: e.target.value }))}
            className="mt-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700"
          >
            <option value="">All categories</option>
            {(lookups?.categories ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Gender
          </label>
          <select
            value={filter.gender}
            onChange={(e) => setFilter((prev) => ({ ...prev, gender: e.target.value }))}
            className="mt-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700"
          >
            <option value="">All</option>
            <option value="male">Boys</option>
            <option value="female">Girls</option>
            <option value="mixed">Mixed</option>
          </select>
        </div>
        <button
          type="button"
          onClick={() => setModal({ mode: "create" })}
          className="ml-auto rounded-xl bg-brand-900 px-4 py-2 text-sm font-medium text-brand-amber-300 shadow-sm transition hover:bg-brand-800"
        >
          Record a result
        </button>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 text-slate-600 shadow-sm">
          Loading…
        </div>
      ) : results.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 text-slate-600 shadow-sm">
          No results recorded yet. Use “Record a result” to create the first entry.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="p-3">Game</th>
                <th className="p-3">Category</th>
                <th className="p-3">Winner</th>
                <th className="p-3">Runner-up</th>
                <th className="p-3">Played at</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {results.map((row) => (
                <tr key={row._id} className="border-t border-slate-100">
                  <td className="p-3 font-medium text-brand-900">{row.gameTitle}</td>
                  <td className="p-3 capitalize text-slate-600">{row.genderCategory ?? "—"}</td>
                  <td className="p-3 text-emerald-700">{row.winnerDepartment}</td>
                  <td className="p-3 text-slate-700">{row.runnerUpDepartment ?? "—"}</td>
                  <td className="p-3 text-slate-500">
                    {new Date(row.playedAt).toLocaleString()}
                  </td>
                  <td className="p-3 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        type="button"
                        onClick={() => setModal({ mode: "edit", row })}
                        className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-700 hover:bg-slate-100"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!confirm(`Delete result for ${row.gameTitle}?`)) return;
                          try {
                            await deleteAdminResult(row._id);
                            toast.success("Result deleted.");
                            await load();
                          } catch (err) {
                            toast.error(
                              err instanceof ApiError ? err.message : "Failed to delete result.",
                            );
                          }
                        }}
                        className="rounded-lg border border-rose-200 px-2 py-1 text-xs text-rose-700 hover:bg-rose-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal ? (
        <ResultModal
          mode={modal.mode}
          initial={modal.row}
          games={games}
          departments={lookups?.departments ?? []}
          onClose={() => setModal(null)}
          busy={busy}
          onSubmit={async (payload) => {
            setBusy(true);
            try {
              if (modal.mode === "create") {
                await createAdminResult(payload);
                toast.success("Result recorded.");
              } else if (modal.row) {
                await updateAdminResult(modal.row._id, payload);
                toast.success("Result updated.");
              }
              setModal(null);
              await load();
            } catch (err) {
              toast.error(err instanceof ApiError ? err.message : "Failed to save result.");
            } finally {
              setBusy(false);
            }
          }}
        />
      ) : null}
    </AdminShell>
  );
}

function ResultModal({
  mode,
  initial,
  games,
  departments,
  onClose,
  onSubmit,
  busy,
}: {
  mode: Mode;
  initial?: AdminResultRow;
  games: GameRow[];
  departments: string[];
  onClose: () => void;
  onSubmit: (payload: {
    gameId?: string;
    gameTitle?: string;
    gameCategoryId?: string;
    genderCategory?: "male" | "female" | "mixed";
    winnerDepartment: string;
    runnerUpDepartment?: string;
    playedAt?: string;
  }) => Promise<void>;
  busy: boolean;
}) {
  const [gameId, setGameId] = useState(initial?.gameId ?? "");
  const [winner, setWinner] = useState(initial?.winnerDepartment ?? "");
  const [runnerUp, setRunnerUp] = useState(initial?.runnerUpDepartment ?? "");
  const [playedAt, setPlayedAt] = useState(
    initial?.playedAt
      ? new Date(initial.playedAt).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16),
  );

  const eligibleDepartments = useMemo(() => departments.slice().sort(), [departments]);
  const selectedGame = games.find((g) => g.id === gameId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="font-heading text-xl text-brand-900">
          {mode === "create" ? "Record a result" : "Edit result"}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Pick the game, then choose the winning and (optionally) runner-up department.
        </p>
        <form
          className="mt-4 space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!winner) {
              toast.error("Winner is required.");
              return;
            }
            const payload: Parameters<typeof onSubmit>[0] = {
              winnerDepartment: winner,
              runnerUpDepartment: runnerUp || undefined,
              playedAt: playedAt ? new Date(playedAt).toISOString() : undefined,
            };
            if (gameId) {
              payload.gameId = gameId;
            } else if (initial?.gameTitle) {
              payload.gameTitle = initial.gameTitle;
            }
            await onSubmit(payload);
          }}
        >
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Game
            </label>
            <select
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
            >
              <option value="">{initial?.gameTitle ?? "Select a game"}</option>
              {games.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title} ({g.genderCategory})
                </option>
              ))}
            </select>
            {selectedGame ? (
              <p className="mt-1 text-xs text-slate-500">
                Category gender: {selectedGame.genderCategory}
              </p>
            ) : null}
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Winner department
            </label>
            <select
              value={winner}
              onChange={(e) => setWinner(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
            >
              <option value="">Select winner</option>
              {eligibleDepartments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Runner-up (optional)
            </label>
            <select
              value={runnerUp}
              onChange={(e) => setRunnerUp(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
            >
              <option value="">No runner-up</option>
              {eligibleDepartments
                .filter((d) => d !== winner)
                .map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Played at
            </label>
            <input
              type="datetime-local"
              value={playedAt}
              onChange={(e) => setPlayedAt(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="rounded-xl bg-brand-900 px-4 py-2 text-sm font-medium text-brand-amber-300 shadow-sm transition hover:bg-brand-800 disabled:opacity-60"
            >
              {busy ? "Saving…" : mode === "create" ? "Record result" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
