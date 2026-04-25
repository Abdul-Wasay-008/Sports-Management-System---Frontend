"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ApiError } from "@/lib/api";
import {
  getDashboardData,
  getDepartmentTeamManagers,
  getGameManagers,
} from "@/lib/student-api";

type ManagersResponse = Awaited<ReturnType<typeof getGameManagers>>;
type TeamManagersResponse = Awaited<ReturnType<typeof getDepartmentTeamManagers>>;

export default function ManagersPage() {
  const [data, setData] = useState<ManagersResponse | null>(null);
  const [teamManagers, setTeamManagers] = useState<TeamManagersResponse["teamManagers"]>([]);

  useEffect(() => {
    getDashboardData()
      .then(async (dashboard) => {
        const [managersResponse, teamManagersResponse] = await Promise.all([
          getGameManagers(),
          getDepartmentTeamManagers({ department: dashboard.student.department }),
        ]);
        setData(managersResponse);
        setTeamManagers(teamManagersResponse.teamManagers);
      })
      .catch((err) =>
        toast.error(err instanceof ApiError ? err.message : "Failed to load game managers."),
      );
  }, []);

  return (
    <DashboardShell title="Game Managers" subtitle="Contact game managers for clarifications and support.">
      <div className="grid gap-4 md:grid-cols-2">
        {data?.managers.map((m) => (
          <div key={m._id} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <h2 className="font-heading text-xl text-brand-900">{m.name}</h2>
            {m.categoryName ? (
              <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">{m.categoryName}</p>
            ) : null}
            <p className="mt-2 text-sm text-slate-600">Email: {m.email}</p>
            <p className="mt-1 text-sm text-slate-600">Phone: {m.phone}</p>
            <p className="mt-1 text-sm text-slate-600">Office: {m.officeAddress}</p>
            <p className="mt-1 text-sm text-slate-600">Hours: {m.officeHours}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {teamManagers.map((m) => (
          <div key={m._id} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <h2 className="font-heading text-xl text-brand-900">{m.managerName}</h2>
            <p className="mt-2 text-sm text-slate-600">Department: {m.department}</p>
            <p className="mt-1 text-sm text-slate-600">Game: {m.gameCategoryName || "N/A"}</p>
            {m.contact ? <p className="mt-1 text-sm text-slate-600">Contact: {m.contact}</p> : null}
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
