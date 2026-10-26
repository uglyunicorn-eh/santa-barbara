import React from "react";

import { apiCall, linkKey } from "@/api/client";
import type { ApiResult, CallOptions } from "@/api/client";
import { useNotifications } from "@/components/hoc/NotificationsContainer";
import { useCurrentUser } from "@/components/hooks/useCurrentUser";
import { useSignals } from "@/components/hooks/useSignals";

import type { Party, User } from "@/types";

export type EnterRequestInput = {
  email: string;
  party?: string;
}

export type NewPartyInput = {
  name: string;
  password?: string;
  /** Lets the API treat a repeated request as the same one, so a retry never makes a second party. */
  requestId?: string;
}

/** `party` is the party's code. */
export type JoinPartyInput = {
  party: string;
  name: string;
  password?: string;
}

/** `party` is the party's code. */
export type PartyActionInput = {
  party: string;
}

export type LeavePartyInput = PartyActionInput;
export type ClosePartyInput = PartyActionInput;
export type DeletePartyInput = PartyActionInput;

export type UpdateNameInput = {
  name: string;
}

export type RequestEmailChangeInput = {
  email: string;
  /** Repeats with the same id (and address) send no second email. */
  requestId?: string;
}

/** What a confirmation link did: ok, or the reason it didn't work. */
/** A rolled party waiting for the user to reveal whom they give a gift to. */
export type RolledParty = { code: string; name: string; closedAt: string };

/** What happened to each address in an invite (as typed). */
export type InviteResult = { invited: string[]; alreadyInvited: string[]; alreadyJoined: string[]; invitesLeft: number };

export type LinkResult<T = {}> =
  | ({ ok: true } & T)
  | { ok: false, message: string };

export type Session = { user: User, userToken: string };

/** Signal sent when the person's party list may have changed, so lists showing it load again. */
export const PARTIES_CHANGED = "parties:changed";

const LINK_FAILED = "Something went wrong on our side. Please try the link again in a few minutes.";

/**
 * A party code lets anyone into a party without a secret phrase, and request logs record URLs, so it never goes in a
 * path: writes send it in the JSON body, and viewing a party sends it as `?code=`, which the API's logs leave out.
 */
const partyQuery = (code: string) => `/parties?code=${encodeURIComponent(code)}`;

