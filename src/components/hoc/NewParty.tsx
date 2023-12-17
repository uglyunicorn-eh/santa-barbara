import { type FormikHelpers } from "formik";
import React from "react";
import { Button, Content, Form as BulmaForm } from "react-bulma-components";

import { DialogBox } from "src/components/DialogBox";
import { HaveQuestion } from "src/components/HaveQuestion";
import { FormField } from "src/components/forms";

type FormValues = {
  name: string;
  password: string;
};

const initialValues = {
  name: "Very funny secret party!",
  password: "",
};

export const NewParty = () => {
  const onSubmit = React.useCallback(
    async (values: FormValues, formikHelpers: FormikHelpers<FormValues>) => {
      console.log({ values, formikHelpers });
    },
    [
    ],
  );

  return (
    <DialogBox
      className="party-box"
      title="Let's start a new party!"
      action={<Button type="submit" color="primary">&#x1F389; Rock'n'Roll!</Button>}
      form={{
        initialValues,
        onSubmit,
      }}
    >
      <Content>
        <FormField name="name" label="Party name">
          <BulmaForm.Input />
        </FormField>

        <FormField
          name="password"
          label="Secret phrase"
          help="Everyone must know this phrase for entry. Leave it blank to allow access via a shared link."
          extra={<HaveQuestion />}
        >
          <BulmaForm.Input placeholder="Optional" />
        </FormField>

      </Content>
    </DialogBox>
  )
};
