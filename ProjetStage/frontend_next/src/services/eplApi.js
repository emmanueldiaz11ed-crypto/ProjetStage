import axios from "axios";

const baseRaw = process.env.NEXT_PUBLIC_EPL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";
const baseURL = baseRaw.endsWith("/api") ? baseRaw.slice(0, -4) : baseRaw;

const eplApi = axios.create({
  baseURL: `${baseURL.replace(/\/$/, "")}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

function getAccessToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage?.getItem("access") || null;
}

export async function getHealth() {
  const response = await eplApi.get("/health");
  return response.data;
}

export async function getDashboardAggregates(params = {}) {
  const response = await eplApi.get("/dashboard/aggregates", { params });
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
  const headers = { "Content-Type": undefined };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await eplApi.post("/data/upload", formData, {
    headers,
  });

  return response.data;
}

export default eplApi;
