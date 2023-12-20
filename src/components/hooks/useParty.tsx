import React from "react";

import type { Party } from "src/types";

export const useParty = (code: string) => {
  const [party, setParty] = React.useState<Party | undefined | null>(undefined);

  React.useEffect(
    () => {
      const t = setTimeout(
        () => {
          setParty({
            code: code,
            name: 'Super duper fun party!',
            joined: false,
            host: false,
            protected: true,
            closed: true,
            participantCount: 2,
            participants: ['John', 'Jane'],
            target: {
              id: '234234234234',
              name: 'John',
            },
          });
        },
        4000,
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
