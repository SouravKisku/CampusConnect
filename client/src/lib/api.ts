import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { User } from "./types";

export const API_URL: string = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

// The short-lived access token lives only in memory. The refresh token is an httpOnly cookie the browser manages.
let accessToken: string | null = null;
export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const authEvents = new EventTarget();

export const api = axios.create({ baseURL: API_URL, withCredentials: true });

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

// Single-flight: concurrent callers (React StrictMode, parallel queries) share one refresh request,
// which matters because refresh tokens rotate and can only be used once.
let inflight: Promise<User> | null = null;
export function refreshSession(): Promise<User> {
  if (!inflight) {
    inflight = axios
      .post(`${API_URL}/auth/refresh`, null, { withCredentials: true })
      .then((res) => {
        setAccessToken(res.data.accessToken);
        return res.data.user as User;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

type RetryConfig = InternalAxiosRequestConfig & { _retried?: boolean };
const AUTH_PATHS = ["/auth/login", "/auth/register", "/auth/refresh"];

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined;
    const skip = AUTH_PATHS.some((p) => original?.url?.startsWith(p));
    if (error.response?.status === 401 && original && !original._retried && !skip) {
      original._retried = true;
      try {
        await refreshSession();
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch {
        setAccessToken(null);
        authEvents.dispatchEvent(new Event("session-expired"));
      }
    }
    return Promise.reject(error);
  }
);

interface ApiErrorBody {
  message?: string;
  code?: string;
  errors?: Record<string, string>;
}

export function errorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  if (axios.isAxiosError<ApiErrorBody>(err)) {
    if (!err.response) return "Can't reach the server. Check your connection and try again.";
    return err.response.data?.message ?? fallback;
  }
  return fallback;
}

export const errorCode = (err: unknown) => (axios.isAxiosError<ApiErrorBody>(err) ? err.response?.data?.code : undefined);
export const fieldErrors = (err: unknown): Record<string, string> =>
  axios.isAxiosError<ApiErrorBody>(err) ? err.response?.data?.errors ?? {} : {};
