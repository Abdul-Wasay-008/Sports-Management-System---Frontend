import { apiRequest } from "./api";
import { getAuthToken } from "./auth";

function requireToken() {
  const token = getAuthToken();
  if (!token) throw new Error("Missing authentication token.");
  return token;
}

function withParams(path: string, params?: Record<string, string | undefined>) {
  if (!params) return path;
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") search.set(k, v);
  }
  const q = search.toString();
  return q ? `${path}?${q}` : path;
}

export type AdminOverview = {
  students: {
    total: number;
    byGender: { male: number; female: number };
    byStatus: { active: number; suspended: number };
  };
  games: {
    total: number;
    byGender: { male: number; female: number; mixed: number };
    totalAcceptedRegistrations: number;
  };
  registrations: {
    total: number;
    byStatus: {
      pending: number;
      demoBooked: number;
      accepted: number;
      rejected: number;
      cancelled: number;
    };
  };
  committee: { total: number };
  gameManagers: { total: number };
};

export function getAdminOverview() {
  return apiRequest<AdminOverview>("/admin/overview", "GET", undefined, requireToken());
}

export type AdminStudentRow = {
  id: string;
  name: string;
  email: string;
  registrationNumber: string;
  gender: "male" | "female";
  department: string;
  status: string;
  emailVerified: boolean;
  registrationCount: number;
  createdAt: string;
};

export function listAdminStudents(params?: {
  search?: string;
  status?: string;
  gender?: string;
  department?: string;
  page?: number;
  limit?: number;
}) {
  return apiRequest<{
    students: AdminStudentRow[];
    total: number;
    page: number;
    limit: number;
  }>(
    withParams("/admin/students", {
      search: params?.search,
      status: params?.status,
      gender: params?.gender,
      department: params?.department,
      page: params?.page?.toString(),
      limit: params?.limit?.toString(),
    }),
    "GET",
    undefined,
    requireToken(),
  );
}

export function createAdminStudent(body: {
  name: string;
  email: string;
  registrationNumber: string;
  gender: "male" | "female";
  department: string;
  password: string;
}) {
  return apiRequest<AdminStudentRow>("/admin/students", "POST", body, requireToken());
}

export function updateAdminStudent(
  id: string,
  body: Partial<{
    name: string;
    email: string;
    registrationNumber: string;
    gender: "male" | "female";
    department: string;
    status: "active" | "inactive" | "suspended";
  }>,
) {
  return apiRequest<AdminStudentRow>(`/admin/students/${id}`, "PATCH", body, requireToken());
}

export function setAdminStudentStatus(id: string, status: "active" | "suspended") {
  return apiRequest<{ id: string; status: string }>(`/admin/students/${id}/status`, "PATCH", { status }, requireToken());
}

export function deleteAdminStudent(id: string) {
  return apiRequest<{ deleted: boolean }>(`/admin/students/${id}`, "DELETE", undefined, requireToken());
}

export type AdminSlotMode = "individual" | "team";

export type AdminSlotEvent = { name: string; perDepartmentPlayers: number };

export type AdminGameSlotPolicy = {
  mode: AdminSlotMode;
  perDepartmentPlayers: number;
  events: AdminSlotEvent[] | null;
};

export function listAdminGames(params?: { search?: string; gender?: string; sportId?: string }) {
  return apiRequest<{
    games: Array<{
      id: string;
      title: string;
      slug: string;
      description: string;
      genderCategory: string;
      venue: string;
      rulesSummary: string;
      totalSlots: number;
      acceptedRegistrations: number;
      slotMode: AdminSlotMode | null;
      perDepartmentPlayers: number | null;
      slotPolicy: AdminGameSlotPolicy | null;
      isActive: boolean;
      managerId?: string;
      manager?: unknown;
      gameCategoryId?: string;
      category?: unknown;
      createdAt: string;
      updatedAt: string;
    }>;
  }>(
    withParams("/admin/games", {
      search: params?.search,
      gender: params?.gender,
      sportId: params?.sportId,
    }),
    "GET",
    undefined,
    requireToken(),
  );
}

