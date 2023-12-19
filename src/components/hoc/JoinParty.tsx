import React from "react";
import { Content } from "react-bulma-components";
import * as Yup from 'yup';

import { DialogBox } from "src/components/DialogBox";
import { FormField, Input, Submit } from "src/components/forms";
import { HaveQuestion } from "src/components/HaveQuestion";
import { useNotifications } from "src/components/hoc/NotificationsContainer";
import { useAppClient } from "src/components/hooks";

type FormValues = {
  code: string;
};

const validationSchema = Yup.object().shape({
  code: Yup.string()
    .label("Secret code")
    .required()
    .ensure(),
});

const initialValues = {
  code: "",
};

export const JoinParty = () => {
  const { error } = useNotifications();
  const { joinParty } = useAppClient();

  const onSubmit = React.useCallback(
    async (values: FormValues) => {
      const { data, errors } = await joinParty(values);
      if (errors) {
        error(errors[0]);
      }
      else {
        console.log({ data });
      }
    },
    [
      joinParty,
      error,
    ],
  );

  return (
    <DialogBox
      className="party-box"
      title="Join a party!"
      action={<Submit>&#x1F973; Here I come!</Submit>}
      form={{
        validationSchema,
        initialValues,
        onSubmit,
      }}
      cardStyle={{
        width: 600,
      }}
    >
      <Content>
        <FormField
          name="code"
          label="Secret code"
          children={<Input autofocus />}
          help="Your friend probably told you a secret code. This is the right place to put it..."
          extra={<HaveQuestion />}
        />

      </Content>
    </DialogBox>
  )
};
