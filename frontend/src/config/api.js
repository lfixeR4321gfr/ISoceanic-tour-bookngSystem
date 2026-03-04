const isLocalHost =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname);

const rawBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  (isLocalHost ? "http://127.0.0.1:8000" : "https://bookingproject.onrender.com");

export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "");

export function apiUrl(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}
