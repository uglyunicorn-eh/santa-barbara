import React from "react";
import { Content } from "react-bulma-components";
import { useParams } from "react-router-dom";
import * as Yup from 'yup';

import { DialogBox } from "src/components/DialogBox";
import { FormField, Input, Submit } from "src/components/forms";
import { HaveQuestion } from "src/components/HaveQuestion";
import { useNotifications } from "src/components/hoc/NotificationsContainer";
import { useAppClient } from "src/components/hooks";

type FormValues = {};

const validationSchema = Yup.object();

const initialValues = {};

export const ConfirmPartyClose = () => {
  const { code } = useParams();
  const { error } = useNotifications();
  const { closeParty } = useAppClient();

  const onSubmit = React.useCallback(
    async () => {
      if (!code) {
        return;
      }

      const { data, errors } = await closeParty(code);
      console.log({ data, errors })
      if (errors?.length) {
        error(errors[0]);
      }
      else {
        console.log({ data });
      }
    },
    [
      code,
      closeParty,
      error,
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
