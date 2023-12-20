import React from "react";
import { Content } from "react-bulma-components";
import * as Yup from 'yup';

import { DialogBox } from "src/components/DialogBox";
import { HaveQuestion } from "src/components/HaveQuestion";
import { FormField, Input, Submit } from "src/components/forms";
import { useAppClient } from "src/components/hooks";

type FormValues = {
  name: string;
  password: string;
};

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .label("Party name")
    .required()
    .ensure(),
  password: Yup.string()
    .label("Secret phrase")
    .ensure(),
});

const initialValues = {
  name: "Very funny secret party!",
  password: "",
};

export const NewParty = () => {
  const { createParty } = useAppClient();

  const onSubmit = React.useCallback(
    async (values: FormValues) => {
      const party = await createParty(values);
      console.log({ party });
    },
    [
      createParty,
    ],
  );

  return (
    <DialogBox
      className="party-box"
      title="Let's start a new party!"
      action={<Submit>&#x1F389; Rock'n'Roll!</Submit>}
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
          name="name"
          label="Party name"
          children={<Input autofocus />}
        />

        <FormField
          name="password"
          label="Secret phrase"
          children={<Input placeholder="Optional" />}
          help="Everyone must know this phrase for entry. Leave it blank to allow access via a shared link."
          extra={<HaveQuestion />}
        />

      </Content>
    </DialogBox>
  )
};
