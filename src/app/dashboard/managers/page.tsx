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
type ManagerCard = {
  key: string;
  name: string;
  email: string;
  phone: string;
  officeAddress: string;
  officeHours: string;
  categories: string[];
};

export default function ManagersPage() {
  const [data, setData] = useState<ManagersResponse | null>(null);
  const [teamManagers, setTeamManagers] = useState<TeamManagersResponse["teamManagers"]>([]);

  const managerCards = (() => {
    const grouped = new Map<string, ManagerCard>();
    for (const manager of data?.managers ?? []) {
      const key = manager.email || `${manager.name}-${manager._id}`;
      const existing = grouped.get(key);
      if (!existing) {
        grouped.set(key, {
          key,
          name: manager.name,
          email: manager.email,
          phone: manager.phone,
          officeAddress: manager.officeAddress,
          officeHours: manager.officeHours,
          categories: manager.categoryName ? [manager.categoryName] : [],
        });
        continue;
      }
      if (manager.categoryName && !existing.categories.includes(manager.categoryName)) {
        existing.categories.push(manager.categoryName);
      }
    }
    return Array.from(grouped.values()).sort((a, b) => a.name.localeCompare(b.name));
  })();

  useEffect(() => {
    getDashboardData()
      .then(async (dashboard) => {
        const [managersResponse, teamManagersResponse] = await Promise.all([
          getGameManagers({ gender: dashboard.student.gender }),
          getDepartmentTeamManagers({
            department: dashboard.student.department,
            gender: dashboard.student.gender,
          }),
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
        {managerCards.map((m) => (
          <div key={m.key} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <h2 className="font-heading text-xl text-brand-900">{m.name}</h2>
            {m.categories.length ? (
              <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">
                Games: {m.categories.join(", ")}
              </p>
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
            {m.members.length ? (
              <ul className="mt-2 space-y-1 text-sm text-slate-600">
                {m.members.map((member, idx) => (
                  <li key={`${m._id}-${idx}`}>
                    <span className="font-medium text-brand-900">{member.name}</span>
                    {member.contact ? ` · ${member.contact}` : ""}
                  </li>
                ))}
              </ul>
            ) : m.contact ? (
              <p className="mt-1 text-sm text-slate-600">Contact: {m.contact}</p>
            ) : null}
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
