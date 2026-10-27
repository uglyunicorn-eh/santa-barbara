import React from "react";

import { API_ENDPOINT } from "@/api/client";
import { dropTicket, keepTicket, keptTicket, ticketName } from "@/api/liveTickets";
import { useAppClient } from "@/components/hooks/useAppClient";

/** The API's live-updates address: its own host, over wss (ws for a local http preview). */
const LIVE_ENDPOINT = API_ENDPOINT.replace(/^http/, "ws");

/** Keep-alive interval. The API answers "ping" without waking anything. */
const PING_MS = 30_000;

/** Reconnects wait about this long at first, doubling up to the most, with jitter (deploys drop every socket at once). */
const FIRST_RETRY_MS = 1000;
const MOST_RETRY_MS = 30_000;

/**
 * Which socket: its path under the API, and how it's opened. `ticket: "me"` trades the session for the account's
 * ticket, `ticket: { code }` for that party's (the code travels inside the ticket, never in the URL), and no ticket
 * opens a public socket.
 */
export type LiveTarget = { path: string; ticket?: "me" | { code: string } };

type Options = {
  /** Called with each event the server sends (parsed JSON). */
  onEvent: (event: { type: string;[key: string]: unknown }) => void;
  /** Called when a reconnect opens: something may have changed while the socket was down. */
  onReconnect?: () => void;
  /** Close codes after which the socket isn't reopened (the server says it's over); `onEnd` is called instead. */
  endCodes?: number[];
  onEnd?: (code: number) => void;
};

/**
 * A live-updates WebSocket to the API while `enabled` and the tab is visible: a hidden tab closes it, and showing the
 * tab again reopens it (with `onReconnect`, since changes may have been missed).
 *
 * Tickets are kept for the tab (src/api/liveTickets.ts) and reused until they expire. A socket that's refused before
 * it opens drops its ticket: a kept one is tried again later with a new ticket, but a refused new one isn't retried
 * until the tab is shown again or the network comes back. A socket that drops after opening (a deploy, a network blip)
 * reconnects with jittered backoff, from 1 s up to 30 s.
 */
export const useLiveSocket = (target: LiveTarget | null, enabled: boolean, options: Options) => {
  const { liveTicket } = useAppClient();

  // The latest, without reconnecting when they change identity.
  const latest = React.useRef({ liveTicket, options });
  latest.current = { liveTicket, options };

  const path = target?.path;
  const code = typeof target?.ticket === "object" ? target.ticket.code : undefined;
  const withTicket = Boolean(target?.ticket);

  React.useEffect(
    () => {
      if (!path || !enabled) {
        return;
      }
      const name = withTicket ? ticketName(code) : undefined;
      let socket: WebSocket | undefined;
      let connecting = false;
      let stopped = false;
      let attempts = 0;
      // Opened once already: later opens are reconnects, which may have missed changes.
      let openedBefore = false;
      let retry: ReturnType<typeof setTimeout> | undefined;
      let ping: ReturnType<typeof setInterval> | undefined;

      const visible = () => document.visibilityState === "visible";
      const idle = () => !stopped && !socket && !connecting && visible();

      const scheduleRetry = () => {
        const most = Math.min(MOST_RETRY_MS, FIRST_RETRY_MS * 2 ** attempts++);
        retry = setTimeout(connect, Math.max(FIRST_RETRY_MS, most * (0.5 + Math.random() / 2)));
      };

      /** The ticket to open the socket with (null: none needed), and whether it was just made. Undefined: none to be had. */
      async function ticketFor(name: string | undefined): Promise<{ ticket: string | null; fresh: boolean } | undefined> {
        if (!name) {
          return { ticket: null, fresh: false };
        }
        const kept = keptTicket(name);
        if (kept) {
          return { ticket: kept, fresh: false };
        }
        const ticket = await latest.current.liveTicket(code);
        if (!ticket) {
          return undefined;
        }
        keepTicket(name, ticket);
        return { ticket, fresh: true };
      }

      async function connect() {
        retry = undefined;
        if (!idle()) {
          return;
        }
        connecting = true;
        const got = await ticketFor(name);
        connecting = false;
        if (!idle()) {
          return;
        }
        if (!got) {
          // No session (signed out meanwhile), or the API couldn't be reached: try again later.
          scheduleRetry();
          return;
        }
        const { ticket, fresh } = got;
        const ws = new WebSocket(`${LIVE_ENDPOINT}${path}${ticket ? `?ticket=${encodeURIComponent(ticket)}` : ""}`);
        let opened = false;
        socket = ws;
        ws.onopen = () => {
          opened = true;
          attempts = 0;
          if (openedBefore) {
            latest.current.options.onReconnect?.();
          }
          openedBefore = true;
          ping = setInterval(() => ws.readyState === WebSocket.OPEN && ws.send("ping"), PING_MS);
        };
        ws.onmessage = event => {
          if (typeof event.data !== "string" || event.data === "pong") {
            return;
          }
          try {
            latest.current.options.onEvent(JSON.parse(event.data));
          } catch {
            // Not an event.
          }
        };
        ws.onclose = event => {
          clearInterval(ping);
          if (socket !== ws) {
            return; // closed here (hidden tab, unmount)
          }
          socket = undefined;
          if (!opened) {
            // Refused (or unreachable): the browser can't tell which, so the ticket goes either way.
            if (name) {
              dropTicket(name);
              if (fresh) {
                return;
              }
            }
            scheduleRetry();
            return;
          }
          if (latest.current.options.endCodes?.includes(event.code)) {
            latest.current.options.onEnd?.(event.code);
            return;
          }
          scheduleRetry();
        };
      }

      /** Hidden: close the socket. Shown again, or back online: reconnect now rather than at the end of the backoff. */
      const wake = () => {
        if (!visible()) {
          clearTimeout(retry);
          retry = undefined;
          const closing = socket;
          socket = undefined;
          closing?.close(1000);
          return;
        }
        if (idle()) {
          clearTimeout(retry);
          attempts = 0;
          connect();
        }
      };

      document.addEventListener("visibilitychange", wake);
      window.addEventListener("online", wake);
      connect();

      return () => {
        stopped = true;
        clearTimeout(retry);
        clearInterval(ping);
        const closing = socket;
        socket = undefined;
        closing?.close(1000);
        document.removeEventListener("visibilitychange", wake);
        window.removeEventListener("online", wake);
      };
    },
    [path, code, withTicket, enabled],
  );
};
