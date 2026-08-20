import { apiRequest } from "./client";

export function list(params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiRequest(`/assets${query ? `?${query}` : ""}`);
}

export function getOne(id) {
  return apiRequest(`/assets/${id}`);
}
