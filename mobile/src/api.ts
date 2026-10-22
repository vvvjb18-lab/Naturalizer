import { API_BASE_URL } from "./config";
import type {
  AdminUser,
  LoginResponse,
  OrderDetailResponse,
  OrdersResponse,
  OrderStatus,
  QuotesResponse,
} from "./types";

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH";
  token?: string;
  body?: unknown;
  signal?: AbortSignal;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      accept: "application/json",
      ...(options.body ? { "content-type": "application/json" } : {}),
      ...(options.token ? { authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  });

  const data = (await response.json().catch(() => ({}))) as {
    ok?: boolean;
    error?: string;
    [key: string]: unknown;
  };

  if (!response.ok || data.ok === false) {
    throw new ApiError(
      typeof data.error === "string" ? data.error : "request_failed",
      response.status,
      typeof data.error === "string" ? data.error : "request_failed"
    );
  }

  return data as T;
}

export async function login(identifier: string, password: string) {
  return request<LoginResponse>("/api/mobile/login", {
    method: "POST",
    body: { identifier, password },
  });
}

export async function getMe(token: string) {
  return request<{ ok: true; user: AdminUser }>("/api/mobile/me", { token });
}

export async function getOrders(
  token: string,
  options: { q?: string; status?: OrderStatus | null; signal?: AbortSignal } = {}
) {
  const params = new URLSearchParams();
  if (options.q) params.set("q", options.q);
  if (options.status) params.set("status", options.status);
  const query = params.toString();

  return request<OrdersResponse>(`/api/mobile/orders${query ? `?${query}` : ""}`, {
    token,
    signal: options.signal,
  });
}

export async function getOrder(token: string, id: string, signal?: AbortSignal) {
  return request<OrderDetailResponse>(`/api/mobile/orders/${id}`, {
    token,
    signal,
  });
}

export async function updateOrderStatus(
  token: string,
  id: string,
  status: OrderStatus
) {
  return request<OrderDetailResponse>(`/api/mobile/orders/${id}`, {
    method: "PATCH",
    token,
    body: { status },
  });
}

export async function getQuotes(token: string, signal?: AbortSignal) {
  return request<QuotesResponse>("/api/mobile/quotes", { token, signal });
}

export function isUnauthorized(error: unknown) {
  return error instanceof ApiError && error.status === 401;
}
