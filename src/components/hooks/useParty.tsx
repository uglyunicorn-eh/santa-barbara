import { gql, useQuery } from "@apollo/client";
import React from "react";

import type { Party } from "src/types";

export const useParty = (code: string) => {
  const [party, setParty] = React.useState<Party | undefined | null>(undefined);

  const { data } = useQuery(gql`
    query ($code: String!) {
      party(code: $code) {
        id
        name
        code
        isJoined
        isHost
        isProtected
        isClosed
        participantCount
        participants
        target {
          name
        }
      }
    }
  `, {
    variables: {
      code,
    },
    fetchPolicy: "cache-and-network",
  });

  React.useEffect(
    () => {
      if (data) {
        setParty(data.party);
      }
    },
    [
      data?.party,
    ],
  );

  return ({
    party,
  });
};
