import { makeProof, setApiTime } from "@/api/dpop";
import { apiEndpoint } from "@/config.json";

/** The API to talk to: production by default, or a backend preview for local work (PUBLIC_API_ENDPOINT). */
export const API_ENDPOINT: string = import.meta.env.PUBLIC_API_ENDPOINT || apiEndpoint;

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

/** The session's key is gone from this browser, so its token can't be used: like any 401, this signs out. */
const KEY_LOST: ApiFailure = { status: 401, code: "unauthenticated", message: "Please sign in again." };

/** The header in which the API gives its time when a proof's clock was off (400). */
const DPOP_TIME = "dpop-time";

/**
 * Calls the API under /v1. Never throws: failures come back as `{ ok: false, error }`. With a token, every request
 * carries a fresh DPoP proof (src/api/dpop.ts); when the API says our clock is off, it's corrected and the request
 * sent once more.
 */
export async function apiCall<T>(path: string, options: CallOptions = {}): Promise<ApiResult<T>> {
  const { method = "GET", body, token, key, retry = false } = options;
  const url = `${API_ENDPOINT}/v1${path}`;
  const request = async () => {
    const proof = token ? await makeProof(method, url, token) : undefined;
    if (proof === null) {
      return null;
    }
    return fetch(url, {
      method,
      headers: {
        ...(body === undefined ? {} : { "content-type": "application/json" }),
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...(proof ? { dpop: proof } : {}),
        ...(key ? { "idempotency-key": key } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  };

  let res: Response | undefined;
  let clockFixed = false;
  for (let attempt = 0; attempt < (retry ? 2 : 1); attempt++) {
    try {
      const sent = await request();
      if (sent === null) {
        return { ok: false, error: KEY_LOST };
      }
      res = sent;
    } catch {
      res = undefined;
      continue;
    }
    const apiTime = Number(res.headers.get(DPOP_TIME));
    if (res.status === 400 && apiTime > 0 && !clockFixed) {
      clockFixed = true;
      setApiTime(apiTime);
      attempt--;
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
