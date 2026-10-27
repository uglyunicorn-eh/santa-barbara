import React from "react";

import { apiCall } from "@/api/client";
import { PartyOMeterView } from "@/components/Odometer";
import { useLiveSocket } from "@/components/hooks/useLiveSocket";

// The Party'o'meter: how many parties have rolled their dice, ever, on an odometer whose digit wheels roll to each new
// count (Odometer.tsx). The first count comes from GET /v1/stats (cached by the API); then a public socket sends every
// new one.

const STATS_LIVE = { path: "/v1/stats/live" };

/** The count, null until known (or when the API can't say). */
const useRolled = () => {
  const [rolled, setRolled] = React.useState<number | null>(null);

  React.useEffect(
    () => {
      let gone = false;
      apiCall<{ rolled: number }>("/stats", { retry: true }).then(result => {
        // The socket's count, if it came first, is the newer one.
        if (!gone && result.ok && Number.isSafeInteger(result.data.rolled)) {
          setRolled(current => current ?? result.data.rolled);
        }
      });
      return () => {
        gone = true;
      };
    },
    [],
  );

  useLiveSocket(STATS_LIVE, true, {
    onEvent: event => {
      if (event.type === "stats" && Number.isSafeInteger(event.rolled)) {
        setRolled(event.rolled as number);
      }
    },
  });

  return rolled;
};

/** The Party'o'meter on the front door, with the live count. */
export const PartyOMeter = () => <PartyOMeterView rolled={useRolled()} />;
