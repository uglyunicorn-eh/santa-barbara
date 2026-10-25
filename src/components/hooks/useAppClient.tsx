import { gql } from "@apollo/client";
import { useApolloClient, useMutation } from "@apollo/client/react";
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

export type UpdateNameInput = {
  name: string;
}

export type RequestEmailChangeInput = {
  email: string;
}

/** What a confirmation link did: ok, or the reason it didn't work. */
export type LinkResult<T = {}> =
  | ({ ok: true } & T)
  | { ok: false, message: string };

const USER_ERRORS = `
  status
  userErrors {
    fieldName
    messages
  }
`;

const REQUEST_ACCOUNT_DELETION = gql`
  mutation RequestAccountDeletion {
    profile {
      requestAccountDeletion {
        ${USER_ERRORS}
      }
    }
  }
`;

const CONFIRM_ACCOUNT_DELETION = gql`
  mutation ConfirmAccountDeletion($input: ConfirmAccountDeletionInput!) {
    profile {
      confirmAccountDeletion(input: $input) {
        ${USER_ERRORS}
      }
    }
  }
`;

const REQUEST_EMAIL_CHANGE = gql`
  mutation RequestEmailChange($input: RequestEmailChangeInput!) {
    profile {
      requestEmailChange(input: $input) {
        ${USER_ERRORS}
      }
    }
  }
`;

const CONFIRM_EMAIL_CHANGE = gql`
  mutation ConfirmEmailChange($input: ConfirmEmailChangeInput!) {
    profile {
      confirmEmailChange(input: $input) {
        ${USER_ERRORS}
        userToken
        user {
          id
          name
          email
        }
      }
    }
  }
`;

const LINK_FAILED = "Something went wrong on our side. Please try the link again in a few minutes.";

const PARTY_QUERY = gql`
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
`;

const PROFILE_QUERY = gql`
  query {
    user {
      id
      name
      email
    }
  }
`;

