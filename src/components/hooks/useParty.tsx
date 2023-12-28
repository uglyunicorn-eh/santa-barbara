import React from "react";

import type { Party } from "src/types";

export const useParty = (code: string) => {
  const [party, setParty] = React.useState<Party | undefined | null>(undefined);

  React.useEffect(
    () => {
      const t = setTimeout(
        () => {
          setParty({
            id: "",
            code: code,
            name: 'Super duper fun party!',
            isJoined: true,
            isHost: true,
            isProtected: true,
            isClosed: false,
            participantCount: 2,
            participants: ['John', 'Jane'],
            target: {
              id: '234234234234',
              name: 'John',
            },
          });
        },
        1000,
      );

      return () => clearTimeout(t);
    },
    [
      code,
    ],
  );

  return ({
    party,
  });
};
