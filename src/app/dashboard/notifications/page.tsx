"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ApiError } from "@/lib/api";
import { getNotifications } from "@/lib/student-api";

type NotificationsResponse = Awaited<ReturnType<typeof getNotifications>>;

export default function NotificationsPage() {
  const [data, setData] = useState<NotificationsResponse | null>(null);

  useEffect(() => {
    getNotifications()
      .then(setData)
      .catch((err) =>
        toast.error(err instanceof ApiError ? err.message : "Failed to load notifications."),
      );
  }, []);

  return (
    <DashboardShell
      title="Notifications"
      subtitle="Recent alerts for registrations, schedules, and announcements."
    >
      <div className="space-y-4">
        {data?.notifications.map((note) => (
          <div
            key={note._id}
            className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-heading text-xl text-brand-900">{note.title}</h2>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 capitalize">
                {note.category}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-600">{note.message}</p>
            <p className="mt-2 text-xs text-slate-500">
              {new Date(note.createdAt).toLocaleString()}
            </p>
          </div>
        ))}

        {!data?.notifications.length ? (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 text-slate-600 shadow-sm">
            You have no notifications right now.
          </div>
        ) : null}
      </div>
    </DashboardShell>
  );
}
