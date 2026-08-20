import { apiRequest } from "./client";

export function list(params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiRequest(`/reports${query ? `?${query}` : ""}`);
}

export function getOne(id) {
  return apiRequest(`/reports/${id}`);
}

export function generate(body) {
  return apiRequest("/reports", { method: "POST", body });
}
