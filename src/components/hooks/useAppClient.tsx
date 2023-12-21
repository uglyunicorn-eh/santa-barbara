import React from "react";

import { useNotifications } from "src/components/hoc/NotificationsContainer";
import type { Party } from "src/types";

type NewPartyInput = {
  name: string;
  password?: string;
}

type JoinPartyInput = {
  code: string;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const useAppClient = () => {
  const { error } = useNotifications();

  const createParty = React.useCallback(
    async (data: NewPartyInput): Promise<Party | undefined> => {
      console.log("API createParty", { data });
      await sleep(500);

      if (data.password === '1') {
        error("Hm... we cannot create a new party. Please check the code and try again...");
        return undefined;
      }

      return {
        code: 'XCERTS',
        name: 'Super duper fun party!',
        joined: true,
        host: true,
        protected: Boolean(data.password),
        closed: false,
        participantCount: 1,
        participants: ['Fred'],
      };
    },
    [
      error,
    ],
  );

  const joinParty = React.useCallback(
    async (data: JoinPartyInput): Promise<boolean> => {
      console.log("API joinParty", { data });
      await sleep(500);
      error("Hm... we cannot find any party for the code. Please check the code and try again...");
      return false;
    },
    [
      error,
    ],
  );

  const closeParty = React.useCallback(
    async (code: string): Promise<boolean> => {
      console.log("API closeParty", { code });
      await sleep(500);
      error("Hm... we cannot this party. Please check the code and try again...");
      return false;
    },
    [
      error,
    ],
  );

  const leaveParty = React.useCallback(
    async (code: string): Promise<boolean> => {
      console.log("API leaveParty", { code });
      await sleep(500);
      error("Hm... you cannot leave this party. Please check the code and try again...");
      return false;
    },
    [
      error,
    ],
  );

  return React.useMemo(
    () => ({
      createParty,
      joinParty,
      closeParty,
      leaveParty,
    }),
    [
      createParty,
      joinParty,
      closeParty,
      leaveParty,
    ],
  );
};
