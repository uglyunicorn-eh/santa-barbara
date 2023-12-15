import React from "react";

type User = {
  id: string;
  name: string;
  email: string;
};

export const useCurrentUser = () => {
  const [user, setUser] = React.useState<User | undefined>(undefined);

  const signIn = React.useCallback(
    (user: User) => {
      setUser(user);
    },
    [],
  );

  const signOut = React.useCallback(
    () => {
      setUser(undefined);
    },
    [],
  );

  return React.useMemo(
    () => ({
      user,
      signIn,
      signOut,
    }),
    [
      user,
      signIn,
      signOut,
    ],
  );
};
