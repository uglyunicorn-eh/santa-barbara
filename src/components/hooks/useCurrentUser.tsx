import React from "react";
import { useNavigate } from "react-router";

import { dropAllTickets } from "@/api/liveTickets";
import { useLocalStorage } from "@/components/hooks/useLocalStorage";
import type { User } from "@/types";

type SignInParams = {
  profile: User;
  userToken: string;
};

/**
 * The person signed in here. The session token is opaque (the API encrypts it), so signed in simply means a token is
 * stored; the API answers 401 once it no longer works, and the app signs out then. Who it is comes from the stored
 * profile (`profile.id`), never from the token.
 */
export const useCurrentUser = () => {
  const [userTokenValue, setUserTokenValue] = useLocalStorage<string>('userToken');
  const [storedProfile, setProfile] = useLocalStorage<User>('profile');
  const navigate = useNavigate();
  const profile = userTokenValue ? storedProfile : undefined;

  const signIn = React.useCallback(
    ({ profile, userToken }: SignInParams) => {
      dropAllTickets();
      setProfile(profile);
      setUserTokenValue(userToken);
    },
    [],
  );

  /** Replaces the cached profile, e.g. after it was edited or reloaded from the API. */
  const updateProfile = React.useCallback(
    (profile: User) => {
      setProfile(profile);
    },
    [],
  );

  const resetCredentials = React.useCallback(
    () => {
      dropAllTickets();
      setProfile(undefined);
      setUserTokenValue(undefined);
    },
    [],
  );

  const signOut = React.useCallback(
    () => {
      resetCredentials();
      navigate("/");
    },
    [
      navigate,
      resetCredentials,
    ],
  );

  return React.useMemo(
    () => ({
      profile,
      userTokenValue,
      signIn,
      signOut,
      updateProfile,
      resetCredentials,
    }),
    [
      profile,
      userTokenValue,
      signIn,
      signOut,
      updateProfile,
      resetCredentials,
    ],
  );
};
