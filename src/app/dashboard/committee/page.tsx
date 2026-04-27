"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ApiError } from "@/lib/api";
import { getCommittee } from "@/lib/student-api";

type CommitteeResponse = Awaited<ReturnType<typeof getCommittee>>;

export default function CommitteePage() {
  const [data, setData] = useState<CommitteeResponse | null>(null);

  useEffect(() => {
    getCommittee()
      .then(setData)
      .catch((err) =>
        toast.error(err instanceof ApiError ? err.message : "Failed to load committee."),
      );
  }, []);

  return (
    <DashboardShell title="Core Committee" subtitle="Official coordination contacts for operations and updates.">
      <div className="space-y-4">
        {data?.committee.map((member) => (
          <div key={member._id} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <h2 className="font-heading text-xl text-brand-900">{member.name}</h2>
            <p className="mt-1 text-sm text-slate-600">Role: {member.role}</p>
            <p className="mt-1 text-sm text-slate-600">Contact: {member.contact}</p>
          </div>
        ))}
        {!data?.committee.length ? (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 text-slate-600 shadow-sm">
            Committee details have not been published yet.
          </div>
        ) : null}
      </div>
    </DashboardShell>
  );
}
