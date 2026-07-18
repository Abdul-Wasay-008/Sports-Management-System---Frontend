"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { ApiError } from "@/lib/api";
import {
  getAdminSportsWeekSettings,
  updateAdminSportsWeekSettings,
  type SportsWeekSettings,
} from "@/lib/admin-api";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SportsWeekSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    isActive: false,
    seasonLabel: "",
    startDate: "",
    endDate: "",
    announcementMessage: "",
    nextSeasonHint: "",
  });

  useEffect(() => {
    getAdminSportsWeekSettings()
      .then((data) => {
        setSettings(data);
        setForm({
          isActive: data.isActive,
          seasonLabel: data.seasonLabel,
          startDate: data.startDate ? data.startDate.slice(0, 10) : "",
          endDate: data.endDate ? data.endDate.slice(0, 10) : "",
          announcementMessage: data.announcementMessage,
          nextSeasonHint: data.nextSeasonHint,
        });
      })
      .catch((err) =>
        toast.error(err instanceof ApiError ? err.message : "Failed to load settings."),
      )
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await updateAdminSportsWeekSettings({
        isActive: form.isActive,
        seasonLabel: form.seasonLabel,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        announcementMessage: form.announcementMessage,
        nextSeasonHint: form.nextSeasonHint,
      });
      setSettings(updated);
      toast.success(
        `Sports Week is now ${updated.isActive ? "ACTIVE — students can register." : "INACTIVE — registrations closed."}`,
      );
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminShell
      title="Sports Week Settings"
      subtitle="Control whether the sports week is open for student registrations."
    >
      {loading ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 text-slate-600 shadow-sm">
          Loading settings…
        </div>
      ) : null}

      {!loading && settings !== null ? (
        <div className="grid gap-6">
          {/* Status banner */}
          <div
            className={`rounded-2xl border p-5 shadow-sm ${
              settings.isActive
                ? "border-emerald-200 bg-emerald-50"
                : "border-rose-200 bg-rose-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`inline-block h-3 w-3 rounded-full ${
                  settings.isActive ? "bg-emerald-500" : "bg-rose-500"
                }`}
              />
              <p className="font-semibold text-slate-800">
                Sports Week is currently{" "}
                <span className={settings.isActive ? "text-emerald-700" : "text-rose-700"}>
                  {settings.isActive ? "ACTIVE" : "INACTIVE"}
                </span>
              </p>
            </div>
            {settings.isActive ? (
              <p className="mt-1 text-sm text-slate-600">
                Students can browse games and register for demo slots.
              </p>
            ) : (
              <p className="mt-1 text-sm text-slate-600">
                Students see the announcement message below and cannot register for any game.
              </p>
            )}
          </div>

          {/* Form */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <h2 className="mb-5 font-heading text-xl text-brand-900">Configuration</h2>

            <div className="grid gap-5">
              {/* Active toggle */}
              <div className="flex items-center gap-4">
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={form.isActive}
                    onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  />
                  <div className="peer h-6 w-11 rounded-full bg-slate-300 transition-all after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-all after:content-[''] peer-checked:bg-emerald-500 peer-checked:after:translate-x-full" />
                </label>
                <span className="text-sm font-medium text-slate-800">
                  {form.isActive ? "Sports Week is OPEN" : "Sports Week is CLOSED"}
                </span>
              </div>

              {/* Season label */}
              <Field
                label="Season Label"
                hint={'Shown to students, e.g. "Sports Week 2025"'}
              >
                <input
                  type="text"
                  className="input-base"
                  placeholder="Sports Week 2025"
                  value={form.seasonLabel}
                  onChange={(e) => setForm((f) => ({ ...f, seasonLabel: e.target.value }))}
                />
              </Field>

              {/* Dates */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Start Date" hint="Optional — for display only">
                  <input
                    type="date"
                    className="input-base"
                    value={form.startDate}
                    onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                  />
                </Field>
                <Field label="End Date" hint="Optional — for display only">
                  <input
                    type="date"
                    className="input-base"
                    value={form.endDate}
                    onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                  />
                </Field>
              </div>

              {/* Announcement message */}
              <Field
                label="Announcement Message"
                hint="Shown to students on the dashboard and games page when sports week is inactive"
              >
                <textarea
                  rows={3}
                  className="input-base resize-none"
                  placeholder="Sports Week registrations are currently closed. Check back soon!"
                  value={form.announcementMessage}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, announcementMessage: e.target.value }))
                  }
                />
              </Field>

              {/* Next season hint */}
              <Field
                label="Next Season Hint"
                hint={'Optional — e.g. "Coming back in November 2026"'}
              >
                <input
                  type="text"
                  className="input-base"
                  placeholder="Coming back in November 2026"
                  value={form.nextSeasonHint}
                  onChange={(e) => setForm((f) => ({ ...f, nextSeasonHint: e.target.value }))}
                />
              </Field>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-xl bg-brand-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save Settings"}
              </button>

              {!form.isActive && (
                <p className="text-xs text-rose-600">
                  Warning: saving with this toggle OFF will immediately close registrations for all students.
                </p>
              )}
            </div>
          </div>

          {/* Info card */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-5 text-sm text-slate-600 shadow-sm">
            <p className="font-semibold text-slate-700">What this controls</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>When <strong>inactive</strong>: students see the announcement message, games list is empty, and all registration endpoints are blocked.</li>
              <li>When <strong>active</strong>: students can browse games and book demo slots normally.</li>
              <li>Results, standings, committee, and rules are always visible regardless of this setting.</li>
              <li>This does not affect admin or team manager access.</li>
            </ul>
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      {hint ? <p className="mb-1.5 text-xs text-slate-500">{hint}</p> : null}
      {children}
    </div>
  );
}
