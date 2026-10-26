import React from "react";

import { API_ENDPOINT } from "@/api/client";
import { useAppClient } from "@/components/hooks/useAppClient";

/** The API's live-updates address: its own host, over wss (ws for a local http preview). */
const LIVE_ENDPOINT = API_ENDPOINT.replace(/^http/, "ws");

/** Keep-alive interval. The API answers "ping" without waking anything. */
const PING_MS = 30_000;

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
 * A live-updates WebSocket to the API (`path`, e.g. "/v1/parties/live?code=…") while `enabled`: trades the session for
 * a ticket, connects, and passes on what the server sends. Reconnects with backoff (1 s to 30 s), and at once when the
 * tab is shown again or the network comes back (deploys drop every socket, so reconnecting is routine).
 */
export const useLiveSocket = (path: string | null, enabled: boolean, options: Options) => {
  const { liveTicket } = useAppClient();

  // The latest, without reconnecting when they change identity.
  const latest = React.useRef({ liveTicket, options });
  latest.current = { liveTicket, options };

  React.useEffect(
    () => {
      if (!path || !enabled) {
        return;
      }
      let socket: WebSocket | undefined;
      let stopped = false;
      let attempts = 0;
      let opened = false;
      let retry: ReturnType<typeof setTimeout> | undefined;
      let ping: ReturnType<typeof setInterval> | undefined;

      const scheduleRetry = () => {
        const delay = Math.min(30_000, 1000 * 2 ** attempts++) * (0.5 + Math.random() / 2);
        retry = setTimeout(connect, delay);
      };

      async function connect() {
        retry = undefined;
        const ticket = await latest.current.liveTicket();
        if (stopped) {
          return;
        }
        if (!ticket) {
          scheduleRetry();
          return;
        }
        const separator = path!.includes("?") ? "&" : "?";
        const ws = new WebSocket(`${LIVE_ENDPOINT}${path}${separator}ticket=${encodeURIComponent(ticket)}`);
        socket = ws;
        ws.onopen = () => {
          attempts = 0;
          // The first connection follows the page's own load; a reconnect may have missed changes.
          if (opened) {
            latest.current.options.onReconnect?.();
          }
          opened = true;
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
          if (stopped || socket !== ws) {
            return;
          }
          socket = undefined;
          if (latest.current.options.endCodes?.includes(event.code)) {
            latest.current.options.onEnd?.(event.code);
            return;
          }
          scheduleRetry();
        };
      }

      /** Back to the tab, or back online: reconnect now rather than at the end of the backoff. */
      const wake = () => {
        if (document.visibilityState === "visible" && !socket && retry) {
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
        socket?.close(1000);
        document.removeEventListener("visibilitychange", wake);
        window.removeEventListener("online", wake);
      };
    },
    [path, enabled],
  );
};
