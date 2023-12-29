import { gql, useLazyQuery, useMutation } from "@apollo/client";
import React from "react";

import { useNotifications } from "src/components/hoc/NotificationsContainer";
import type { Party } from "src/types";

export type EnterRequestInput = {
  email: string;
  party?: string;
}

export type NewPartyInput = {
  name: string;
  password?: string;
}

export type JoinPartyInput = {
  party: string;
  password?: string;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const useAppClient = () => {
  const { error } = useNotifications();

  const [getPartyApi] = useLazyQuery(
    gql`
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
    `,
    {
      fetchPolicy: "cache-and-network",
    }
  );

  const [joinPartyApi, { error: joinPartyError }] = useMutation<{ party: Party }, { input: JoinPartyInput }>(
    gql`
      mutation JoinParty($code: String!) {
        parties {
          joinParty(input: $input) {
            node {
              code
            }
          }
        }
      }
    `
  );

  const [enterRequestApi, { error: enterRequestError }] = useMutation(
    gql`
      mutation EnterRequest($input: EnterRequestInput!) {
        auth {
          enterRequest(input: $input) {
            status
            userErrors {
              fieldName
              messages
            }
          }
        }
      }
    `
  );

  React.useEffect(() => { joinPartyError?.message && error(joinPartyError?.message); }, [joinPartyError?.message]);
  React.useEffect(() => { enterRequestError?.message && error(enterRequestError?.message); }, [enterRequestError?.message]);

  const getParty = React.useCallback(
    async (code: string): Promise<Party | undefined> => {
      const { data } = await getPartyApi({ variables: { code } });
      return data?.party;
    },
    [
      getPartyApi,
    ],
  );

  const enterRequest = React.useCallback(
    async (input: EnterRequestInput): Promise<boolean> => {
      const { data } = await enterRequestApi({ variables: { input } });
      return data?.auth.enterRequest.status === "ok";
    },
    [
      error,
    ],
  );

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
        isJoined: true,
        isHost: true,
        isProtected: Boolean(data.password),
        isClosed: false,
        participantCount: 1,
        participants: ['Fred'],
      };
    },
    [
      error,
    ],
  );

  const joinParty = React.useCallback(
    async (input: JoinPartyInput): Promise<boolean> => {
      const { data } = await joinPartyApi({ variables: { input } });
      console.log({ data });
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
      enterRequest,
      getParty,
      createParty,
      joinParty,
      closeParty,
      leaveParty,
    }),
    [
      enterRequest,
      getParty,
      createParty,
      joinParty,
      closeParty,
      leaveParty,
    ],
  );
};
