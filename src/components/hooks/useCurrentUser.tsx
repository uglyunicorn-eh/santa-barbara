import React from "react";

type User = {
  id: string;
  name: string;
  email: string;
};

export const useCurrentUser = () => {
  const signOut = React.useCallback(
    () => void 0,
    [],
  );

  return React.useMemo(
    () => ({
      user: undefined,
      signOut,
    }),
    [
      signOut,
    ],
  );
};
