import React from "react";
import { Button, Hero } from "react-bulma-components";
import { useNavigate } from "react-router-dom";
import * as Yup from 'yup';

import { GrinchBox } from "src/components/GrinchBox";
import { SnowConfetti } from "src/components/SnowConfetti";
import { UnsplashCredit } from "src/components/UnsplashCredit";
import { Form, FormField, Input, Submit } from "src/components/forms";
import { Footer } from "src/components/hoc/Footer";
import { useAppClient, useCurrentUser, useSignals } from "src/components/hooks";
import type { Party, User } from "src/types";
import { NotificationsContainer, useNotifications } from "src/components/hoc/NotificationsContainer";
import type { JoinPartyInput } from "src/components/hooks/useAppClient";

type Props = {
  party: Party;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const joinValidationSchema = Yup.object().shape({
  name: Yup.string()
    .label("Name")
    .required()
    .ensure(),

  password: Yup.string()
    .label("Secret phrase"),
});

const signInValidationSchema = Yup.object().shape({
  email: Yup.string()
    .label("Email")
    .required()
    .ensure()
    .email(),
  party: Yup.string()
    .required()
    .ensure(),
});


export const JoinBox = ({ party }: Props) => {
  const navigate = useNavigate();

  const { profile } = useCurrentUser();

  const onGoHomeClick = React.useCallback(() => navigate('/'), [navigate]);

  return (
    <>
      <NotificationsContainer />

      <Hero size={"fullheight"} className="join-container">
        <Hero.Body>
          <GrinchBox>
            <h2>
              &mdash; {party?.isClosed ? "Buenos noches" : "Howdy"}, {profile?.name ?? "anonymous friend"}!
            </h2>

            {party.isClosed
              ? (
                <>
                  <h3>
                    Sorry to disappoint you, <br />
                    but {party.name.replace(/!+$/, '')} is over!
                  </h3>

                  <Button
                    size="medium"
                    outlined
                    text
                    onClick={onGoHomeClick}
                  >
                    &larr;&nbsp;<span className="is-hidden-tablet">Get me home!</span><span className="is-hidden-mobile">Take me home, country roads!</span>
                  </Button>
                </>
              )
              : (
                <>
                  <h3>Welcome to the {party.name.replace(/!+$/, '')}!</h3>

                  {profile ? <SubmitRequestForm party={party} profile={profile} /> : <SignInControls party={party} />}
                </>
              )
            }
          </GrinchBox>
        </Hero.Body>

        <Hero.Footer>
          <Footer profileAsLink>
            <UnsplashCredit nickname="nicolebaster" name="Nicole Baster" />
          </Footer>
        </Hero.Footer>
      </Hero >
    </>
  );
};

type SignInControlsProps = {
  party: Party;
};

const SignInControls = ({ party }: SignInControlsProps) => {
  const { error } = useNotifications();
  const { enterRequest } = useAppClient();
  const navigate = useNavigate();

  const [busy, setBusy] = React.useState(false);
  const [displayForm, setDisplayForm] = React.useState(false);
  const [sentTo, setSentTo] = React.useState<string>();

  const onActionClick = React.useCallback(
    async () => {
      try {
        setBusy(true);
        await sleep(500);
        setDisplayForm(true);
      }
      finally {
        setBusy(false);
      }
    },
    [],
  );

  const onSubmit = React.useCallback(
    async (input: any) => {
      const submit = async () => {
        if (! await enterRequest(input)) {
          error("Unable to send magic link. Please try again in a bit. If you still see this message, please contact support at info@gnomik.me");
        }
      };

      await Promise.all([
        sleep(500),
        submit(),
      ]);
      setSentTo(input.email);
    },
    [
      enterRequest,
      error,
    ],
  );

  const goHome = React.useCallback(() => navigate('/'), [navigate]);

  if (sentTo) {
    return (
      <>
        <p>Our team of elves has just sent you a magic link to {sentTo}. Please check your inbox and follow the instructions.</p>
        <p>If you didn't receive anything from us, refresh this page and try again.</p>

        <Button outlined text rounded onClick={goHome}>Return back to home</Button>

        <SnowConfetti />
      </>
    );
  }

  if (displayForm) {
    return (
      <Form
        initialValues={{ email: "", party: party.code }}
        validationSchema={signInValidationSchema}
        onSubmit={onSubmit}
      >
        <FormField
          name="email"
          label="Enter with your email address"
          horizontal={false}
          children={<Input placeholder="Email address for a magic link" />}
        />
        <p>
          Enter your email address above and we'll send you a magic link to sign in.
        </p>
        <div className="actions">
          <Submit
            size="medium"
            color={"primary"}
            className="is-rounded is-link"
          >
            &#x1F973;&nbsp;Send me a magic link!
          </Submit>
        </div>
      </Form>
    );
  }

  return (
    <>
      <p style={{ textAlign: "justify" }}>
        To join the party, please sign in with your email address. We promise not to send you any marketing materials or share your personal data with third parties.
      </p >
      <div className="actions">
        <Button
          size="medium"
          color={"primary"}
          className="is-rounded is-link"
          loading={busy}
          disabled={busy}
          onClick={onActionClick}
        >
          &#x1F973;&nbsp;Sign in to join the party!
        </Button >
      </div >
    </>
  )
};

type SubmitRequestFormProps = {
  profile: User;
  party: Party;
}

const SubmitRequestForm = ({ profile, party }: SubmitRequestFormProps) => {
  const { joinParty } = useAppClient();
  const { signal } = useSignals();

  const onSubmit = React.useCallback(
    async (input: JoinPartyInput) => {
      if (await joinParty(input)) {
        signal('party:updated');
      }
    },
    [
      joinParty,
    ],
  );

  return (
    <Form
      initialValues={{
        party: party.id,
        name: profile?.name ?? "",
        password: "",
      }}
      validationSchema={joinValidationSchema}
      onSubmit={onSubmit}
    >
      {!profile?.name &&
        (
          <FormField
            name="name"
            label={profile?.name ? "Wanna use your regular name?" : "Let us know your name"}
            horizontal={false}
            children={<Input />}
          />
        )
      }

      {party.isProtected &&
        (
          <>
            <p>
              Before we let you in, please enter a secret phrase we hope you've been told...
            </p>

            <FormField
              name="password"
              label="Secret phrase"
              horizontal={false}
              children={<Input />}
              help="We beleave your friend didn't forget to tell it to you..."
            />
          </>
        )
      }

      <div className="actions">
        <Submit
          size="medium"
          color={"primary"}
          className="is-rounded is-link"
        >
          &#x1F973;&nbsp;{profile ? "Join the party!" : "Sign in & Join the party!"}
        </Submit>
      </div>

      <SnowConfetti />
    </Form>
  );
};
