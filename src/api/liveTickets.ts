// Live-updates tickets, kept for the tab in sessionStorage and reused until they expire, so most page loads open their
// sockets without asking for one. `live:me` opens the account's socket, `live:<code>` that party's. A ticket is only
// checked when its socket opens, so one that's refused is dropped, and the next connect asks for a new one.

const PREFIX = "live:";

/** The API's tickets work for 5 minutes. Kept a little less, so one never expires on its way. */
const KEEP_MS = 4.5 * 60_000;

/** Where the ticket for a party's socket (with its code) or the account's (without) is kept. */
export const ticketName = (code?: string) => `${PREFIX}${code ?? "me"}`;

/** The kept ticket, while it still works. */
export function keptTicket(name: string): string | null {
  try {
    const kept = JSON.parse(sessionStorage.getItem(name) ?? "null");
    return kept && typeof kept.ticket === "string" && kept.until > Date.now() ? kept.ticket : null;
  } catch {
    return null;
  }
}

export function keepTicket(name: string, ticket: string) {
  try {
    sessionStorage.setItem(name, JSON.stringify({ ticket, until: Date.now() + KEEP_MS }));
  } catch {
    // Not kept: the next connect asks again.
  }
}

export function dropTicket(name: string) {
  try {
    sessionStorage.removeItem(name);
  } catch {
    // Nothing kept.
  }
}

/** Forgets every ticket (on sign-out). */
export function dropAllTickets() {
  try {
    Object.keys(sessionStorage).filter(name => name.startsWith(PREFIX)).forEach(name => sessionStorage.removeItem(name));
  } catch {
    // Nothing kept.
  }
}
