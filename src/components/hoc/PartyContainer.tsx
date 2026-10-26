import React from "react";
import { useParams } from "react-router-dom";

import { AppSpinner } from "@/components/AppSpinner";
import { GarageDoor } from "@/components/GarageDoor";
import { JoinBox } from "@/components/hoc/JoinBox";
import { PartyContext } from "@/components/hoc/PartyContext";
import { PartyDetails } from "@/components/hoc/PartyDetails";
import { PartyNotFound } from "@/components/hoc/PartyNotFound";
import { useCurrentUser, useLiveParty, useParty } from "@/components/hooks";

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

  // Live updates while the user is in the party (or hosts it, even deleted): joins, leaves and the roll show up at once.
  useLiveParty(code, Boolean(profile && party && (party.isJoined || party.isHost)));

  const renderLoginContainer = React.useCallback(() => (party && <JoinBox party={party} />), [party]);

  if (party === undefined) {
    return <AppSpinner />;
  }

  if (party === null) {
    return <PartyNotFound />;
  }

  return (
    <PartyContext.Provider value={{ party }}>
      <GarageDoor locked={locked} doorRenderer={renderLoginContainer}>
        <PartyDetails party={party} />
      </GarageDoor>
    </PartyContext.Provider>
  );
}
