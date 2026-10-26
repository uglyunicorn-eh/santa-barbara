import React from "react";
import { useNavigate } from "react-router-dom";

import { forget, remind } from "@/components/hoc/NotificationsContainer";
import { useAppClient, type RolledParty } from "@/components/hooks/useAppClient";
import { useLiveSocket } from "@/components/hooks/useLiveSocket";

/** Reminders the user dismissed in this tab: not shown again until the tab is closed. */
const DISMISSED = "reveal-reminders-dismissed";

const dismissed = (): string[] => {
  try {
    return JSON.parse(sessionStorage.getItem(DISMISSED) ?? "[]");
  } catch {
    return [];
  }
};

const rememberDismissed = (code: string) => {
  try {
    sessionStorage.setItem(DISMISSED, JSON.stringify([...new Set([...dismissed(), code])]));
  } catch {
    // Without storage the reminder may come back on the next visit; fine.
  }
};

const reminderId = (code: string) => `rolled-${code}`;

/**
 * On the home screen: a reminder for every rolled party the user hasn't revealed their name in yet (on opening, and
 * live as parties roll), opening the "dice rolled" dialog. Revealing in any tab takes it away; dismissing it hides it in
 * this tab. Leaving the home screen takes the reminders away.
 */
export const useRevealReminders = () => {
  const { unrevealedParties } = useAppClient();
  const navigate = useNavigate();
  const shown = React.useRef(new Set<string>());

  const show = React.useCallback(
    (party: Pick<RolledParty, "code" | "name">) => {
      if (dismissed().includes(party.code)) {
        return;
      }
      shown.current.add(party.code);
      remind({
        id: reminderId(party.code),
        title: "🎲 The dice are rolled!",
        description: <>In <strong className="font-semibold text-current wrap-anywhere">{party.name}</strong>. Find out whom you give a gift to.</>,
        action: { label: "Open", onClick: () => navigate(`/rolled/${party.code}`, { state: { name: party.name } }) },
        onDismiss: () => rememberDismissed(party.code),
      });
    },
    [navigate],
  );

  const load = React.useCallback(
    async () => (await unrevealedParties()).forEach(show),
    [unrevealedParties, show],
  );

  React.useEffect(
    () => {
      load();
      const current = shown.current;
      return () => current.forEach(code => forget(reminderId(code)));
    },
    [load],
  );

  useLiveSocket("/v1/me/live", true, {
    onEvent: event => {
      if (event.type === "party.rolled" && typeof event.code === "string" && typeof event.name === "string") {
        show({ code: event.code, name: event.name });
      } else if (event.type === "party.revealed" && typeof event.code === "string") {
        forget(reminderId(event.code));
      }
    },
    onReconnect: load,
  });
};
