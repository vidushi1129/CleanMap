import axios from "axios";

const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const api = axios.create({ baseURL: BASE });

// ── Reports ───────────────────────────────────────────────────────────
export const getReports  = (status) => api.get("/reports", { params: status ? { status } : {} });
export const getStats    = ()        => api.get("/reports/stats");
export const createReport = (data)  => api.post("/reports", data);
export const claimReport  = (id, volunteerName) => api.patch(`/reports/${id}/claim`, { volunteerName });
export const cleanReport  = (id, volunteerName) => api.patch(`/reports/${id}/clean`, { volunteerName });
export const deleteReport = (id)    => api.delete(`/reports/${id}`);

// ── Image upload ──────────────────────────────────────────────────────
export const uploadImage = (file) => {
  const form = new FormData();
  form.append("image", file);
  return api.post("/uploads/image", form, { headers: { "Content-Type": "multipart/form-data" } });
};
