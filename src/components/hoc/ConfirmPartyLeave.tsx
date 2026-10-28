import React from "react";
import { useNavigate } from "react-router";

import { DialogBox } from "@/components/DialogBox";
import { DialogCharacter } from "@/components/DialogCharacter";
import { Submit } from "@/components/forms/Submit";
import { usePartyContext } from "@/components/hoc/PartyContext";
import { useAppClient } from "@/components/hooks";

const defaultValues = {};

export const ConfirmPartyLeave = () => {
  const { party } = usePartyContext();
  const { leaveParty } = useAppClient();
  const navigate = useNavigate();

  const onSubmit = React.useCallback(
    async () => {
      if (!party?.code) {
        return;
      }

      if (await leaveParty({ party: party.code })) {
        navigate("/");
      }
    },
    [
      party?.code,
      leaveParty,
      navigate,
    ],
  );

  return (
    <DialogBox
      className="party-box confirm-party-leave"
      title="Ouch... Not funny :("
      action={<Submit>&#x1F44B; Bye-e-e! See ya later!</Submit>}
      dismissLabel="That was an accident..."
      dismissLocation={`/p/${party?.code}`}
      form={{
        defaultValues,
        onSubmit,
      }}
      size="md"
    >
      {/* Santa raises a glass: cheers, see ya. */}
      <DialogCharacter image={{ src: "/santa-1.webp", srcSet: "/santa-1-256.webp 256w, /santa-1.webp 400w", sizes: "200px", width: 200, height: 200 }}>
        <p>
          Sorry to see you're leaving...
        </p>

        <p>
          But we understand; fun is not for everyone. If you change your mind again (it happened to me once), feel
          free to join the party again while it's still open.
        </p>

        <p>
          <strong>Enjoy your holidays! Bye!</strong>
        </p>
      </DialogCharacter>
    </DialogBox>
  )
};
