"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { ApiError } from "@/lib/api";
import {
  createAdminGame,
  deleteAdminGame,
  getAdminLookups,
  listAdminGames,
  updateAdminGame,
} from "@/lib/admin-api";

type GameRow = Awaited<ReturnType<typeof listAdminGames>>["games"][number];

export default function AdminGamesPage() {
  const [games, setGames] = useState<GameRow[]>([]);
  const [lookups, setLookups] = useState<Awaited<ReturnType<typeof getAdminLookups>> | null>(null);
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [gender, setGender] = useState("");
  const [sportId, setSportId] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ mode: "create" | "edit"; game?: GameRow } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GameRow | null>(null);
  const [busy, setBusy] = useState(false);

  const sports = useMemo(() => {
    if (!lookups) return [];
    const map = new Map<string, { id: string; name: string }>();
    for (const c of lookups.categories) {
      const s = c.sport;
      if (s && typeof s === "object" && "_id" in s) {
        const id = String((s as { _id: string })._id);
        const name = (s as { name?: string }).name ?? "Sport";
        map.set(id, { id, name });
      }
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [lookups]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listAdminGames({
        search: search || undefined,
        gender: gender || undefined,
        sportId: sportId || undefined,
      });
      setGames(res.games);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load games.");
    } finally {
      setLoading(false);
    }
  }, [search, gender, sportId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    getAdminLookups()
      .then(setLookups)
      .catch(() => toast.error("Failed to load form options."));
  }, []);

  async function submitGame(form: FormData) {
    const gc = form.get("genderCategory");
    const sm = form.get("slotMode");
    const body = {
      title: String(form.get("title") ?? ""),
      slug: String(form.get("slug") ?? "").trim().toLowerCase(),
      description: String(form.get("description") ?? ""),
      genderCategory: (gc === "male" || gc === "female" || gc === "mixed" ? gc : "mixed") as
        | "male"
        | "female"
        | "mixed",
      venue: String(form.get("venue") ?? ""),
      rulesSummary: String(form.get("rulesSummary") ?? ""),
      slotMode: (sm === "team" ? "team" : "individual") as "individual" | "team",
      perDepartmentPlayers: Number(form.get("perDepartmentPlayers") ?? 0),
      managerId: String(form.get("managerId") ?? ""),
      isActive: form.get("isActive") === "on",
    };

    setBusy(true);
    try {
      if (modal?.mode === "edit" && modal.game) {
        await updateAdminGame(modal.game.id, body);
        toast.success("Game updated.");
      } else {
        await createAdminGame(body);
        toast.success("Game created.");
      }
      setModal(null);
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      await deleteAdminGame(deleteTarget.id);
      toast.success("Game deleted.");
      setDeleteTarget(null);
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Delete failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminShell title="Games" subtitle="Create, update, or remove organized games (respecting registration safeguards).">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end lg:justify-between">
        <div className="flex flex-wrap items-end gap-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Search</label>
            <input
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Title or slug"
            />
          </div>
          <button
            type="button"
            className="rounded-lg bg-brand-900 px-3 py-2 text-sm font-medium text-brand-amber-300"
            onClick={() => setSearch(searchDraft.trim())}
          >
            Apply
          </button>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">All</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Sport</label>
            <select
              value={sportId}
              onChange={(e) => setSportId(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">All sports</option>
              {sports.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          type="button"
          disabled={!lookups}
          className="rounded-xl bg-linear-to-r from-brand-amber-500 to-amber-600 px-4 py-2 text-sm font-semibold text-brand-950 shadow-sm disabled:opacity-50"
          onClick={() => setModal({ mode: "create" })}
        >
          Add game
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        {loading ? (
          <p className="p-6 text-slate-600">Loading…</p>
        ) : games.length === 0 ? (
          <p className="p-6 text-slate-600">No games match filters.</p>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Gender</th>
                <th className="px-4 py-3">Slot policy</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Accepted</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {games.map((g) => (
                <tr key={g.id} className="border-b border-slate-100">
                  <td className="px-4 py-3 font-medium text-brand-900">{g.title}</td>
                  <td className="px-4 py-3 text-slate-600">{g.slug}</td>
                  <td className="px-4 py-3 capitalize text-slate-600">{g.genderCategory}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {g.slotMode && g.perDepartmentPlayers != null
                      ? `${g.slotMode === "team" ? "Team" : "Individual"} • ${g.perDepartmentPlayers}/dept`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{g.totalSlots}</td>
                  <td className="px-4 py-3 text-slate-600">{g.acceptedRegistrations}</td>
                  <td className="px-4 py-3">{g.isActive ? "Yes" : "No"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="text-xs font-medium text-brand-amber-700 hover:underline"
                        onClick={() => setModal({ mode: "edit", game: g })}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="text-xs font-medium text-red-700 hover:underline"
                        onClick={() => setDeleteTarget(g)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && lookups ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="presentation"
          onClick={() => !busy && setModal(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-heading text-xl text-brand-900">
              {modal.mode === "create" ? "New game" : "Edit game"}
            </h2>
            <form
              className="mt-4 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                submitGame(new FormData(e.currentTarget));
              }}
            >
              <label className="block text-xs font-medium text-slate-700">
                Title
                <input
                  name="title"
                  required
                  defaultValue={modal.game?.title}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-xs font-medium text-slate-700">
                Slug (unique)
                <input
                  name="slug"
                  required
                  defaultValue={modal.game?.slug}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-xs font-medium text-slate-700">
                Description
                <textarea
                  name="description"
                  required
                  rows={2}
                  defaultValue={modal.game?.description}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-xs font-medium text-slate-700">
                Category gender
                <select
                  name="genderCategory"
                  required
                  defaultValue={modal.game?.genderCategory}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="mixed">Mixed</option>
                </select>
              </label>
              <label className="block text-xs font-medium text-slate-700">
                Venue
                <input
                  name="venue"
                  required
                  defaultValue={modal.game?.venue}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-xs font-medium text-slate-700">
                Rules summary
                <textarea
                  name="rulesSummary"
                  required
                  rows={4}
                  defaultValue={modal.game?.rulesSummary}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-xs font-medium text-slate-700">
                  Slot mode
                  <select
                    name="slotMode"
                    required
                    defaultValue={modal.game?.slotMode ?? "individual"}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  >
                    <option value="individual">Individual (N players per dept)</option>
                    <option value="team">Team (1 team per dept, roster max)</option>
                  </select>
                </label>
                <label className="block text-xs font-medium text-slate-700">
                  Per-department players
                  <input
                    name="perDepartmentPlayers"
                    type="number"
                    min={1}
                    required
                    defaultValue={modal.game?.perDepartmentPlayers ?? 2}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </label>
              </div>
              <p className="text-xs text-slate-500">
                Total university-wide slots are derived as <span className="font-medium">per-department × 15 departments</span>. Per-event caps for Athletics are managed in the seed JSON.
              </p>
              <label className="block text-xs font-medium text-slate-700">
                Game manager
                <select
                  name="managerId"
                  required
                  defaultValue={modal.game?.managerId}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="">Select…</option>
                  {lookups.managers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                <input type="checkbox" name="isActive" defaultChecked={modal.game?.isActive ?? true} />
                Active listing
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="rounded-lg px-3 py-2 text-sm text-slate-600" onClick={() => setModal(null)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-lg bg-brand-900 px-4 py-2 text-sm font-medium text-brand-amber-300 disabled:opacity-50"
                >
                  {busy ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {deleteTarget ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="presentation"
          onClick={() => !busy && setDeleteTarget(null)}
        >
          <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-heading text-xl text-brand-900">Delete game?</h2>
            <p className="mt-2 text-sm text-slate-600">
              Only allowed when there are no pending/accepted/rejected registrations. Cancelled-only rows are OK.
            </p>
            <p className="mt-2 text-sm font-medium text-brand-900">{deleteTarget.title}</p>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className="rounded-lg px-3 py-2 text-sm text-slate-600" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button
                type="button"
                disabled={busy}
                className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                onClick={() => confirmDelete()}
              >
                {busy ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}
