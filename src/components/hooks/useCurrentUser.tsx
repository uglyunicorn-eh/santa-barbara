import React from "react";

import { useLocalStorage } from "src/components/hooks/useLocalStorage";

type User = {
  id: string;
  name: string;
  email: string;
};

export const useCurrentUser = () => {
  const [userToken, setUserToken] = useLocalStorage<string>('userToken')

  const signIn = React.useCallback(
    (user: User) => {
      setUserToken(JSON.stringify(user));
    },
    [

    ],
  );

  const signOut = React.useCallback(
    () => {
      setUserToken(undefined);
    },
    [],
  );

  return React.useMemo(
    () => ({
      user: JSON.parse(userToken ?? 'null') as User | null,
      signIn,
      signOut,
    }),
    [
      userToken,
      signIn,
      signOut,
    ],
  );
};
