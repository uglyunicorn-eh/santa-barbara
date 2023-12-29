import React from "react";
import { useNavigate } from "react-router";

import { useJWT } from "src/components/hooks";
import { useLocalStorage } from "src/components/hooks/useLocalStorage";

type User = {
  id: string;
  name: string;
};

type SignInParams = {
  profile: User;
  userToken: string;
};

type UserToken = {
  sub: string;
}

export const useCurrentUser = () => {
  const { verify, isReady } = useJWT();

  const [userTokenValue, setUserTokenValue] = useLocalStorage<string>('userToken');
  const [userToken, setUserToken] = React.useState<UserToken>();
  const [profile, setProfile] = useLocalStorage<User>('profile');
  const navigate = useNavigate();

  React.useEffect(
    () => {
      if (!isReady) {
        return;
      }

      if (!userTokenValue) {
        setUserToken(undefined);
        return;
      }

      (async function () {
        try {
          setUserToken((await verify<UserToken>(userTokenValue)).payload);
        }
        catch (e) {
          setUserToken(undefined);
        }
      })();
    },
    [
      userTokenValue,
      isReady,
    ],
  );

  const signIn = React.useCallback(
    ({ profile, userToken }: SignInParams) => {
      setProfile(profile);
      setUserTokenValue(userToken);
    },
    [],
  );

  const resetCredentials = React.useCallback(
    () => {
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
      userToken,
      userTokenValue,
      signIn,
      signOut,
      resetCredentials,
    }),
    [
      profile,
      userToken,
      userTokenValue,
      signIn,
      signOut,
      resetCredentials,
    ],
  );
};
