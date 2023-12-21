import React from "react";
import { Button, Content } from "react-bulma-components";
import * as Yup from 'yup';

import type { Party } from "src/types";
import { DialogBox } from "src/components/DialogBox";
import { HaveQuestion } from "src/components/HaveQuestion";
import { FormField, Input, Submit } from "src/components/forms";
import { useAppClient } from "src/components/hooks";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const [party, setParty] = React.useState<Party | undefined>(undefined);

  const onSubmit = React.useCallback(
    async (values: FormValues) => {
      const party = await createParty(values);
      if (!party) {
        return;
      }
      setParty(party);
    },
    [
      createParty,
    ],
  );

  const goToParty = React.useCallback(
    () => {
      if (!party) {
        return;
      }
      navigate(`/p/${party.code}`);
    },
    [
      navigate,
      party,
    ],
  );

  return (
    <DialogBox
      className={["party-box"].concat(party ? ["congratz-box"] : []).join(" ")}
      title={!party ? "Let's start a new party!" : "Congratz!"}
      action={
        !party
          ? <Submit>&#x1F389; Rock'n'Roll!</Submit>
          : <Button onClick={goToParty} color="warning" size="large" rounded>&#x1F973; Yahooooooo!</Button>
      }
      noDismiss={party !== undefined}
      dismissLocation={party ? `/p/${party.code}` : "/"}
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
        {!party
          ? (
            <>
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
            </>
          )
          : (
            <>
              <p>
                We have successfully created your new party {party.name.replace(/!+$/, '')}!
              </p>

              <p>
                Here's your party's secret code:
              </p>

              <h1>{party.code}</h1>
            </>
          )}

      </Content>
    </DialogBox>
  )
};
