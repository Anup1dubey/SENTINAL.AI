import { apiRequest } from "./client";

export function create(formData) {
  return apiRequest("/inspections", { method: "POST", body: formData, isFormData: true });
}

export function list(params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiRequest(`/inspections${query ? `?${query}` : ""}`);
}

export function getOne(id) {
  return apiRequest(`/inspections/${id}`);
}
