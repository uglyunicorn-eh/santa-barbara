import React from "react";
import { Content } from "@/components/layout";
import { useNavigate } from "react-router-dom";

import { DialogBox } from "@/components/DialogBox";
import { Submit } from "@/components/forms";
import { usePartyContext } from "@/components/hoc/PartyContext";
import { useAppClient, useSignals } from "@/components/hooks";

const defaultValues = {};

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
      className="party-box confirm-party-delete"
      title="Delete this party? 😱"
      action={<Submit variant="destructive">&#x1F4A5; Yes, delete it</Submit>}
      dismissLabel="Keep it"
      dismissLocation={`/p/${party?.code}`}
      form={{
        defaultValues,
        onSubmit,
      }}
      size="sm"
    >
      <Content>
        <p>
          <strong>{party?.name.replace(/!+$/, '')}</strong> will disappear for everyone who joined, and its link
          will stop working.
        </p>
        <p>
          Changed your mind? You can restore it from this page within 24 hours. After that it's gone for good.
        </p>
      </Content>
    </DialogBox>
  );
};
