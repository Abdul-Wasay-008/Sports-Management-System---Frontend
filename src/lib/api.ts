export const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "";

type ApiMethod = "GET" | "POST";

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiRequest<T>(
  path: string,
  method: ApiMethod,
  body?: unknown,
  token?: string,
) {
  if (!BACKEND_API_URL) {
    throw new ApiError("NEXT_PUBLIC_API_BASE_URL is not configured.", 500);
  }

  const response = await fetch(`${BACKEND_API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = (await response.json().catch(() => ({}))) as {
    error?: string;
    [key: string]: unknown;
  };

  if (!response.ok) {
    throw new ApiError(payload.error || "Request failed.", response.status);
  }

  return payload as T;
}
