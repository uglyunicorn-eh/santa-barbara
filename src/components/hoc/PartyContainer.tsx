import React from "react";
import { useParams } from "react-router-dom";

import { AppSpinner } from "src/components/AppSpinner";
import { GarageDoor } from "src/components/GarageDoor";
import { JoinBox } from "src/components/hoc/JoinBox";
import { PartyDetails } from "src/components/hoc/PartyDetails";
import { useCurrentUser, useParty } from "src/components/hooks";

export const PartyContainer = () => {
  const { profile } = useCurrentUser();
  const { code } = useParams();
  const { party } = useParty(code!);

  const locked = React.useMemo(
    () => !profile || !party?.isJoined,
    [
      profile,
      party?.isJoined,
    ],
  );

  const renderLoginContainer = React.useCallback(
    () => <>{party && <JoinBox party={party} />}</>,
    [
      party,
    ],
  );

  if (party === undefined) {
    return <AppSpinner />;
  }

  return (
    <GarageDoor locked={locked} doorRenderer={renderLoginContainer}>
      {party && <PartyDetails party={party} />}
    </GarageDoor>
  );
}
