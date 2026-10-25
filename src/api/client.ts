import { apiEndpoint, publicKey } from "src/config.json";

/** The API to talk to: production by default, or a backend preview for local work (PUBLIC_API_ENDPOINT). */
export const API_ENDPOINT: string = import.meta.env.PUBLIC_API_ENDPOINT || apiEndpoint;

/** The key that verifies the API's tokens. A backend preview signs with its own (PUBLIC_JWT_PUBLIC_KEY). */
export const JWT_PUBLIC_KEY: string = import.meta.env.PUBLIC_JWT_PUBLIC_KEY || publicKey;

/** How the API says a request failed: `{ error: { code, message, field } }`, plus the HTTP status. */
export type ApiFailure = {
  status: number;
  code: string;
  message: string;
  field?: string;
};

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: ApiFailure };

export type CallOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string;
  /** Idempotency-Key: the same key for every try of one user action. */
  key?: string;
  /**
   * Try once more after a network error or a 5xx. Only for requests that are safe to repeat: reads, requests with a
   * key, and actions the API treats as done when repeated (join, leave, draw, delete, restore, rename).
   */
  retry?: boolean;
};

const NETWORK_FAILED = "We couldn't reach the elves. Please check your connection and try again.";
const SERVER_FAILED = "Something went wrong on our side. Please try again in a bit.";

/** Calls the API under /v1. Never throws: failures come back as `{ ok: false, error }`. */
export async function apiCall<T>(path: string, options: CallOptions = {}): Promise<ApiResult<T>> {
  const { method = "GET", body, token, key, retry = false } = options;
  const request = () => fetch(`${API_ENDPOINT}/v1${path}`, {
    method,
    headers: {
      ...(body === undefined ? {} : { "content-type": "application/json" }),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(key ? { "idempotency-key": key } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  let res: Response | undefined;
  for (let attempt = 0; attempt < (retry ? 2 : 1); attempt++) {
    try {
      res = await request();
    } catch {
      res = undefined;
      continue;
    }
    if (res.status < 500) {
      break;
    }
  }
  if (!res) {
    return { ok: false, error: { status: 0, code: "network", message: NETWORK_FAILED } };
  }

  let json: any;
  try {
    json = await res.json();
  } catch {
    json = undefined;
  }
  if (res.ok) {
    return { ok: true, data: json as T };
  }
  const error = json?.error;
  return {
    ok: false,
    error: {
      status: res.status,
      code: typeof error?.code === "string" ? error.code : "internal",
      message: typeof error?.message === "string" ? error.message : SERVER_FAILED,
      ...(typeof error?.field === "string" ? { field: error.field } : {}),
    },
  };
}

/** A fresh Idempotency-Key for one user action. */
export const newKey = () => crypto.randomUUID();

/**
 * The key for an emailed link, the same for every try in this tab (a reload included), so a retry after a lost answer
 * is recognized as the same request. Another tab or browser gets its own, and is told the link was used.
 */
export function linkKey(token: string): string {
  const name = `link-key:${token.slice(-32)}`;
  try {
    const stored = sessionStorage.getItem(name);
    if (stored) {
      return stored;
    }
    const key = newKey();
    sessionStorage.setItem(name, key);
    return key;
  } catch {
    return newKey();
  }
}
