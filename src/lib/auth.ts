const AUTH_TOKEN_KEY = "cust_sports_auth_token";

export function saveAuthToken(token: string) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function clearAuthToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

/** Decode JWT payload role (client-side only; not verified). */
export function decodeAuthRole(token: string): "student" | "admin" | "team_manager" | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    let payload = parts[1];
    payload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const pad = payload.length % 4;
    if (pad) payload += "=".repeat(4 - pad);
    const json = JSON.parse(atob(payload)) as { role?: string };
    if (json.role === "admin" || json.role === "student" || json.role === "team_manager") {
      return json.role;
    }
    return null;
  } catch {
    return null;
  }
}
