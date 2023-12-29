import React from "react";

import { useAppClient, useRefresher, useSignals } from "src/components/hooks";

import type { Party } from "src/types";

export const useParty = (code: string) => {
  const { refresher, refresh } = useRefresher();
  const [party, setParty] = React.useState<Party | undefined | null>(undefined);
  const { subscribe } = useSignals();

  const { getParty } = useAppClient();

  React.useEffect(
    () => {
      if (!code) {
        return;
      }

      (async () => {
        setParty(await getParty(code));
      })();
    },
    [
      code,
      getParty,
      refresher,
    ],
  );

  React.useEffect(
    () => subscribe('party:updated', refresh),
    [
      refresh,
      subscribe,
    ],
  );

  return ({
    party,
  });
};