export const useAppClient = () => {
  const { error } = useNotifications();
  const { userTokenValue, signOut } = useCurrentUser();
  const { signal } = useSignals();

  /** Calls the API with the session. A 401 means the session is gone (expired, revoked): sign out. */
  const call = React.useCallback(
    async function <T>(route: string, options: CallOptions = {}): Promise<ApiResult<T>> {
      const result = await apiCall<T>(route, { token: userTokenValue, ...options });
      if (!result.ok && result.error.status === 401 && userTokenValue) {
        signOut();
      }
      return result;
    },
    [
      userTokenValue,
      signOut,
    ],
  );

  /** Rolled parties the user hasn't revealed their name in yet (the home screen reminds them), or [] on failure. */
  const unrevealedParties = React.useCallback(
    async (): Promise<RolledParty[]> => {
      const result = await call<{ items: RolledParty[] }>("/me/parties/unrevealed", { retry: true });
      return result.ok ? result.data.items : [];
    },
    [call],
  );

  /** Records that the user revealed their name in a rolled party. Quiet: nothing to tell the user if it fails. */
  const markRevealed = React.useCallback(
    async (code: string) => {
      await call("/me/parties/revealed", { method: "POST", body: { code }, retry: true });
    },
    [call],
  );

  /** A one-minute ticket for opening a live-updates socket (see useLiveParty), or null without a working session. */
  const liveTicket = React.useCallback(
    async (): Promise<string | null> => {
      const result = await call<{ ticket: string }>("/live/ticket", { method: "POST" });
      return result.ok ? result.data.ticket : null;
    },
    [call],
  );

  /** Runs a party action; shows the API's message and returns undefined when it refuses. */
  const partyAction = React.useCallback(
    async (route: string, options: CallOptions): Promise<Party | undefined> => {
      const result = await call<Party>(route, { retry: true, ...options });
      if (!result.ok) {
        error(result.error.message);
        return undefined;
      }
      signal(PARTIES_CHANGED);
      return result.data;
    },
    [
      call,
      error,
      signal,
    ],
  );

  /** null means "not found"; undefined means the request failed. */
  const getParty = React.useCallback(
    async (code: string): Promise<Party | null | undefined> => {
      const result = await call<Party>(partyQuery(code), { retry: true });
      if (result.ok) {
        return result.data;
      }
      return result.error.status === 404 ? null : undefined;
    },
    [
      call,
    ],
  );

  /** null means "no session" (or a revoked one); undefined means the request failed. */
  const getProfile = React.useCallback(
    async (): Promise<User | null | undefined> => {
      if (!userTokenValue) {
        return null;
      }
      const result = await apiCall<User>("/me", { token: userTokenValue, retry: true });
      if (result.ok) {
        return result.data;
      }
      return result.error.status === 401 ? null : undefined;
    },
    [
      userTokenValue,
    ],
  );

  /** Emails a magic link. `key` makes repeats of one form's submission send one email. */
  const enterRequest = React.useCallback(
    async (input: EnterRequestInput, key?: string): Promise<boolean> => {
      const result = await apiCall("/auth/magic-link", { method: "POST", body: input, key, retry: Boolean(key) });
      return result.ok;
    },
    [],
  );

  /** Signs in with a magic link. Repeating it from this tab (say, after a reload) signs in again. */
  const enter = React.useCallback(
    async (token: string): Promise<LinkResult<Session>> => {
      const result = await apiCall<Session>("/auth/session", { method: "POST", body: { token }, key: linkKey(token), retry: true });
      return result.ok ? { ok: true, ...result.data } : { ok: false, message: result.error.message };
    },
    [],
  );

  const createParty = React.useCallback(
    async ({ name, password, requestId }: NewPartyInput): Promise<Party | undefined> =>
      partyAction("/parties", { method: "POST", body: { name, ...(password ? { password } : {}) }, key: requestId, retry: Boolean(requestId) }),
    [
      partyAction,
    ],
  );

  const joinParty = React.useCallback(
    async ({ party, name, password }: JoinPartyInput): Promise<boolean> =>
      Boolean(await partyAction("/parties/join", { method: "POST", body: { code: party, name, ...(password ? { password } : {}) } })),
    [
      partyAction,
    ],
  );

  const leaveParty = React.useCallback(
    async ({ party }: LeavePartyInput): Promise<boolean> => Boolean(await partyAction("/parties/leave", { method: "POST", body: { code: party } })),
    [
      partyAction,
    ],
  );

  const closeParty = React.useCallback(
    async ({ party }: ClosePartyInput): Promise<boolean> => Boolean(await partyAction("/parties/draw", { method: "POST", body: { code: party } })),
    [
      partyAction,
    ],
  );

  const deleteParty = React.useCallback(
    async ({ party }: DeletePartyInput): Promise<boolean> => Boolean(await partyAction("/parties/delete", { method: "POST", body: { code: party } })),
    [
      partyAction,
    ],
  );

  const restoreParty = React.useCallback(
    async ({ party }: DeletePartyInput): Promise<boolean> => Boolean(await partyAction("/parties/restore", { method: "POST", body: { code: party } })),
    [
      partyAction,
    ],
  );

  /** One page of the person's parties, newest first; null when it couldn't be loaded. */
  const getPartyHistory = React.useCallback(
    async (first: number, after?: string | null) => {
      const query = new URLSearchParams({ first: String(first), ...(after ? { after } : {}) });
      const result = await call<{ items: Party[], hasMore: boolean, endCursor: string | null }>(`/me/parties?${query}`, { retry: true });
      return result.ok ? result.data : null;
    },
    [
      call,
    ],
  );

  const updateName = React.useCallback(
    async ({ name }: UpdateNameInput): Promise<User | undefined> => {
      const result = await call<User>("/me", { method: "PATCH", body: { name }, retry: true });
      if (!result.ok) {
        error(result.error.message);
        return undefined;
      }
      return result.data;
    },
    [
      call,
      error,
    ],
  );

  // Request routes report problems as notifications; confirm routes return them, for the link pages to show.

  /** Repeats with the same `requestId` send no second email. */
  const requestAccountDeletion = React.useCallback(
    async (requestId?: string): Promise<boolean> => {
      const result = await call("/me/deletion", { method: "POST", key: requestId, retry: Boolean(requestId) });
      if (!result.ok) {
        error(result.error.message);
      }
      return result.ok;
    },
    [
      call,
      error,
    ],
  );

  const requestEmailChange = React.useCallback(
    async ({ email, requestId }: RequestEmailChangeInput): Promise<boolean> => {
      const result = await call("/me/email-change", { method: "POST", body: { email }, key: requestId, retry: Boolean(requestId) });
      if (!result.ok) {
        error(result.error.message);
      }
      return result.ok;
    },
    [
      call,
      error,
    ],
  );

  /** Emails invites to the party (host only). Undefined, after an error toast, when it failed. */
  const inviteToParty = React.useCallback(
    async ({ code, emails, requestId }: { code: string; emails: string[]; requestId: string }): Promise<InviteResult | undefined> => {
      const result = await call<InviteResult>("/parties/invite", { method: "POST", body: { code, emails }, key: requestId, retry: true });
      if (!result.ok) {
        error(result.error.message);
        return undefined;
      }
      return result.data;
    },
    [
      call,
      error,
    ],
  );

  /** Which account a deletion link is for, or why it no longer works. Uses nothing up. */
  const checkAccountDeletion = React.useCallback(
    async (token: string): Promise<LinkResult<{ email: string }>> => {
      const result = await apiCall<{ email: string }>("/me/deletion/check", { method: "POST", body: { token }, retry: true });
      return result.ok ? { ok: true, email: result.data.email } : { ok: false, message: result.error.message || LINK_FAILED };
    },
    [],
  );

  const confirmAccountDeletion = React.useCallback(
    async (token: string): Promise<LinkResult> => {
      const result = await apiCall("/me/deletion/confirm", { method: "POST", body: { token }, key: linkKey(token), retry: true });
      return result.ok ? { ok: true } : { ok: false, message: result.error.message || LINK_FAILED };
    },
    [],
  );

  const confirmEmailChange = React.useCallback(
    async (token: string): Promise<LinkResult<Session>> => {
      const result = await apiCall<Session>("/me/email-change/confirm", { method: "POST", body: { token }, key: linkKey(token), retry: true });
      return result.ok ? { ok: true, ...result.data } : { ok: false, message: result.error.message || LINK_FAILED };
    },
    [],
  );

  /** "This wasn't me", from the notice about an email change: stops it and signs out everywhere. */
  const cancelEmailChange = React.useCallback(
    async (token: string): Promise<LinkResult> => {
      const result = await apiCall("/me/email-change/cancel", { method: "POST", body: { token }, key: linkKey(token), retry: true });
      return result.ok ? { ok: true } : { ok: false, message: result.error.message || LINK_FAILED };
    },
    [],
  );

  return React.useMemo(
    () => ({
      enterRequest,
      enter,
      getParty,
      getProfile,
      getPartyHistory,
      createParty,
      joinParty,
      closeParty,
      deleteParty,
      restoreParty,
      leaveParty,
      updateName,
      requestAccountDeletion,
      liveTicket,
      unrevealedParties,
      markRevealed,
      inviteToParty,
      checkAccountDeletion,
      confirmAccountDeletion,
      requestEmailChange,
      confirmEmailChange,
      cancelEmailChange,
    }),
    [
      enterRequest,
      enter,
      getParty,
      getProfile,
      getPartyHistory,
      createParty,
      joinParty,
      closeParty,
      deleteParty,
      restoreParty,
      leaveParty,
      updateName,
      requestAccountDeletion,
      liveTicket,
      unrevealedParties,
      markRevealed,
      inviteToParty,
      checkAccountDeletion,
      confirmAccountDeletion,
      requestEmailChange,
      confirmEmailChange,
      cancelEmailChange,
    ],
  );
};
