import React from "react";
import { useNavigate } from "react-router-dom";

import { DialogBox } from "@/components/DialogBox";
import { DialogCharacter } from "@/components/DialogCharacter";
import { Submit } from "@/components/forms/Submit";
import { usePartyContext } from "@/components/hoc/PartyContext";
import { useAppClient, useSignals } from "@/components/hooks";

import GrinchImg from "@/images/grinch.png";

const defaultValues = {};

/**
 * The danger tone (docs/ui-kit.md, "Tones"): a light red card, no bunting, the Grinch beside the warning, and the
 * filled red final confirm.
 */
export const ConfirmPartyDelete = () => {
  const { party } = usePartyContext();
  const { deleteParty } = useAppClient();
  const { signal } = useSignals();
  const navigate = useNavigate();

  const onSubmit = React.useCallback(
    async () => {
      if (!party) {
        return;
      }
      if (await deleteParty({ party: party.code })) {
        signal('party:updated');
        navigate(`/p/${party.code}`);
      }
    },
    [
      party,
      deleteParty,
      signal,
      navigate,
    ],
  );

  return (
    <DialogBox
      className="confirm-party-delete"
      title="Delete this party?"
      action={<Submit variant="destructive">&#x1F4A5; Yes, delete it</Submit>}
      dismissLabel="Keep it"
      dismissLocation={`/p/${party?.code}`}
      form={{
        defaultValues,
        onSubmit,
      }}
      size="sm"
      tone="danger"
    >
      <DialogCharacter image={{ src: GrinchImg.src, width: 150, height: 150 }}>
        <p>
          <strong className="wrap-anywhere">{party?.name.replace(/!+$/, '')}</strong> will disappear for everyone who
          joined, and its link will stop working.
        </p>
        <p>
          Changed your mind? You can restore it from this page within 24 hours. After that it's gone for good.
        </p>
      </DialogCharacter>
    </DialogBox>
  );
};
