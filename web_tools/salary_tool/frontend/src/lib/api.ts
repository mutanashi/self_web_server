"use client";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

export interface ApiCallOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
}

export interface ApiResponse<T = unknown> {
  ok: boolean;
  status: number;
  statusText: string;
  body: T | string | null;
}

const BASE_STORAGE_KEY = "salaryTool.baseUrl";
const TOKEN_STORAGE_KEY = "salaryTool.jwt";

export function getBase(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(BASE_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

export function setBase(baseUrl: string): void {
  if (typeof window === "undefined") return;
  try {
    if (baseUrl) {
      localStorage.setItem(BASE_STORAGE_KEY, baseUrl);
    } else {
      localStorage.removeItem(BASE_STORAGE_KEY);
    }
  } catch {
    // ignore
  }
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // ignore
  }
}

export function getToken(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

export function shortJwt(): string {
  const token = getToken();
  if (!token) return "(none)";
  if (token.length <= 12) return token;
  return `${token.slice(0, 6)}…${token.slice(-6)}`;
}

export async function apiCall<T = unknown>(path: string, options: ApiCallOptions = {}): Promise<ApiResponse<T>> {
  const baseUrl = getBase();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${baseUrl}${normalizedPath}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const init: RequestInit = {
    method: options.method || (options.body ? "POST" : "GET"),
    headers,
    body: options.body != null ? JSON.stringify(options.body) : undefined,
  };

  try {
    const resp = await fetch(url, init);
    const contentType = resp.headers.get("content-type") || "";
    let body: any = null;
    if (contentType.includes("application/json")) {
      body = await resp.json().catch(() => null);
    } else {
      body = await resp.text().catch(() => null);
    }
    return { ok: resp.ok, status: resp.status, statusText: resp.statusText, body };
  } catch (error: any) {
    return { ok: false, status: 0, statusText: error?.message || "network-error", body: null };
  }
}


