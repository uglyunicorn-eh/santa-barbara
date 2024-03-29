import { gql, useLazyQuery, useMutation } from "@apollo/client";
import React from "react";

import { useNotifications } from "src/components/hoc/NotificationsContainer";

import type { Party, User } from "src/types";

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
  name: string;
  password?: string;
}

export type LeavePartyInput = {
  party: string;
}

export type ClosePartyInput = {
  party: string;
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

  const [getProfileApi] = useLazyQuery(
    gql`
      query {
        user {
          id
          name
        }
      }
    `,
    {
      fetchPolicy: "cache-and-network",
    }
  );

  const [joinPartyApi, { error: joinPartyError }] = useMutation<any, { input: JoinPartyInput }>(
    gql`
      mutation JoinParty($input: JoinPartyInput!) {
        parties {
          joinParty(input: $input) {
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

  const [leavePartyApi, { error: leavePartyError }] = useMutation<any, { input: LeavePartyInput }>(
    gql`
      mutation Mutation($input: LeavePartyInput!) {
        parties {
          leaveParty(input: $input) {
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

  const [closePartyApi, { error: closePartyError }] = useMutation<any, { input: LeavePartyInput }>(
    gql`
      mutation Mutation($input: ClosePartyInput!) {
        parties {
          closeParty(input: $input) {
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

  const [enterRequestApi, { error: enterRequestError }] = useMutation<any, { input: EnterRequestInput }>(
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
  React.useEffect(() => { leavePartyError?.message && error(leavePartyError?.message); }, [leavePartyError?.message]);
  React.useEffect(() => { closePartyError?.message && error(closePartyError?.message); }, [closePartyError?.message]);
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

  const getProfile = React.useCallback(
    async (): Promise<User | undefined> => {
      const { data } = await getProfileApi();
      return data?.user;
    },
    [
      getProfileApi,
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

      error("Hm... we cannot create a new party. Please check the code and try again...");
      return undefined;
    },
    [
      error,
    ],
  );

  const joinParty = React.useCallback(
    async (input: JoinPartyInput): Promise<boolean> => {
      const { data } = await joinPartyApi({ variables: { input } });
      if (data?.parties.joinParty.status === "error") {
        error(data?.parties.joinParty.userErrors[0].messages[0]);
        return false;
      }
      return true;
    },
    [
      joinPartyApi,
      error,
    ],
  );

  const closeParty = React.useCallback(
    async (input: ClosePartyInput): Promise<boolean> => {
      const { data } = await closePartyApi({ variables: { input } });
      if (data?.parties.closeParty.status === "error") {
        error(data?.parties.closeParty.userErrors[0].messages[0]);
        return false;
      }
      return true;
    },
    [
      leavePartyApi,
      error,
    ],
  );

  const leaveParty = React.useCallback(
    async (input: LeavePartyInput): Promise<boolean> => {
      const { data } = await leavePartyApi({ variables: { input } });
      if (data?.parties.leaveParty.status === "error") {
        error(data?.parties.leaveParty.userErrors[0].messages[0]);
        return false;
      }
      return true;
    },
    [
      leavePartyApi,
      error,
    ],
  );

  return React.useMemo(
    () => ({
      enterRequest,
      getParty,
      getProfile,
      createParty,
      joinParty,
      closeParty,
      leaveParty,
    }),
    [
      enterRequest,
      getParty,
      getProfile,
      createParty,
      joinParty,
      closeParty,
      leaveParty,
    ],
  );
};
