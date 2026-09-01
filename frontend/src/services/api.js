/**
 * API service — wraps browser's built-in HTTP client.
 * Handles JWT auth headers and 401 redirects.
 */

const API_URL = import.meta.env.VITE_API_URL || "/api";

async function request(method, path, { body, params } = {}) {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = "Bearer " + token;

  let url = API_URL + path;
  if (params) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) qs.append(k, v);
    });
    const qstr = qs.toString();
    if (qstr) url += "?" + qstr;
  }

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(url, options);

  if (res.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (res.status === 204) return null;

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || "Request failed");
  }

  return res.json();
}

const get = (path, params) => request("GET", path, { params });
const post = (path, body) => request("POST", path, { body });
const patch = (path, body) => request("PATCH", path, { body });
const del = (path) => request("DELETE", path);

// -- Auth --
export const authAPI = {
  register: (data) => post("/auth/register", data),
  login: (data) => post("/auth/login", data),
  getMe: () => get("/auth/me"),
  updateMe: (data) => patch("/auth/me", data),
};

// -- Expenses --
export const expenseAPI = {
  create: (data) => post("/expenses/", data),
  list: (params) => get("/expenses/", params),
  get: (id) => get("/expenses/" + id),
  update: (id, data) => patch("/expenses/" + id, data),
  remove: (id) => del("/expenses/" + id),
  vendors: (q) => get("/expenses/vendors", { q }),
};

// -- Recurring --
export const recurringAPI = {
  create: (data) => post("/recurring/", data),
  list: () => get("/recurring/"),
  update: (id, data) => patch("/recurring/" + id, data),
  remove: (id) => del("/recurring/" + id),
};

// -- Dashboard --
export const dashboardAPI = {
  summary: (params) => get("/dashboard/summary", params),
  byVendor: (params) => get("/dashboard/by-vendor", params),
  byPaymentMethod: (params) => get("/dashboard/by-payment-method", params),
  monthlyTrend: (params) => get("/dashboard/monthly-trend", params),
  yearlySummary: () => get("/dashboard/yearly-summary"),
  streak: () => get("/dashboard/streak"),
  monthComparison: () => get("/dashboard/month-comparison"),
};

// -- Reminders --
export const reminderAPI = {
  getPreferences: () => get("/reminders/preferences"),
  updatePreferences: (data) => patch("/reminders/preferences", data),
};
