"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ApiError } from "@/lib/api";
import { getRules } from "@/lib/student-api";

type RulesResponse = Awaited<ReturnType<typeof getRules>>;

export default function RulesPage() {
  const [data, setData] = useState<RulesResponse | null>(null);

  useEffect(() => {
    getRules()
      .then(setData)
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Failed to load rules."));
  }, []);

  return (
    <DashboardShell title="Rules & Regulations" subtitle="Review important participation rules before matches.">
      <div className="space-y-4">
        {data?.rules.map((rule) => (
          <div key={rule._id} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <h2 className="font-heading text-xl text-brand-900">{rule.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{rule.description}</p>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
