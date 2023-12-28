import React from "react";
import { Content } from "react-bulma-components";
import * as Yup from 'yup';

import { DialogBox } from "src/components/DialogBox";
import { FormField, Input, Submit } from "src/components/forms";
import { HaveQuestion } from "src/components/HaveQuestion";
import { useAppClient } from "src/components/hooks";
import { useNotifications } from "src/components/hoc/NotificationsContainer";
import { useNavigate } from "react-router";

type FormValues = {
  code: string;
};

const validationSchema = Yup.object().shape({
  code: Yup.string()
    .label("Secret code")
    .required()
    .matches(/^[QWERTYUIPASDFGHJKLZXCVBNMOqwertyuipasdfghjklzxcvbnmo]{5}$/, "Invalid secret code")
    .ensure(),
});

const initialValues = {
  code: "",
};

export const JoinParty = () => {
  const { getParty } = useAppClient();
  const { error } = useNotifications();
  const navigate = useNavigate();

  const onSubmit = React.useCallback(
    async (values: FormValues) => {
      const party = await getParty(values.code);
      if (party) {
        navigate(`/p/${party.code}`);
      }
      else {
        error("Hm... we cannot find any party for the code. Please check the code and try again...");
      }
    },
    [
      getParty,
      error,
      navigate,
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
          children={<Input maxLength={5} style={{ textTransform: "uppercase" }} />}
          help="Your friend probably told you a secret code. This is the right place to put it..."
          extra={<HaveQuestion />}
        />

      </Content>
    </DialogBox>
  )
};
