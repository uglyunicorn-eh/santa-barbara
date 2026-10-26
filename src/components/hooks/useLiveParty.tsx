import React from "react";

import { API_ENDPOINT } from "@/api/client";
import { useAppClient } from "@/components/hooks/useAppClient";
import { useSignals } from "@/components/hooks/useSignals";

/** The API's live-updates address: its own host, over wss (ws for a local http preview). */
const LIVE_ENDPOINT = API_ENDPOINT.replace(/^http/, "ws");

/** Close codes from the party: the user left it (or their account is gone), or the party is gone for them. */
const LEFT = 4403;
const GONE = 4410;

/** Keep-alive interval. The API answers "ping" without waking the party. */
const PING_MS = 30_000;

/**
 * Watches a party live while `enabled` (the user is in it, or hosts it): every change the party reports refreshes
 * the page (the "party:updated" signal), and so does every reconnect, in case something changed meanwhile. Reconnects
 * with backoff (1 s to 30 s), and at once when the tab is shown again or the network comes back; deploys drop every
 * socket, so reconnecting is routine. A party that says the user left or it's gone gets one last refresh, and no
 * reconnect.
 */
export const useLiveParty = (code: string | undefined, enabled: boolean) => {
  const { liveTicket } = useAppClient();
  const { signal } = useSignals();

  // The latest, without reconnecting when they change identity.
  const latest = React.useRef({ liveTicket, signal });
  latest.current = { liveTicket, signal };

  React.useEffect(
    () => {
      if (!code || !enabled) {
        return;
      }
      let socket: WebSocket | undefined;
      let stopped = false;
      let attempts = 0;
      let opened = false;
      let retry: ReturnType<typeof setTimeout> | undefined;
      let ping: ReturnType<typeof setInterval> | undefined;
      const refresh = () => latest.current.signal("party:updated");

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
        const ws = new WebSocket(`${LIVE_ENDPOINT}/v1/parties/live?code=${encodeURIComponent(code!)}&ticket=${encodeURIComponent(ticket)}`);
        socket = ws;
        ws.onopen = () => {
          attempts = 0;
          // The first connection follows the page's own load; a reconnect may have missed changes.
          if (opened) {
            refresh();
          }
          opened = true;
          ping = setInterval(() => ws.readyState === WebSocket.OPEN && ws.send("ping"), PING_MS);
        };
        ws.onmessage = event => {
          if (typeof event.data === "string" && event.data.includes('"party.changed"')) {
            refresh();
          }
        };
        ws.onclose = event => {
          clearInterval(ping);
          if (stopped || socket !== ws) {
            return;
          }
          socket = undefined;
          if (event.code === LEFT || event.code === GONE) {
            refresh();
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
    [code, enabled],
  );
};
