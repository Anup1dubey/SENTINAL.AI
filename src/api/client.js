const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const TOKEN_KEY = "sentinel_token";

export class ApiError extends Error {
  constructor(status, message, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export async function apiRequest(path, { method = "GET", body, isFormData = false } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!isFormData && body !== undefined) headers["Content-Type"] = "application/json";

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
  });

  let payload = null;
  try {
    payload = await res.json();
  } catch {
    // no JSON body (e.g. some 204s)
  }

  if (!res.ok) {
    throw new ApiError(res.status, payload?.message || res.statusText, payload?.error);
  }

  return payload?.data;
}
