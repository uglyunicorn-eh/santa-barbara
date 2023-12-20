import React from "react";
import { Columns, Content } from "react-bulma-components";
import { useParams } from "react-router-dom";
import * as Yup from 'yup';

import { DialogBox } from "src/components/DialogBox";
import { FormField, Input, Submit } from "src/components/forms";
import { HaveQuestion } from "src/components/HaveQuestion";
import { useNotifications } from "src/components/hoc/NotificationsContainer";
import { useAppClient } from "src/components/hooks";

import SantaImg from "src/images/santa.png";

type FormValues = {};

const validationSchema = Yup.object();

const initialValues = {};

export const ConfirmPartyLeave = () => {
  const { code } = useParams();
  const { error } = useNotifications();
  const { leaveParty } = useAppClient();

  const onSubmit = React.useCallback(
    async () => {
      if (!code) {
        return;
      }

      const { data, errors } = await leaveParty(code);
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
      leaveParty,
      error,
    ],
  );

  return (
    <DialogBox
      className="party-box confirm-party-leave"
      title="Ouch... Not funny :("
      action={<Submit>&#x1F44B; Bye-e-e!</Submit>}
      dismissLabel="That was an accident..."
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
      <Columns>
        <Columns.Column narrow mobile={{ display: 'hidden' }} style={{ display: 'flex' }}>
          <img src={SantaImg.src} alt="Santa" width={200} />
        </Columns.Column>
        <Columns.Column>
          <Content>

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

          </Content>
        </Columns.Column>
      </Columns>
    </DialogBox>
  )
};
