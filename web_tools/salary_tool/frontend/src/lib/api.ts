"use client";

// Simple API helper for the frontend. Manages base URL and JWT in localStorage

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export type ApiResponse<T = unknown> = {
  status: number;
  ok: boolean;
  body: T | string | null;
};

const BASE_KEY = "salary.base";
const JWT_KEY = "salary.jwt";

function detectBaseUrl(): string {
  if (typeof window === "undefined") return "";
  const path = window.location.pathname;
  // When served under a parent path behind a proxy
  if (path.includes("/web_tools/salary_tool/")) {
    return "/web_tools/salary_tool";
  }
  return ""; // same origin
}

export function getBase(): string {
  if (typeof window === "undefined") return "";
  const saved = localStorage.getItem(BASE_KEY);
  const host = window.location.hostname;
  // If a localhost base was saved but we're not on localhost, ignore it
  if (
    saved &&
    /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(saved) &&
    host !== "localhost" &&
    host !== "127.0.0.1"
  ) {
    localStorage.removeItem(BASE_KEY);
    return detectBaseUrl();
  }
  return saved ?? detectBaseUrl();
}

export function setBase(nextBase: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(BASE_KEY, nextBase);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(JWT_KEY);
}

export function setToken(token: string | ""): void {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(JWT_KEY, token);
  else localStorage.removeItem(JWT_KEY);
}

function buildUrl(pathname: string): string {
  const base = getBase();
  const baseTrimmed = base ? base.replace(/\/$/, "") : "";
  return `${baseTrimmed}${pathname}`;
}

export async function apiCall<T = unknown>(
  pathname: string,
  options: {
    method?: HttpMethod;
    body?: JsonValue | FormData;
    auth?: boolean;
    headers?: Record<string, string>;
  } = {}
): Promise<ApiResponse<T>> {
  const { method = "GET", body, auth = false, headers = {} } = options;
  const h: Record<string, string> = { ...headers };
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  if (!isFormData) h["Content-Type"] = h["Content-Type"] ?? "application/json";
  if (auth) {
    const token = getToken();
    if (token) h["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(buildUrl(pathname), {
    method,
    headers: h,
    body: isFormData ? (body as FormData) : body != null ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  const text = await res.text();
  let parsed: unknown = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = text;
  }
  return { status: res.status, ok: res.ok, body: parsed as T | string | null };
}

export function shortJwt(): string {
  const t = getToken();
  return t ? `${t.slice(0, 12)}…` : "(none)";
}


