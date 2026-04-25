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
