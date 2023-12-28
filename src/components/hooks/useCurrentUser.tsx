import React from "react";

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
  const { verify } = useJWT();

  const [userTokenValue, setUserTokenValue] = useLocalStorage<string>('userToken');
  const [userToken, setUserToken] = React.useState<UserToken>();
  const [profile, setProfile] = useLocalStorage<User>('profile');

  React.useEffect(
    () => {
      if (!userTokenValue) {
        setUserToken(undefined);
        return;
      }

      (async function () {
        try {
          setUserToken((await verify<UserToken>(userTokenValue)).payload);
        }
        catch {
          setUserToken(undefined);
        }
      })();
    },
    [
      userTokenValue,
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
    },
    [],
  );

  return React.useMemo(
    () => ({
      profile,
      userToken,
      signIn,
      signOut,
    }),
    [
      profile,
      userToken,
      signIn,
      signOut,
    ],
  );
};
