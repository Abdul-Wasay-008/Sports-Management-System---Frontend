"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ApiError } from "@/lib/api";
import { getGameManagers } from "@/lib/student-api";

type ManagersResponse = Awaited<ReturnType<typeof getGameManagers>>;

export default function ManagersPage() {
  const [data, setData] = useState<ManagersResponse | null>(null);

  useEffect(() => {
    getGameManagers()
      .then(setData)
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
            <p className="mt-2 text-sm text-slate-600">Email: {m.email}</p>
            <p className="mt-1 text-sm text-slate-600">Phone: {m.phone}</p>
            <p className="mt-1 text-sm text-slate-600">Office: {m.officeAddress}</p>
            <p className="mt-1 text-sm text-slate-600">Hours: {m.officeHours}</p>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
