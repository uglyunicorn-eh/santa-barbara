import React from "react";

export const useRefresher = () => {
  const [refresher, setRefresher] = React.useState(0);

  const refresh = React.useCallback(
    () => setRefresher(r => r + 1),
    [],
  );

  return ({
    refresher,
    refresh,
  });
}
