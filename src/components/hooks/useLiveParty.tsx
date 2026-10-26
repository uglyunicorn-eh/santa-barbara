import { useLiveSocket } from "@/components/hooks/useLiveSocket";
import { useSignals } from "@/components/hooks/useSignals";

/** Close codes from the party: the user left it (or their account is gone), or the party is gone for them. */
const LEFT = 4403;
const GONE = 4410;

/**
 * Watches a party live while `enabled` (the user is in it, or hosts it): every change the party reports refreshes the
 * page (the "party:updated" signal), and so does every reconnect. A party that says the user left or it's gone gets
 * one last refresh, and no reconnect.
 */
export const useLiveParty = (code: string | undefined, enabled: boolean) => {
  const { signal } = useSignals();
  const refresh = () => signal("party:updated");

  useLiveSocket(code ? `/v1/parties/live?code=${encodeURIComponent(code)}` : null, enabled, {
    onEvent: event => event.type === "party.changed" && refresh(),
    onReconnect: refresh,
    endCodes: [LEFT, GONE],
    onEnd: refresh,
  });
};
