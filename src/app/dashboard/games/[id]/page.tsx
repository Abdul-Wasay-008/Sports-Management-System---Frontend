"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DemoScheduleModal } from "@/components/dashboard/DemoScheduleModal";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ApiError } from "@/lib/api";
import { getGameDetails, type GameDetailsPayload } from "@/lib/student-api";

function registrationHint(game: GameDetailsPayload): string | null {
  if (game.canRegisterForDemo) return null;
  switch (game.blockReason) {
    case "slots_full":
      return "Registration is closed — all team slots are filled.";
    case "no_team_manager":
      return "Demo scheduling is not set up for your department for this game yet. Contact the sports office.";
    case "already_registered":
      return "You already have an active registration or demo for this game.";
    case "cooldown":
      return game.cooldownEndsAt
        ? `You can apply again after ${new Date(game.cooldownEndsAt).toLocaleString()} (10-day cooldown after rejection).`
        : "You are in the cooldown period after a rejection.";
    default:
      return null;
  }
}

export default function GameDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [game, setGame] = useState<GameDetailsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  const gameId = params.id;

  async function reloadDetails() {
    if (!gameId) return;
    const data = await getGameDetails(gameId);
    setGame(data.game);
  }

  useEffect(() => {
    if (!gameId) return;
    getGameDetails(gameId)
      .then((data) => setGame(data.game))
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Failed to load game details."))
      .finally(() => setLoading(false));
  }, [gameId]);

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
            <h2 className="font-heading text-xl text-brand-900">Game manager (rules &amp; venue)</h2>
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

          {game.schedulingConfigured && game.teamManagerContact ? (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <h2 className="font-heading text-xl text-brand-900">Your departmental team manager (demo)</h2>
              <div className="mt-3 space-y-1 text-sm text-slate-600">
                <p>Name: {game.teamManagerContact.name}</p>
                {game.teamManagerContact.contact ? (
                  <p>Contact: {game.teamManagerContact.contact}</p>
                ) : (
                  <p className="text-slate-500">Contact details will be shared by your department.</p>
                )}
              </div>
            </div>
          ) : null}

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
              <div className="mt-3 space-y-2 text-sm text-slate-700">
                <p>
                  Your current status:{" "}
                  <span className="font-semibold capitalize">{game.registrationStatus.replace("_", " ")}</span>
                </p>
                {game.demo ? (
                  <p className="text-slate-600">
                    Scheduled demo:{" "}
                    <span className="font-medium text-brand-900">
                      {new Date(game.demo.startsAt).toLocaleString(undefined, {
                        timeZone: game.scheduleTimezone,
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>{" "}
                    ({game.scheduleTimezone})
                  </p>
                ) : null}
              </div>
            ) : null}

            <p className="mt-4 text-sm font-medium leading-relaxed text-red-600">
              <span className="font-semibold">Demo required.</span> After you register, you will attend a demo with
              your departmental team manager. If you are not selected, you{" "}
              <span className="font-semibold">cannot apply again for this game for 10 days</span> from the date you
              are rejected.
            </p>

            {registrationHint(game) ? (
              <p className="mt-3 text-sm text-amber-800">{registrationHint(game)}</p>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={!game.canRegisterForDemo || !game.schedulingConfigured}
                className="rounded-lg bg-linear-to-r from-brand-amber-500 to-amber-600 px-4 py-2 text-sm font-semibold text-brand-950 shadow-sm hover:brightness-110 disabled:opacity-50"
                onClick={() => setDemoModalOpen(true)}
              >
                Register for this demo
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

      {demoModalOpen && gameId ? (
        <DemoScheduleModal
          gameId={gameId}
          onClose={() => setDemoModalOpen(false)}
          onBooked={async () => {
            await reloadDetails();
            router.refresh();
          }}
        />
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
