import React from "react";
import { Content } from "react-bulma-components";
import { useParams } from "react-router-dom";
import * as Yup from 'yup';

import { DialogBox } from "src/components/DialogBox";
import { Submit } from "src/components/forms";
import { useAppClient, useSignals } from "src/components/hooks";
import { usePartyContext } from "src/components/hoc/PartyContext";

const validationSchema = Yup.object();

const initialValues = {};

export const ConfirmPartyClose = () => {
  const { code } = useParams();
  const { closeParty } = useAppClient();
  const { party } = usePartyContext();
  const { signal } = useSignals();

  const onSubmit = React.useCallback(
    async () => {
      if (!party) {
        return;
      }

      if (await closeParty({ party: party.id })) {
        signal('party:updated');
      }
    },
    [
      code,
      closeParty,
    ],
  );

  return (
    <DialogBox
      className="party-box confirm-party-close"
      title="Here we G-O-O-O-O!!!"
      action={<Submit>&#x1F92A; Can't wait any longer!</Submit>}
      dismissLabel="Not ready yet..."
      dismissLocation={`/p/${code}`}
      form={{
        validationSchema,
        initialValues,
        onSubmit,
      }}
      cardStyle={{
        width: 700,
      }}
    >
      <Content>

        <p>
          Are you ready to rock'n'roll? Before you continue, please note:
        </p>

        <ul>
          <li>Everybody will receive a random friend's name to give a gift to.</li>
          <li>No new people can join the party after this.</li>
          <li><strong>This cannot be undone.</strong></li>
        </ul>

        <p>
          But enough talk,<br />let's get the show started!
        </p>

      </Content>
    </DialogBox>
  )
};
