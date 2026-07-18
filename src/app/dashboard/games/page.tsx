"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ApiError } from "@/lib/api";
import { getDashboardData, getGames } from "@/lib/student-api";

type GamesResponse = Awaited<ReturnType<typeof getGames>>;

export default function GamesPage() {
  const [data, setData] = useState<GamesResponse | null>(null);
  const [loadedOnce, setLoadedOnce] = useState(false);

  useEffect(() => {
    getDashboardData()
      .then((dashboard) =>
        getGames({ department: dashboard.student.department, gender: dashboard.student.gender }),
      )
      .then((res) => {
        setData(res);
        setLoadedOnce(true);
      })
      .catch((err) => {
        toast.error(err instanceof ApiError ? err.message : "Failed to load games.");
        setLoadedOnce(true);
      });
  }, []);

  const inactive = loadedOnce && (data?.sportsWeekInactive === true || data?.games.length === 0 && data?.sportsWeekInactive);

  return (
    <DashboardShell
      title="Eligible Games"
      subtitle="Browse games you can join and review slot availability before registering."
    >
      {/* Sports week inactive state */}
      {loadedOnce && data?.sportsWeekInactive ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center shadow-sm">
          <p className="text-4xl" aria-hidden>🏟️</p>
          <h2 className="mt-3 font-heading text-2xl text-amber-900">Sports Week is Currently Closed</h2>
          <p className="mt-2 text-sm text-amber-800">
            Game registrations are not available at this time. You can still browse past results and
            standings below.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link
              href="/dashboard/results"
              className="rounded-xl bg-amber-100 px-5 py-2.5 text-sm font-semibold text-amber-900 shadow-sm transition hover:bg-amber-200"
            >
              Past Results &amp; Standings
            </Link>
            <Link
              href="/dashboard/stats"
              className="rounded-xl bg-amber-100 px-5 py-2.5 text-sm font-semibold text-amber-900 shadow-sm transition hover:bg-amber-200"
            >
              Statistics
            </Link>
            <Link
              href="/dashboard/committee"
              className="rounded-xl bg-amber-100 px-5 py-2.5 text-sm font-semibold text-amber-900 shadow-sm transition hover:bg-amber-200"
            >
              Committee
            </Link>
          </div>
        </div>
      ) : null}

      {/* Active: game list */}
      {!data?.sportsWeekInactive ? (
        <div className="grid gap-4">
          {data?.games.map((game) => (
            <div
              key={game.id}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-heading text-xl text-brand-900">{game.title}</h2>
                  <p className="mt-1 text-sm text-slate-600">{game.description}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    game.registrationOpen
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {game.registrationOpen
                    ? "Registration Open"
                    : game.availableInMyDepartment <= 0
                      ? "Department Full"
                      : "Slots Full"}
                </span>
              </div>

              <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                <p>Venue: {game.venue}</p>
                <p>Category: {game.genderCategory}</p>
                <p>
                  Your department:{" "}
                  <span className="font-medium text-brand-900">
                    {game.availableInMyDepartment} / {game.perDepartmentPlayers}
                  </span>{" "}
                  ({game.slotMode === "team" ? "1 team" : "individual"})
                </p>
                <p>Manager: {game.manager?.name ?? "Not assigned"}</p>
              </div>

              <div className="mt-4">
                <Link
                  href={`/dashboard/games/${game.id}`}
                  className="inline-flex rounded-lg bg-linear-to-r from-brand-amber-500 to-amber-600 px-4 py-2 text-sm font-semibold text-brand-950 shadow-sm hover:brightness-110"
                >
                  View details
                </Link>
              </div>
            </div>
          ))}

          {loadedOnce && !data?.games.length && !data?.sportsWeekInactive ? (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 text-slate-600 shadow-sm">
              No eligible games available right now.
            </div>
          ) : null}

          {!loadedOnce ? (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 text-slate-600 shadow-sm">
              Loading games…
            </div>
          ) : null}
        </div>
      ) : null}
    </DashboardShell>
  );
}
