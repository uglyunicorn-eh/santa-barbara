import React from "react";

import type { Party } from "src/types";

export const useParty = (code: string) => {
  const [party, setParty] = React.useState<Party | undefined | null>(undefined);

  React.useEffect(
    () => {
      const t = setTimeout(
        () => {
          setParty({
            id: "23423423sadfa",
            code: code,
            name: 'Super duper fun party!',
            joined: false,
            host: false,
            protected: true,
            closed: false,
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
