import { apiRequest } from "./api";
import { getAuthToken } from "./auth";

function requireToken() {
  const token = getAuthToken();
  if (!token) throw new Error("Missing authentication token.");
  return token;
}

export function getDashboardData() {
  return apiRequest<{
    student: {
      id: string;
      name: string;
      department: string;
      gender: "male" | "female";
      email: string;
    };
    summary: {
      activeGames: number;
      myRegistrations: number;
      pendingApprovals: number;
      acceptedRegistrations: number;
      unreadNotifications: number;
    };
  }>("/student/dashboard", "GET", undefined, requireToken());
}

export function getGames() {
  return apiRequest<{
    games: Array<{
      id: string;
      title: string;
      slug: string;
      description: string;
      venue: string;
      genderCategory: "male" | "female" | "mixed";
      totalSlots: number;
      acceptedRegistrations: number;
      availableSlots: number;
      registrationOpen: boolean;
      manager: { id: string; name: string } | null;
    }>;
  }>("/student/games", "GET", undefined, requireToken());
}

export function getGameDetails(gameId: string) {
  return apiRequest<{
    game: {
      id: string;
      title: string;
      description: string;
      venue: string;
      rulesSummary: string;
      genderCategory: "male" | "female" | "mixed";
      totalSlots: number;
      acceptedRegistrations: number;
      availableSlots: number;
      registrationOpen: boolean;
      registrationStatus: "pending" | "accepted" | "rejected" | "cancelled" | null;
      manager: {
        id: string;
        name: string;
        email: string;
        phone: string;
        officeAddress: string;
        officeHours: string;
      } | null;
    };
  }>(`/student/games/${gameId}`, "GET", undefined, requireToken());
}

export function registerForGame(gameId: string) {
  return apiRequest<{ message: string }>(
    `/student/games/${gameId}/register`,
    "POST",
    {},
    requireToken(),
  );
}

export function getRegistrations() {
  return apiRequest<{
    registrations: Array<{
      id: string;
      status: "pending" | "accepted" | "rejected" | "cancelled";
      decisionNote: string | null;
      decidedAt: string | null;
      createdAt: string;
      game: { id: string; title: string; venue: string } | null;
    }>;
  }>("/student/registrations", "GET", undefined, requireToken());
}

export function decideRegistration(id: string, status: "accepted" | "rejected") {
  return apiRequest<{ message: string }>(
    `/student/registrations/${id}/decision`,
    "PATCH",
    { status },
    requireToken(),
  );
}

export function getSchedule() {
  return apiRequest<{ schedule: Array<{ title: string; datetime: string; venue: string; note: string }> }>(
    "/student/schedule",
    "GET",
    undefined,
    requireToken(),
  );
}

export function getRules() {
  return apiRequest<{ rules: Array<{ _id: string; title: string; description: string }> }>(
    "/student/rules",
    "GET",
    undefined,
    requireToken(),
  );
}

export function getCommittee() {
  return apiRequest<{ committee: Array<{ name: string; role: string; contact: string }> }>(
    "/student/committee",
    "GET",
    undefined,
    requireToken(),
  );
}

export function getGameManagers() {
  return apiRequest<{
    managers: Array<{
      _id: string;
      name: string;
      email: string;
      phone: string;
      officeAddress: string;
      officeHours: string;
      department?: string;
    }>;
  }>("/student/game-managers", "GET", undefined, requireToken());
}

export function getResults() {
  return apiRequest<{
    results: Array<{
      _id: string;
      gameTitle: string;
      winnerDepartment: string;
      runnerUpDepartment?: string;
      playedAt: string;
    }>;
  }>("/student/results", "GET", undefined, requireToken());
}

export function getStats() {
  return apiRequest<{
    byDepartment: Array<{ label: string; value: number }>;
    byGame: Array<{ label: string; value: number }>;
  }>("/student/stats", "GET", undefined, requireToken());
}

export function getNotifications() {
  return apiRequest<{
    notifications: Array<{
      _id: string;
      title: string;
      message: string;
      category: string;
      isRead: boolean;
      createdAt: string;
    }>;
  }>("/student/notifications", "GET", undefined, requireToken());
}
