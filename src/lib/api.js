const ENV_API_URL = (import.meta.env.VITE_API_URL || "").trim();
const API_BASE_URL = ENV_API_URL || (import.meta.env.DEV ? "http://localhost:8787" : "");

if (!API_BASE_URL && !import.meta.env.DEV) {
  throw new Error("Missing VITE_API_URL in production build");
}

export async function apiRequest(path, { method = "GET", token, body } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
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
