import React from "react";

import { useAppClient, type RolledParty } from "@/components/hooks/useAppClient";
import { useCurrentUser } from "@/components/hooks/useCurrentUser";
import { useLiveSocket } from "@/components/hooks/useLiveSocket";

// The rolled parties the user hasn't heard their name in yet, kept live for the whole app: loaded once signed in,
// then updated over the user's live socket (a party rolls, or the name is revealed in any tab) and right away when
// this tab reveals one. The footer's "My Profile" shows a dot while there are any; the home screen's reminders come
// from here too.

type Unrevealed = {
  /** Null until loaded (or signed out). */
  parties: RolledParty[] | null;
  /** This tab revealed the name in this party. */
  revealed: (code: string) => void;
};

const UnrevealedContext = React.createContext<Unrevealed>({ parties: null, revealed: () => undefined });

export const UnrevealedProvider = ({ children }: { children: React.ReactNode }) => {
  const { profile } = useCurrentUser();
  const { unrevealedParties } = useAppClient();
  const [parties, setParties] = React.useState<RolledParty[] | null>(null);
  const signedIn = Boolean(profile);

  const load = React.useCallback(
    async () => setParties(await unrevealedParties()),
    [unrevealedParties],
  );

  React.useEffect(
    () => {
      if (signedIn) {
        load();
      } else {
        setParties(null);
      }
    },
    [signedIn, load],
  );

  const revealed = React.useCallback(
    (code: string) => setParties(current => current && current.filter(party => party.code !== code)),
    [],
  );

  useLiveSocket("/v1/me/live", signedIn, {
    onEvent: event => {
      if (event.type === "party.rolled" && typeof event.code === "string" && typeof event.name === "string") {
        const party = { code: event.code, name: event.name, closedAt: new Date().toISOString() };
        setParties(current => [...(current ?? []).filter(p => p.code !== party.code), party]);
      } else if (event.type === "party.revealed" && typeof event.code === "string") {
        revealed(event.code);
      }
    },
    onReconnect: load,
  });

  const value = React.useMemo(() => ({ parties, revealed }), [parties, revealed]);
  return <UnrevealedContext.Provider value={value}>{children}</UnrevealedContext.Provider>;
};

export const useUnrevealed = () => React.useContext(UnrevealedContext);
