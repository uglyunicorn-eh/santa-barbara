import React from "react";
import { Content } from "src/components/bulma";
import { Button } from "@/components/ui/button";
import * as Yup from 'yup';

import type { Party } from "src/types";
import { DialogBox } from "src/components/DialogBox";
import { HaveQuestion } from "src/components/HaveQuestion";
import { FormField, Input, Submit } from "src/components/forms";
import { useAppClient } from "src/components/hooks";
import { useNavigate } from "react-router-dom";
import { MAX_NAME_LENGTH, MAX_PHRASE_LENGTH } from "src/limits";

type FormValues = {
  name: string;
  password: string;
};

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .label("Party name")
    .max(MAX_NAME_LENGTH)
    .required()
    .ensure(),
  password: Yup.string()
    .label("Secret phrase")
    .max(MAX_PHRASE_LENGTH)
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

  // A double click or a repeated Enter can fire a second submit before the form re-renders as busy; each one would create a party.
  const submitting = React.useRef(false);
  // The API returns the same party for a repeated request id, so even a request that was sent twice makes one party.
  const requestId = React.useRef(crypto.randomUUID());

  const onSubmit = React.useCallback(
    async (values: FormValues) => {
      // The party is made; the form stays mounted under the congratulations, so ignore any later submit.
      if (submitting.current || party) {
        return;
      }
      submitting.current = true;
      try {
        const party = await createParty({ ...values, requestId: requestId.current });
        if (!party) {
          return;
        }
        setParty(party);
      } finally {
        submitting.current = false;
      }
    },
    [
      createParty,
      party,
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
          // Still inside the form: without type="button" it would submit it again.
          : <Button type="button" variant="primary" onClick={goToParty}>&#x1F973; Yahooooooo!</Button>
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
                children={<Input autofocus maxLength={MAX_NAME_LENGTH} />}
              />

              <FormField
                name="password"
                label="Secret phrase"
                children={<Input placeholder="Optional" maxLength={MAX_PHRASE_LENGTH} />}
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
