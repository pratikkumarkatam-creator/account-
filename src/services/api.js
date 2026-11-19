/**
 * Small wrapper around fetch().
 *
 * In development Vite proxies /api to Flask, so a relative base URL keeps the
 * session cookie first-party. Set VITE_API_URL when the API lives elsewhere.
 */
const BASE_URL = import.meta.env.VITE_API_URL || "";

export class ApiError extends Error {
  constructor(message, status, fields = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fields = fields;
  }
}

function buildUrl(path, params) {
  const url = new URL(`${BASE_URL}${path}`, window.location.origin);
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });
  return url.toString();
}

async function request(path, { method = "GET", body, params } = {}) {
  let response;

  try {
    response = await fetch(buildUrl(path, params), {
      method,
      credentials: "include",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Cannot reach the server. Is the Flask API running?", 0);
  }

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    if (response.status === 401 && !path.startsWith("/api/auth/login")) {
      window.dispatchEvent(new Event("auth:expired"));
    }
    throw new ApiError(
      payload?.error || "Something went wrong. Please try again.",
      response.status,
      payload?.fields || {},
    );
  }

  return payload;
}

async function download(path, params) {
  const response = await fetch(buildUrl(path, params), { credentials: "include" });

  if (!response.ok) {
    let message = "Could not generate the PDF. Please try again.";
    try {
      const payload = await response.json();
      if (payload?.error) message = payload.error;
    } catch {
      /* response was not JSON */
    }
    throw new ApiError(message, response.status);
  }

  const disposition = response.headers.get("Content-Disposition") || "";
  const match = disposition.match(/filename="?([^";]+)"?/i);
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = match?.[1]?.trim() || "account-statement.pdf";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);

  return match?.[1] || "account-statement.pdf";
}

export const api = {
  // Authentication
  login: (credentials) => request("/api/auth/login", { method: "POST", body: credentials }),
  logout: () => request("/api/auth/logout", { method: "POST" }),
  me: () => request("/api/auth/me"),
  updateProfile: (payload) => request("/api/auth/profile", { method: "PUT", body: payload }),
  updatePassword: (payload) => request("/api/auth/password", { method: "PUT", body: payload }),
  updatePreferences: (payload) =>
    request("/api/auth/preferences", { method: "PUT", body: payload }),

  // Dashboard
  dashboard: () => request("/api/dashboard/summary"),

  // Accounts
  listAccounts: (params) => request("/api/accounts", { params }),
  createAccount: (payload) => request("/api/accounts", { method: "POST", body: payload }),
  updateAccount: (id, payload) =>
    request(`/api/accounts/${id}`, { method: "PUT", body: payload }),
  deleteAccount: (id) => request(`/api/accounts/${id}`, { method: "DELETE" }),

  // Transactions
  listTransactions: (params) => request("/api/transactions", { params }),
  getTransaction: (id) => request(`/api/transactions/${id}`),
  createTransaction: (payload) =>
    request("/api/transactions", { method: "POST", body: payload }),
  updateTransaction: (id, payload) =>
    request(`/api/transactions/${id}`, { method: "PUT", body: payload }),
  deleteTransaction: (id) => request(`/api/transactions/${id}`, { method: "DELETE" }),

  // Statements
  previewStatement: (params) => request("/api/statements/preview", { params }),
  downloadStatement: (params) => download("/api/statements/pdf", params),
};