export function createAdminGame(body: {
  title: string;
  slug: string;
  description: string;
  genderCategory: "male" | "female" | "mixed";
  venue: string;
  rulesSummary: string;
  slotMode: AdminSlotMode;
  perDepartmentPlayers: number;
  events?: AdminSlotEvent[];
  managerId: string;
  gameCategoryId?: string;
  isActive?: boolean;
}) {
  return apiRequest<{ id: string }>("/admin/games", "POST", body, requireToken());
}

export function updateAdminGame(
  id: string,
  body: Partial<{
    title: string;
    slug: string;
    description: string;
    genderCategory: "male" | "female" | "mixed";
    venue: string;
    rulesSummary: string;
    slotMode: AdminSlotMode;
    perDepartmentPlayers: number;
    events: AdminSlotEvent[];
    managerId: string;
    gameCategoryId: string;
    isActive: boolean;
  }>,
) {
  return apiRequest<{ id: string }>(`/admin/games/${id}`, "PATCH", body, requireToken());
}

export function deleteAdminGame(id: string) {
  return apiRequest<{ deleted: boolean }>(`/admin/games/${id}`, "DELETE", undefined, requireToken());
}

export function getAdminGameRegistrations(gameId: string, status?: string) {
  return apiRequest<{
    game: { id: string; title: string; slug: string };
    registrations: Array<{
      id: string;
      status: string;
      decisionNote?: string;
      decidedAt?: string;
      createdAt: string;
      demo: { startsAt: string; endsAt: string } | null;
      student: {
        id: string;
        name: string;
        email: string;
        registrationNumber: string;
        gender: string;
        department: string;
      } | null;
    }>;
  }>(
    withParams(`/admin/games/${gameId}/registrations`, { status }),
    "GET",
    undefined,
    requireToken(),
  );
}

export type AdminStats = {
  byGender: { male: number; female: number };
  byGame: Array<{
    gameId: string;
    title: string;
    gender: string;
    pending: number;
    accepted: number;
    rejected: number;
  }>;
  byDepartment: Array<{ department: string; accepted: number }>;
};

export function getAdminStats() {
  return apiRequest<AdminStats>("/admin/stats", "GET", undefined, requireToken());
}

export function getAdminLookups() {
  return apiRequest<{
    departments: string[];
    categories: Array<{
      id: string;
      name: string;
      slug: string;
      gender: string;
      sport: { _id: string; name: string; slug: string } | null;
    }>;
    managers: Array<{ id: string; name: string; email: string; phone: string }>;
  }>("/admin/lookups", "GET", undefined, requireToken());
}

export type AdminResultRow = {
  _id: string;
  gameId?: string;
  gameTitle: string;
  gameCategoryId?: string;
  genderCategory?: "male" | "female" | "mixed";
  winnerDepartment: string;
  runnerUpDepartment?: string;
  playedAt: string;
  createdAt?: string;
};

export function listAdminResults(params?: {
  gameId?: string;
  gameCategoryId?: string;
  gender?: string;
  department?: string;
  from?: string;
  to?: string;
  limit?: number;
}) {
  return apiRequest<{ results: AdminResultRow[] }>(
    withParams("/admin/results", {
      gameId: params?.gameId,
      gameCategoryId: params?.gameCategoryId,
      gender: params?.gender,
      department: params?.department,
      from: params?.from,
      to: params?.to,
      limit: params?.limit?.toString(),
    }),
    "GET",
    undefined,
    requireToken(),
  );
}

export function createAdminResult(body: {
  gameId?: string;
  gameTitle?: string;
  gameCategoryId?: string;
  genderCategory?: "male" | "female" | "mixed";
  winnerDepartment: string;
  runnerUpDepartment?: string;
  playedAt?: string;
}) {
  return apiRequest<{ id: string }>("/admin/results", "POST", body, requireToken());
}

export function updateAdminResult(
  id: string,
  body: Partial<{
    gameId: string;
    gameTitle: string;
    gameCategoryId: string;
    genderCategory: "male" | "female" | "mixed";
    winnerDepartment: string;
    runnerUpDepartment: string;
    playedAt: string;
  }>,
) {
  return apiRequest<{ id: string }>(`/admin/results/${id}`, "PATCH", body, requireToken());
}

export function deleteAdminResult(id: string) {
  return apiRequest<{ deleted: boolean }>(
    `/admin/results/${id}`,
    "DELETE",
    undefined,
    requireToken(),
  );
}
