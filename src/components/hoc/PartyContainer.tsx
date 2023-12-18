import React from "react";
import { GarageDoor } from "src/components/GarageDoor"
import { PartyDetails } from "src/components/hoc/PartyDetails";

import { useCurrentUser } from "src/components/hooks";

export const PartyContainer = () => {
  const { user } = useCurrentUser();

  const locked = React.useMemo(
    () => !user,
    [
      user,
    ],
  );

  const renderLoginContainer = React.useCallback(
    () => <>Need to login or join</>,
    [],
  );

  return (
    <GarageDoor locked={locked} doorRenderer={renderLoginContainer}>
      <PartyDetails />
    </GarageDoor>
  );
}
