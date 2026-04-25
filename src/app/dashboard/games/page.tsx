"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ApiError } from "@/lib/api";
import { getGames } from "@/lib/student-api";

type GamesResponse = Awaited<ReturnType<typeof getGames>>;

export default function GamesPage() {
  const [data, setData] = useState<GamesResponse | null>(null);

  useEffect(() => {
    getGames()
      .then(setData)
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Failed to load games."));
  }, []);

  return (
    <DashboardShell
      title="Eligible Games"
      subtitle="Browse games you can join and review slot availability before registering."
    >
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
                {game.registrationOpen ? "Registration Open" : "Slots Full"}
              </span>
            </div>

            <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
              <p>Venue: {game.venue}</p>
              <p>Category: {game.genderCategory}</p>
              <p>Available Slots: {game.availableSlots}</p>
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

        {!data?.games.length ? (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 text-slate-600 shadow-sm">
            No eligible games available right now.
          </div>
        ) : null}
      </div>
    </DashboardShell>
  );
}
