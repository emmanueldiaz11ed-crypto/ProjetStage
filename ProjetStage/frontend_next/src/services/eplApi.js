import axios from "axios";

const baseRaw = process.env.NEXT_PUBLIC_EPL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";
const baseURL = baseRaw.endsWith("/api") ? baseRaw.slice(0, -4) : baseRaw;

const eplApi = axios.create({
  baseURL: `${baseURL.replace(/\/$/, "")}/api`,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

function getAccessToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage?.getItem("access") || window.localStorage?.getItem("access_token") || null;
}

function buildQueryString(params = {}) {
  return new URLSearchParams(Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== "")).toString();
}

export function getFigureUrl(view, params = {}, fmt = "png") {
  const query = buildQueryString({ view, fmt, ...params });
  return `${eplApi.defaults.baseURL}/figures?${query}`;
}

export async function getHealth() {
  const response = await eplApi.get("/health");
  return response.data;
}

export async function getDashboardAggregates(params = {}) {
  const response = await eplApi.get("/dashboard/aggregates", { params });
  return response.data;
}

export async function getDisponibilites(params = {}) {
  const response = await eplApi.get("/meta/disponibilites", { params });
  return response.data;
}

export async function getUes(limit = 1000) {
  const response = await eplApi.get("/meta/ues", { params: { limit } });
  return response.data;
}

export async function getUEStats(code, params = {}) {
  const response = await eplApi.get(`/ues/${encodeURIComponent(code)}/stats`, { params });
  return response.data;
}

export async function getCompare(params = {}) {
  const response = await eplApi.get(`/compare`, { params });
  return response.data;
}

export async function getEtudiantParcours(id, params = {}) {
  const response = await eplApi.get(`/etudiants/${encodeURIComponent(id)}/parcours`, { params });
  return response.data;
}

export async function uploadData(fileOrForm, token) {
  const formData = fileOrForm instanceof FormData
    ? fileOrForm
    : (() => {
        const fd = new FormData();
        fd.append("file", fileOrForm);
        return fd;
      })();

  const accessToken = token || getAccessToken();
  const headers = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await eplApi.post("/data/upload", formData, {
    headers,
  });

  return response.data;
}

export default eplApi;
