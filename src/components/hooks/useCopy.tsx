import React from "react";

import { useNotifications } from "@/components/hoc/NotificationsContainer";
import type { Party } from "@/types";

/**
 * Copies text to the clipboard and says so in an info toast; when the browser won't copy, an error toast shows the
 * text instead, so it can still be copied by hand.
 */
const useCopy = () => {
  const { info, error } = useNotifications();

  return React.useCallback(
    async (text: string, { copied, failed }: { copied: string; failed: string }) => {
      try {
        await navigator.clipboard.writeText(text);
        info(copied);
      } catch {
        error(failed);
      }
    },
    [info, error],
  );
};

/**
 * Copies the party's link. A party with a secret phrase still needs it, so the toast reminds the host to share that
 * too (it's never in the link).
 */
export const useCopyPartyLink = (party: Pick<Party, "code" | "isProtected">) => {
  const copy = useCopy();

  return React.useCallback(
    () => {
      const link = `${window.location.origin}/p/${party.code}/`;
      return copy(link, {
        copied: party.isProtected
          ? "Link copied! Your guests will also need the secret phrase: tell them yourself."
          : "Link copied! Share it with your friends.",
        failed: `We couldn't copy the link. Here it is: ${link}`,
      });
    },
    [copy, party.code, party.isProtected],
  );
};
