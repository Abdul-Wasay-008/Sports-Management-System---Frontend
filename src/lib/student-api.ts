import { apiRequest } from "./api";
import { getAuthToken } from "./auth";

type StudentFilters = {
  department?: string;
  gender?: "male" | "female" | "mixed";
  gameCategoryId?: string;
  gameId?: string;
};

function requireToken() {
  const token = getAuthToken();
  if (!token) throw new Error("Missing authentication token.");
  return token;
}

function withQuery(path: string, filters?: StudentFilters) {
  if (!filters) return path;
  const params = new URLSearchParams();
  if (filters.department) params.set("department", filters.department);
  if (filters.gender) params.set("gender", filters.gender);
  if (filters.gameCategoryId) params.set("gameCategoryId", filters.gameCategoryId);
  if (filters.gameId) params.set("gameId", filters.gameId);
  const query = params.toString();
  return query ? `${path}?${query}` : path;
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

export function getGames(filters?: StudentFilters) {
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
  }>(withQuery("/student/games", filters), "GET", undefined, requireToken());
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

export function getRegistrations(filters?: StudentFilters) {
  return apiRequest<{
    registrations: Array<{
      id: string;
      status: "pending" | "accepted" | "rejected" | "cancelled";
      decisionNote: string | null;
      decidedAt: string | null;
      createdAt: string;
      game: { id: string; title: string; venue: string } | null;
    }>;
  }>(withQuery("/student/registrations", filters), "GET", undefined, requireToken());
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
  return apiRequest<{ committee: Array<{ _id: string; name: string; role: string; contact: string }> }>(
    "/student/committee",
    "GET",
    undefined,
    requireToken(),
  );
}

export function getGameManagers(filters?: Pick<StudentFilters, "gameCategoryId" | "gender">) {
  return apiRequest<{
    managers: Array<{
      _id: string;
      name: string;
      email: string;
      phone: string;
      officeAddress: string;
      officeHours: string;
      department?: string;
      categoryId?: string | null;
      categoryName?: string;
      categoryGender?: "male" | "female" | "mixed" | null;
    }>;
  }>(withQuery("/student/game-managers", filters), "GET", undefined, requireToken());
}

export function getResults(filters?: StudentFilters) {
  return apiRequest<{
    results: Array<{
      _id: string;
      gameTitle: string;
      genderCategory?: "male" | "female" | "mixed";
      winnerDepartment: string;
      runnerUpDepartment?: string;
      playedAt: string;
    }>;
  }>(withQuery("/student/results", filters), "GET", undefined, requireToken());
}

export function getStats(filters?: Pick<StudentFilters, "department" | "gender" | "gameCategoryId">) {
  return apiRequest<{
    byDepartment: Array<{ label: string; value: number }>;
    byGame: Array<{ label: string; value: number }>;
  }>(withQuery("/student/stats", filters), "GET", undefined, requireToken());
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

export function getDepartmentTeamManagers(
  filters?: Pick<StudentFilters, "department" | "gameCategoryId" | "gender">,
) {
  return apiRequest<{
    teamManagers: Array<{
      _id: string;
      department: string;
      managerName: string;
      contact: string | null;
      gameCategoryId: string | null;
      gameCategoryName: string;
      gameCategoryGender: "male" | "female" | "mixed" | null;
    }>;
  }>(withQuery("/student/team-managers", filters), "GET", undefined, requireToken());
}

export function getGameCategories() {
  return apiRequest<{
    categories: Array<{
      id: string;
      name: string;
      slug: string;
      gender: "male" | "female" | "mixed";
    }>;
  }>("/student/game-categories", "GET", undefined, requireToken());
}
