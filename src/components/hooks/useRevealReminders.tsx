import React from "react";
import { useNavigate } from "react-router-dom";

import { forget, remind } from "@/components/hoc/NotificationsContainer";
import { useUnrevealed } from "@/components/hooks/useUnrevealed";

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
 * On the home screen: a reminder for every rolled party the user hasn't revealed their name in yet (as loaded, and live
 * as parties roll: useUnrevealed), opening the "dice rolled" dialog. Revealing in any tab takes it away; dismissing it
 * hides it in this tab. Leaving the home screen takes the reminders away.
 */
export const useRevealReminders = () => {
  const { parties } = useUnrevealed();
  const navigate = useNavigate();
  const shown = React.useRef(new Set<string>());

  React.useEffect(
    () => {
      const current = new Set((parties ?? []).map(party => party.code));
      // Revealed (here or in another tab) since it was shown.
      for (const code of shown.current) {
        if (!current.has(code)) {
          shown.current.delete(code);
          forget(reminderId(code));
        }
      }
      for (const party of parties ?? []) {
        if (shown.current.has(party.code) || dismissed().includes(party.code)) {
          continue;
        }
        shown.current.add(party.code);
        remind({
          id: reminderId(party.code),
          icon: "🎲",
          title: "The dice are rolled!",
          description: <>In <strong className="font-semibold text-current wrap-anywhere">{party.name}</strong>. Find out whom you give a gift to.</>,
          action: { label: "Open", onClick: () => navigate(`/rolled/${party.code}`, { state: { name: party.name } }) },
          onDismiss: () => rememberDismissed(party.code),
        });
      }
    },
    [parties, navigate],
  );

  // Leaving the home screen takes them away.
  React.useEffect(
    () => {
      const current = shown.current;
      return () => {
        current.forEach(code => forget(reminderId(code)));
        current.clear();
      };
    },
    [],
  );
};
