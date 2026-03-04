const isLocalHost =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname);

const rawBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  (isLocalHost ? "http://127.0.0.1:8000" : "https://bookingproject-d57t.onrender.com");

const normalizedBaseUrl = rawBaseUrl
  .replace("https://bookingproject.onrender.com", "https://bookingproject-d57t.onrender.com")
  .replace(/\/+$/, "");

export const API_BASE_URL = normalizedBaseUrl;

export function apiUrl(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}
