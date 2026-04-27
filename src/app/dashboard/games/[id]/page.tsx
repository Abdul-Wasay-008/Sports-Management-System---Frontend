"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ApiError } from "@/lib/api";
import { getGameDetails, registerForGame } from "@/lib/student-api";

type GameDetailsResponse = Awaited<ReturnType<typeof getGameDetails>>;

export default function GameDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<GameDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const gameId = params.id;

  useEffect(() => {
    if (!gameId) return;
    getGameDetails(gameId)
      .then(setData)
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Failed to load game details."))
      .finally(() => setLoading(false));
  }, [gameId]);

  const game = data?.game;

  return (
    <DashboardShell title={game?.title ?? "Game Details"} subtitle="Review rules, manager info, and slots.">
      {loading ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 text-slate-600 shadow-sm">
          Loading game details...
        </div>
      ) : null}

      {game ? (
        <div className="grid gap-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <p className="text-slate-700">{game.description}</p>
            <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
              <p>Venue: {game.venue}</p>
              <p>Category: {game.genderCategory}</p>
              <p>Total Slots: {game.totalSlots}</p>
              <p>Available Slots: {game.availableSlots}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <h2 className="font-heading text-xl text-brand-900">Manager Contact</h2>
            {game.manager ? (
              <div className="mt-3 space-y-1 text-sm text-slate-600">
                <p>Name: {game.manager.name}</p>
                <p>Email: {game.manager.email}</p>
                <p>Phone: {game.manager.phone}</p>
                <p>Office: {game.manager.officeAddress}</p>
                <p>Office Hours: {game.manager.officeHours}</p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-600">Manager details will be published soon.</p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <h2 className="font-heading text-xl text-brand-900">Game Rules</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
              {toRuleBullets(game.rulesSummary).map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <h2 className="font-heading text-xl text-brand-900">Registration</h2>
            {game.registrationStatus ? (
              <p className="mt-3 text-sm text-slate-700">
                Your current status:{" "}
                <span className="font-semibold capitalize">{game.registrationStatus}</span>
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={!game.registrationOpen || Boolean(game.registrationStatus) || submitting}
                className="rounded-lg bg-linear-to-r from-brand-amber-500 to-amber-600 px-4 py-2 text-sm font-semibold text-brand-950 shadow-sm hover:brightness-110 disabled:opacity-50"
                onClick={async () => {
                  setSubmitting(true);
                  try {
                    const result = await registerForGame(game.id);
                    toast.success(result.message);
                    router.refresh();
                    const latest = await getGameDetails(game.id);
                    setData(latest);
                  } catch (err) {
                    toast.error(err instanceof ApiError ? err.message : "Registration failed.");
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                {submitting ? "Submitting..." : "Register for this game"}
              </button>
              <button
                type="button"
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                onClick={() => router.push("/dashboard/games")}
              >
                Back to games
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </DashboardShell>
  );
}

function toRuleBullets(rulesSummary: string) {
  const normalized = rulesSummary.replace(/\s+/g, " ").trim();
  if (!normalized) return ["Rules will be announced soon."];

  const eventsMatch = normalized.match(/^events per department:\s*(.+)$/i);
  if (eventsMatch) {
    return eventsMatch[1]
      .split(/\s*,\s*/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (/\d+\.\s/.test(normalized)) {
    return normalized
      .split(/\s*(?=\d+\.\s)/)
      .map((item) => item.replace(/^\d+\.\s*/, "").trim())
      .filter(Boolean);
  }

  const parts = normalized
    .split(/\s*;\s*/)
    .map((item) => item.trim())
    .filter(Boolean);

  return parts.length ? parts : [normalized];
}
