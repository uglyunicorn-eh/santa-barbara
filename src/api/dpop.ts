// Bound sessions (DPoP, RFC 9449). At sign-in the app makes a key pair the browser can't export and keeps it in
// IndexedDB; the API binds the new session token to its public key. Every request with the token then carries a proof
// (`DPoP` header) signed by that key, so a token copied out of a HAR file or a log is useless without this browser.

/** Where the key lives. scripts/shots/shots.mjs writes the same record, for its signed-in screens. */
const DB_NAME = "gnomik";
const STORE = "keys";
const RECORD = "session";

/** What a browser that can't keep a key shows instead of signing in. */
export const NO_KEY_MESSAGE = "This browser can't keep you signed in. Please try another browser, or a window that isn't private.";

/** The public key as the API takes it: a P-256 JWK with only its key fields. */
export type PublicJwk = { kty: "EC"; crv: "P-256"; x: string; y: string };

type SessionKey = { keys: CryptoKeyPair; jwk: PublicJwk };

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error("IndexedDB is blocked"));
  });
}

/** Runs one request on the key store and closes the database after it. */
async function inStore<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const request = run(tx.objectStore(STORE));
      tx.oncomplete = () => resolve(request.result);
      tx.onerror = tx.onabort = () => reject(tx.error ?? request.error);
    });
  } finally {
    db.close();
  }
}

const publicJwk = async (key: CryptoKey): Promise<PublicJwk> => {
  const { kty, crv, x, y } = await crypto.subtle.exportKey("jwk", key);
  return { kty, crv, x, y } as PublicJwk;
};

/**
 * The key a session token was bound to, kept in memory for that token only: a new sign-in (here or in another tab)
 * replaces the stored key, and requests still made with the old token keep proving with the old key until then.
 * Signing out leaves the key: without a token it opens nothing, and the next sign-in replaces it.
 */
let cached: { token: string; key: Promise<SessionKey | null> } | undefined;

/**
 * Makes and keeps a new key for the next sign-in, replacing any older one, and gives its public half to send with it.
 * Throws when the browser can't keep one (no IndexedDB, or a locked-down private window): show NO_KEY_MESSAGE then.
 */
export async function newSessionKey(): Promise<PublicJwk> {
  const keys = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, false, ["sign", "verify"]);
  await inStore("readwrite", store => store.put(keys, RECORD));
  // Read it back: a store that takes the key but can't give it back can't keep anyone signed in.
  if (!await inStore("readonly", store => store.get(RECORD))) {
    throw new Error("The key wasn't kept");
  }
  return publicJwk(keys.publicKey);
}

async function loadKey(): Promise<SessionKey | null> {
  try {
    const keys = await inStore<CryptoKeyPair | undefined>("readonly", store => store.get(RECORD));
    return keys?.privateKey && keys.publicKey ? { keys, jwk: await publicJwk(keys.publicKey) } : null;
  } catch {
    return null;
  }
}

function sessionKey(token: string) {
  if (cached?.token !== token) {
    cached = { token, key: loadKey() };
  }
  return cached.key;
}

/** The API's clock minus ours, in seconds, learned from a `DPoP-Time` answer. */
let clockOffset = 0;

/** Corrects the proofs' clock to the API's time (seconds since the epoch), from a `DPoP-Time` header. */
export function setApiTime(seconds: number) {
  clockOffset = seconds - Math.floor(Date.now() / 1000);
}

const encoder = new TextEncoder();

function base64url(bytes: ArrayBuffer | Uint8Array) {
  let binary = "";
  for (const byte of new Uint8Array(bytes)) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

const json64 = (value: unknown) => base64url(encoder.encode(JSON.stringify(value)));

/**
 * A DPoP proof for one request with `token`: method, URL (origin and path, no query or trailing slash), time, a fresh
 * id, and the token's hash, signed with this browser's key. Null when the key is gone (site data cleared, another
 * browser profile): the session can't be used any more, so sign in again.
 */
export async function makeProof(method: string, url: string, token: string): Promise<string | null> {
  const key = await sessionKey(token);
  if (!key) {
    return null;
  }
  const { origin, pathname } = new URL(url);
  const header = json64({ typ: "dpop+jwt", alg: "ES256", jwk: key.jwk });
  const payload = json64({
    htm: method,
    htu: origin + (pathname.replace(/\/+$/, "") || "/"),
    iat: Math.floor(Date.now() / 1000) + clockOffset,
    jti: crypto.randomUUID(),
    ath: base64url(await crypto.subtle.digest("SHA-256", encoder.encode(token))),
  });
  // WebCrypto's ECDSA signature is already JWS's ES256 form (r and s, 32 bytes each).
  const signature = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key.keys.privateKey, encoder.encode(`${header}.${payload}`));
  return `${header}.${payload}.${base64url(signature)}`;
}
