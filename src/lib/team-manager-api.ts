import { apiRequest } from "./api";
import { getAuthToken } from "./auth";

function requireToken() {
  const token = getAuthToken();
  if (!token) throw new Error("Missing authentication token.");
  return token;
}

export type TeamManagerAssignment = {
  department: string;
  categoryName: string;
  categorySlug: string;
  categoryGender: "male" | "female" | "mixed" | null;
};

export type TeamManagerDashboard = {
  manager: { name: string; email: string };
  summary: {
    pendingDemoApprovals: number;
    unreadNotifications: number;
    totalAssignments: number;
  };
  assignments: TeamManagerAssignment[];
  scheduleTimezone: string;
};

export type DemoQueueStatusFilter = "pending" | "accepted" | "rejected" | "all";

export type DemoQueueRow = {
  demoBookingId: string;
  registrationId: string;
  registrationStatus: "demo_booked" | "accepted" | "rejected";
  decisionNote: string | null;
  decidedAt: string | null;
  assignmentDepartment: string;
  startsAt: string;
  endsAt: string;
  student: {
    id: string;
    name: string;
    email: string;
    registrationNumber: string;
    department: string;
    gender: string;
  } | null;
  game: { id: string; title: string; venue: string; slug: string } | null;
};

export type TeamManagerNotificationRow = {
  id: string;
  title: string;
  message: string;
  registrationId: string | null;
  demoBookingId: string | null;
  isRead: boolean;
  createdAt: string;
};

export function getTeamManagerDashboard() {
  return apiRequest<TeamManagerDashboard>("/team-manager/dashboard", "GET", undefined, requireToken());
}

export function getTeamManagerDemoQueue(status: DemoQueueStatusFilter = "pending") {
  const path = `/team-manager/demo-queue?status=${encodeURIComponent(status)}`;
  return apiRequest<{
    queue: DemoQueueRow[];
    scheduleTimezone: string;
    statusFilter: DemoQueueStatusFilter;
  }>(path, "GET", undefined, requireToken());
}

export function getTeamManagerNotifications() {
  return apiRequest<{ notifications: TeamManagerNotificationRow[] }>(
    "/team-manager/notifications",
    "GET",
    undefined,
    requireToken(),
  );
}

export function markTeamManagerNotificationRead(id: string) {
  return apiRequest<{ ok: boolean }>(
    `/team-manager/notifications/${id}/read`,
    "PATCH",
    undefined,
    requireToken(),
  );
}

export function teamManagerRegistrationDecision(
  registrationId: string,
  body: { status: "accepted" | "rejected"; note?: string },
) {
  return apiRequest<{
    message: string;
    registration: { id: string; status: string; decidedAt: string };
  }>(`/team-manager/registrations/${registrationId}/decision`, "PATCH", body, requireToken());
}
