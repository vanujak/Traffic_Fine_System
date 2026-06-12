const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1"
).replace(/\/$/, "");

const ACCESS_TOKEN_KEY = "traffic-fine-admin-access-token";
const REFRESH_TOKEN_KEY = "traffic-fine-admin-refresh-token";
const USER_KEY = "traffic-fine-admin-user";

const hasStorage = typeof window !== "undefined" && Boolean(window.localStorage);

export const getStoredAccessToken = () =>
  hasStorage ? window.localStorage.getItem(ACCESS_TOKEN_KEY) : null;

export const getStoredRefreshToken = () =>
  hasStorage ? window.localStorage.getItem(REFRESH_TOKEN_KEY) : null;

export const getStoredUser = () => {
  if (!hasStorage) return null;

  const value = window.localStorage.getItem(USER_KEY);
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export const setStoredSession = ({ accessToken, refreshToken, user }) => {
  if (!hasStorage) return;

  if (accessToken) {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  } else {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  }

  if (refreshToken) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } else {
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  if (user) {
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    window.localStorage.removeItem(USER_KEY);
  }
};

export const clearStoredSession = () => {
  if (!hasStorage) return;

  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
};

export const buildQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok || payload?.success === false) {
    throw new Error(
      payload?.message || `Request failed with status ${response.status}`,
    );
  }

  return payload;
}

export async function apiRequest(
  path,
  { method = "GET", body, headers = {}, token, skipAuth = false } = {},
) {
  const authToken = skipAuth ? null : token ?? getStoredAccessToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      ...headers,
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  return parseResponse(response);
}

export const loginRequest = (credentials) =>
  apiRequest("/auth/login", {
    method: "POST",
    body: credentials,
    skipAuth: true,
  });

export const refreshAccessToken = (refreshToken) =>
  apiRequest("/auth/refresh", {
    method: "POST",
    body: { refreshToken },
    skipAuth: true,
  });

export const getCurrentUser = (token) =>
  apiRequest("/auth/me", { token });

export const logoutRequest = (token) =>
  apiRequest("/auth/logout", { method: "POST", token });

export const getDashboardSummary = (token) =>
  apiRequest("/reports/summary", { token });

export const getDistrictReport = (token) =>
  apiRequest("/reports/district", { token });

export const getCategoryReport = (token) =>
  apiRequest("/reports/category", { token });

export const getRevenueReport = ({ year, token } = {}) =>
  apiRequest(`/reports/revenue${buildQueryString({ year })}`, { token });

export const getFines = ({ token, ...params } = {}) =>
  apiRequest(`/fines${buildQueryString(params)}`, { token });

export const getPayments = ({ token, ...params } = {}) =>
  apiRequest(`/payments${buildQueryString(params)}`, { token });

export const getDistricts = (token) =>
  apiRequest("/districts", { token, skipAuth: !token });

export const getUsers = ({ token, ...params } = {}) =>
  apiRequest(`/users${buildQueryString(params)}`, { token });

export const registerOfficer = (payload, token) =>
  apiRequest("/auth/register", {
    method: "POST",
    body: payload,
    token,
  });