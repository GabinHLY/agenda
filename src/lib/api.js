const ENV_API_URL = (import.meta.env.VITE_API_URL || "").trim();
const API_BASE_URL = ENV_API_URL || (import.meta.env.DEV ? "http://localhost:8787" : "");

function joinApiUrl(baseUrl, path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (!baseUrl) {
    return normalizedPath;
  }

  // Prevent duplicated '/api' when call sites still use '/api/...'.
  if (baseUrl.endsWith("/api") && normalizedPath.startsWith("/api/")) {
    return `${baseUrl}${normalizedPath.slice(4)}`;
  }

  return `${baseUrl}${normalizedPath}`;
}

export async function apiRequest(path, { method = "GET", token, body } = {}) {
  const response = await fetch(joinApiUrl(API_BASE_URL, path), {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || "Request failed");
  }

  return payload;
}
