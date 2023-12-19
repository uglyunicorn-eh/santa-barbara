import React from "react";

import { GarageDoor } from "src/components/GarageDoor"
import { PartyDetails } from "src/components/hoc/PartyDetails";
import { useCurrentUser, useParty } from "src/components/hooks";
import { useParams } from "react-router-dom";
import { AppSpinner } from "src/components/AppSpinner";

export const PartyContainer = () => {
  const { user } = useCurrentUser();
  const { code } = useParams();
  const { party } = useParty(code!);

  console.log({ party });

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

  if (party === undefined) {
    return <AppSpinner />;
  }

  return (
    <GarageDoor locked={!party || locked} doorRenderer={renderLoginContainer}>
      {party && <PartyDetails party={party} />}
    </GarageDoor>
  );
}
