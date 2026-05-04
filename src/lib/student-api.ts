import { apiRequest } from "./api";
import { getAuthToken } from "./auth";

type StudentFilters = {
  department?: string;
  gender?: "male" | "female" | "mixed";
  gameCategoryId?: string;
  gameId?: string;
  from?: string;
  to?: string;
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
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
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

export type GameSlotMode = "individual" | "team";

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
      slotMode: GameSlotMode;
      perDepartmentPlayers: number;
      availableInMyDepartment: number;
      acceptedInMyDepartment: number;
      registrationOpen: boolean;
      manager: { id: string; name: string } | null;
    }>;
  }>(withQuery("/student/games", filters), "GET", undefined, requireToken());
}

export type GameDetailsPayload = {
  id: string;
  title: string;
  description: string;
  venue: string;
  rulesSummary: string;
  genderCategory: "male" | "female" | "mixed";
  totalSlots: number;
  acceptedRegistrations: number;
  availableSlots: number;
  slotMode: GameSlotMode;
  perDepartmentPlayers: number;
  availableInMyDepartment: number;
  acceptedInMyDepartment: number;
  events: Array<{ name: string; perDepartmentPlayers: number }> | null;
  registrationOpen: boolean;
  registrationStatus: "demo_booked" | "pending" | "accepted" | "rejected" | "cancelled" | null;
  schedulingConfigured: boolean;
  scheduleTimezone: string;
  teamManagerContact: { name: string; contact: string | null } | null;
  teamManagerMembers: Array<{ name: string; contact: string | null }>;
  cooldownEndsAt: string | null;
  canRegisterForDemo: boolean;
  blockReason: string | null;
  demo: { startsAt: string; endsAt: string } | null;
  manager: {
    id: string;
    name: string;
    email: string;
    phone: string;
    officeAddress: string;
    officeHours: string;
  } | null;
};

export function getGameDetails(gameId: string) {
  return apiRequest<{ game: GameDetailsPayload }>(
    `/student/games/${gameId}`,
    "GET",
    undefined,
    requireToken(),
  );
}

export function getDemoSlots(gameId: string, weekStart?: string) {
  const q = weekStart ? `?weekStart=${encodeURIComponent(weekStart)}` : "";
  return apiRequest<{
    weekStart: string;
    timezone: string;
    slots: Array<{ startsAt: string; endsAt: string; status: "free" | "booked" }>;
  }>(`/student/games/${gameId}/demo-slots${q}`, "GET", undefined, requireToken());
}

export function registerForDemo(gameId: string, startsAt: string) {
  return apiRequest<{
    message: string;
    registration: { id: string; status: string };
    demo: { startsAt: string; endsAt: string; timezone: string };
  }>(
    `/student/games/${gameId}/register-demo`,
    "POST",
    { startsAt },
    requireToken(),
  );
}

export function getRegistrations(filters?: StudentFilters) {
  return apiRequest<{
    registrations: Array<{
      id: string;
      status: "demo_booked" | "pending" | "accepted" | "rejected" | "cancelled";
      decisionNote: string | null;
      decidedAt: string | null;
      createdAt: string;
      demo: { startsAt: string; endsAt: string } | null;
      game: { id: string; title: string; venue: string } | null;
    }>;
  }>(withQuery("/student/registrations", filters), "GET", undefined, requireToken());
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
      members: Array<{ name: string; contact: string | null }>;
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

export type MyStatsResponse = {
  summary: {
    totalApplied: number;
    accepted: number;
    rejected: number;
    pending: number;
    cancelled: number;
    acceptRate: number | null;
  };
  funnel: Array<{ stage: string; value: number }>;
  statusBreakdown: {
    pending: number;
    demoBooked: number;
    accepted: number;
    rejected: number;
    cancelled: number;
  };
  sportsRadar: Array<{ sport: string; tried: number; available: number }>;
  timeline: Array<{ date: string; applications: number; decisions: number }>;
  cooldowns: Array<{
    gameId: string;
    gameTitle: string;
    rejectedAt: string;
    cooldownEndsAt: string;
    daysRemaining: number;
  }>;
};

export function getMyStats() {
  return apiRequest<MyStatsResponse>("/student/me/stats", "GET", undefined, requireToken());
}

export type DepartmentTrendsResponse = {
  department: string;
  eligibleGenders: Array<"male" | "female" | "mixed">;
  slotUtilization: Array<{
    gameId: string;
    title: string;
    genderCategory: "male" | "female" | "mixed";
    totalSlots: number;
    accepted: number;
    available: number;
    utilizationPct: number;
  }>;
  genderInDepartment: { male: number; female: number };
  demoToAccept: Array<{
    gameId: string;
    title: string;
    demoStarted: number;
    decisions: number;
    accepted: number;
    rejected: number;
    acceptRate: number;
  }>;
};

export function getDepartmentTrends() {
  return apiRequest<DepartmentTrendsResponse>(
    "/student/department-trends",
    "GET",
    undefined,
    requireToken(),
  );
}

export type ResultsStandingsResponse = {
  totalEvents: number;
  medalTable: Array<{
    department: string;
    gold: number;
    silver: number;
    total: number;
  }>;
  bySport: Array<{ name: string; gold: number; silver: number }>;
  byGender: { male: number; female: number; mixed: number };
  timeline: Array<{ date: string; titles: number }>;
};

export function getResultsStandings(filters?: Pick<StudentFilters, "gameCategoryId" | "gender" | "from" | "to">) {
  return apiRequest<ResultsStandingsResponse>(
    withQuery("/student/results/standings", filters),
    "GET",
    undefined,
    requireToken(),
  );
}
