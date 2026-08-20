import { apiRequest } from "./client";

export function list(params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiRequest(`/priority-queue${query ? `?${query}` : ""}`);
}

export function create(body) {
  return apiRequest("/priority-queue", { method: "POST", body });
}

export function update(id, body) {
  return apiRequest(`/priority-queue/${id}`, { method: "PATCH", body });
}
