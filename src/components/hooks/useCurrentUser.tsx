import React from "react";
import { useNavigate } from "react-router";

import { useAppClient, useJWT } from "src/components/hooks";
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
  const { getProfile } = useAppClient();

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

  React.useEffect(
    () => {
      if (userTokenValue && !userToken) {
        (async () => {
          const profile = await getProfile();
          if (profile) {
            setProfile(profile);
          }
        })();
      }
    },
    [
      userTokenValue,
      profile,
    ],
  );

  const signIn = React.useCallback(
    ({ profile, userToken }: SignInParams) => {
      setProfile(profile);
      setUserTokenValue(userToken);
    },
    [],
  );

  const signOut = React.useCallback(
    () => {
      setProfile(undefined);
      setUserTokenValue(undefined);
      navigate("/");
    },
    [
      navigate,
    ],
  );

  return React.useMemo(
    () => ({
      profile,
      userToken,
      userTokenValue,
      signIn,
      signOut,
    }),
    [
      profile,
      userToken,
      userTokenValue,
      signIn,
      signOut,
    ],
  );
};
