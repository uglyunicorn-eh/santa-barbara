import React from "react";

import { useNotifications } from "@/components/hoc/NotificationsContainer";
import type { Party } from "@/types";

/** The party's address, as people open it. */
export const partyLink = (code: string) => `${window.location.origin}/p/${code}/`;

/**
 * Copies the party's link and says so in a toast. A party with a secret phrase still needs it, so the toast reminds
 * the host to share that too (never in the link itself).
 */
export const useCopyPartyLink = (party: Pick<Party, "code" | "isProtected">) => {
  const { info, error } = useNotifications();

  return React.useCallback(
    async () => {
      try {
        await navigator.clipboard.writeText(partyLink(party.code));
        info(party.isProtected
          ? "Link copied! Your guests will also need the secret phrase: tell them yourself."
          : "Link copied! Share it with your friends.");
      } catch {
        error(`We couldn't copy the link. Here it is: ${partyLink(party.code)}`);
      }
    },
    [party.code, party.isProtected, info, error],
  );
};
