// src/services/api.js
import axios from "axios";

const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_EPL_API_URL || "http://localhost:8001";
const normalizedBaseUrl = rawBaseUrl.replace(/\/$/, "");

const api = axios.create({
  baseURL: `${normalizedBaseUrl}/api`,
  timeout: 0,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

// CACHE GLOBAL (10 minutes)
const cache = new Map();
const CACHE_DURATION = 10 * 60 * 1000;

const CACHED_ROUTES = ["/api/inscription"];

api.interceptors.response.use((response) => {
  if (response.config.method === "get") {
    const shouldCache = CACHED_ROUTES.some(route =>
      response.config.url?.includes(route)
    );

    if (shouldCache) {
      const key = response.config.url;
      cache.set(key, {
        data: response.data,
        timestamp: Date.now(),
      });
    }
  }
  return response;
});


export default api;
