import React from "react";
import { Button, Content } from "src/components/bulma";
import * as Yup from 'yup';

import type { Party } from "src/types";
import { DialogBox } from "src/components/DialogBox";
import { HaveQuestion } from "src/components/HaveQuestion";
import { FormField, Input, Submit } from "src/components/forms";
import { useAppClient, useCurrentUser } from "src/components/hooks";
import { useNavigate } from "react-router-dom";

type FormValues = {
  name: string;
  password: string;
};

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .label("Party name")
    .max(100)
    .required()
    .ensure(),
  password: Yup.string()
    .label("Secret phrase")
    .max(100)
    .ensure(),
});

const initialValues = {
  name: "Very funny secret party!",
  password: "",
};

const signInValidationSchema = Yup.object().shape({
  email: Yup.string()
    .label("Email")
    .required()
    .ensure()
    .email(),
});

/** Creating a party needs a session: signed-out visitors get a magic link first, then come back here. */
const SignInFirst = () => {
  const { enterRequest } = useAppClient();
  const [sentTo, setSentTo] = React.useState<string>();
  const [failed, setFailed] = React.useState(false);

  const onSubmit = React.useCallback(
    async ({ email }: { email: string }) => {
      if (await enterRequest({ email })) {
        setSentTo(email);
      } else {
        setFailed(true);
      }
    },
    [enterRequest],
  );

  return (
    <DialogBox
      className="party-box"
      title="Let's start a new party!"
      action={!sentTo && <Submit>&#x2709;&#xFE0F; Send me a magic link</Submit>}
      noDismiss={sentTo !== undefined}
      dismissLocation="/"
      form={{
        validationSchema: signInValidationSchema,
        initialValues: { email: "" },
        onSubmit,
      }}
      cardStyle={{
        width: 600,
      }}
    >
      <Content>
        {sentTo
          ? (
            <>
              <p>Our elves have sent a magic link to {sentTo}. Follow it to sign in, then start your party from the home page.</p>
              <p>Didn't get anything? Check your spam folder, or refresh this page and try again.</p>
            </>
          )
          : (
            <>
              <p>First, let's sign you in. We'll email you a magic link, no password needed.</p>
              <FormField
                name="email"
                label="Email"
                children={<Input autofocus placeholder="Email address for a magic link" />}
                help={failed ? "We couldn't send the link just now. Please try again in a bit." : undefined}
              />
            </>
          )}
      </Content>
    </DialogBox>
  );
};

export const NewParty = () => {
  const { profile } = useCurrentUser();
  return profile ? <NewPartyForm /> : <SignInFirst />;
};

const NewPartyForm = () => {
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