export const useAppClient = () => {
  const { error } = useNotifications();

  const client = useApolloClient();

  const [createPartyApi, { error: createPartyError }] = useMutation<any, { input: NewPartyInput }>(
    gql`
      mutation CreateParty($input: CreatePartyInput!) {
        parties {
          createParty(input: $input) {
            status
            userErrors {
              fieldName
              messages
            }
            node {
              id
              name
              code
              isJoined
              isHost
              isProtected
              isClosed
            }
          }
        }
      }
    `
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

  const [updateNameApi, { error: updateNameError }] = useMutation<any, { input: UpdateNameInput }>(
    gql`
      mutation UpdateName($input: UpdateNameInput!) {
        profile {
          updateName(input: $input) {
            status
            userErrors {
              fieldName
              messages
            }
            user {
              id
              name
              email
            }
          }
        }
      }
    `
  );

  React.useEffect(() => { createPartyError?.message && error(createPartyError?.message); }, [createPartyError?.message]);
  React.useEffect(() => { joinPartyError?.message && error(joinPartyError?.message); }, [joinPartyError?.message]);
  React.useEffect(() => { leavePartyError?.message && error(leavePartyError?.message); }, [leavePartyError?.message]);
  React.useEffect(() => { closePartyError?.message && error(closePartyError?.message); }, [closePartyError?.message]);
  React.useEffect(() => { enterRequestError?.message && error(enterRequestError?.message); }, [enterRequestError?.message]);
  React.useEffect(() => { updateNameError?.message && error(updateNameError?.message); }, [updateNameError?.message]);

  // These are called imperatively (on load, on submit), so they use client.query, which returns a plain promise.
  // null means "not found"; undefined means the request failed.
  const getParty = React.useCallback(
    async (code: string): Promise<Party | null | undefined> => {
      try {
        const { data } = await client.query<{ party: Party | null }, { code: string }>({
          query: PARTY_QUERY,
          variables: { code },
          fetchPolicy: "network-only",
        });
        return data?.party;
      } catch {
        return undefined;
      }
    },
    [
      client,
    ],
  );

  const getProfile = React.useCallback(
    async (): Promise<User | null | undefined> => {
      try {
        const { data } = await client.query<{ user: User | null }>({ query: PROFILE_QUERY, fetchPolicy: "network-only" });
        return data?.user;
      } catch {
        return undefined;
      }
    },
    [
      client,
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
    async ({ name, password }: NewPartyInput): Promise<Party | undefined> => {
      let result;
      try {
        const { data } = await createPartyApi({ variables: { input: { name, password: password || undefined } } });
        result = data?.parties.createParty;
      } catch {
        return undefined;
      }
      if (result?.status !== "ok") {
        // A request error (no session, network) is already shown by the createPartyError effect above.
        if (result) {
          error(result.userErrors?.[0]?.messages[0] ?? "Hm... we cannot create a new party. Please try again in a bit.");
        }
        return undefined;
      }
      // The new party belongs at the top of "my parties".
      client.refetchQueries({ include: "active" });
      return result.node;
    },
    [
      client,
      createPartyApi,
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

  const updateName = React.useCallback(
    async (input: UpdateNameInput): Promise<User | undefined> => {
      const { data } = await updateNameApi({ variables: { input } });
      const payload = data?.profile.updateName;
      if (payload?.status === "error") {
        error(payload.userErrors[0].messages[0]);
        return undefined;
      }
      return payload?.user ?? undefined;
    },
    [
      updateNameApi,
      error,
    ],
  );

  // The account and email mutations are called imperatively, so they go through the client directly. Request mutations
  // report problems as notifications; confirm mutations return them, for the link pages to show.
  const mutate = React.useCallback(
    async (mutation: any, variables?: any): Promise<any> => {
      try {
        const { data } = await client.mutate<any>({ mutation, variables });
        return data?.profile;
      } catch (e) {
        return { error: (e as Error).message };
      }
    },
    [
      client,
    ],
  );

  const requestAccountDeletion = React.useCallback(
    async (): Promise<boolean> => {
      const result = await mutate(REQUEST_ACCOUNT_DELETION);
      const payload = result?.requestAccountDeletion;
      if (payload?.status !== "ok") {
        error(payload?.userErrors?.[0]?.messages[0] ?? result?.error ?? LINK_FAILED);
        return false;
      }
      return true;
    },
    [
      mutate,
      error,
    ],
  );

  const requestEmailChange = React.useCallback(
    async (input: RequestEmailChangeInput): Promise<boolean> => {
      const result = await mutate(REQUEST_EMAIL_CHANGE, { input });
      const payload = result?.requestEmailChange;
      if (payload?.status !== "ok") {
        error(payload?.userErrors?.[0]?.messages[0] ?? result?.error ?? LINK_FAILED);
        return false;
      }
      return true;
    },
    [
      mutate,
      error,
    ],
  );

  const confirmAccountDeletion = React.useCallback(
    async (token: string): Promise<LinkResult> => {
      const payload = (await mutate(CONFIRM_ACCOUNT_DELETION, { input: { token } }))?.confirmAccountDeletion;
      return payload?.status === "ok"
        ? { ok: true }
        : { ok: false, message: payload?.userErrors?.[0]?.messages[0] ?? LINK_FAILED };
    },
    [
      mutate,
    ],
  );

  const confirmEmailChange = React.useCallback(
    async (token: string): Promise<LinkResult<{ user: User, userToken: string }>> => {
      const payload = (await mutate(CONFIRM_EMAIL_CHANGE, { input: { token } }))?.confirmEmailChange;
      return payload?.status === "ok" && payload.userToken && payload.user
        ? { ok: true, user: payload.user, userToken: payload.userToken }
        : { ok: false, message: payload?.userErrors?.[0]?.messages[0] ?? LINK_FAILED };
    },
    [
      mutate,
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
      updateName,
      requestAccountDeletion,
      confirmAccountDeletion,
      requestEmailChange,
      confirmEmailChange,
    }),
    [
      enterRequest,
      getParty,
      getProfile,
      createParty,
      joinParty,
      closeParty,
      leaveParty,
      updateName,
      requestAccountDeletion,
      confirmAccountDeletion,
      requestEmailChange,
      confirmEmailChange,
    ],
  );
};
