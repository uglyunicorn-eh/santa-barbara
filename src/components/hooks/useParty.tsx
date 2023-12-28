import { gql, useQuery } from "@apollo/client";
import React from "react";
import { useAppClient } from "src/components/hooks";

import type { Party } from "src/types";

export const useParty = (code: string) => {
  const [party, setParty] = React.useState<Party | undefined | null>(undefined);

  const { getParty } = useAppClient();

  React.useEffect(
    () => {
      if (!code) {
        return;
      }

      (async () => {
        const party = await getParty(code);
        setParty(party);
      })();
    },
    [
      code,
      getParty,
    ],
  );

  return ({
    party,
  });
};
