import React from "react";

import { newKey } from "src/api/client";
import { Container, Hero } from "src/components/bulma";
import { Button } from "@/components/ui/button";
import { Route, Routes, useNavigate } from "react-router-dom";
import * as Yup from 'yup';

import { GrinchBox } from "src/components/GrinchBox";
import { SnowConfetti } from "src/components/SnowConfetti";
import { UnsplashCredit } from "src/components/UnsplashCredit";
import { Form, FormField, Input, Submit } from "src/components/forms";
import { Footer } from "src/components/hoc/Footer";
import { NotificationsContainer, useNotifications } from "src/components/hoc/NotificationsContainer";
import { useAppClient, useCurrentUser } from "src/components/hooks";
import type { EnterRequestInput } from "src/components/hooks/useAppClient";
import { MAX_EMAIL_LENGTH } from "src/limits";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .label("Email")
    .max(MAX_EMAIL_LENGTH)
    .required()
    .ensure()
    .email(),
});

export const LoginBox = () => {
  return (
    <>
      <NotificationsContainer />

      <LoginHero>
        <Routes>
          <Route path="/" Component={EnterActions} />
          <Route path="/enter/" Component={EnterForm} />
        </Routes>
      </LoginHero>
    </>
  );
};

export const LoginHero = ({ children }: { children: React.ReactNode }) => (
  <Hero size={"fullheight"} className="login-container has-dark-background">
    <Hero.Body>
      <Container textAlign="centered">
        {children}
      </Container>
    </Hero.Body>

    <Hero.Footer>
      <Footer noUser noHome profileAsLink>
        <UnsplashCredit id="k0nfntv2Dgs" name="Call Me Fred" username="callmefred" />
      </Footer>
    </Hero.Footer>
  </Hero>
);

const EnterActions = () => {
  const navigate = useNavigate();

  const [busy, setBusy] = React.useState(false);

  const onLoginClick = React.useCallback(
    async () => {
      setBusy(true);
      await sleep(500);
      navigate("/enter/");
    },
    [
      navigate,
    ],
  );

  return (
    <Button variant="brand" size="lg" surface="dark" pill loading={busy} onClick={onLoginClick}>
      Enter with your email address
    </Button>
  );
}

const EnterForm = () => {
  const { error } = useNotifications();
  const navigate = useNavigate();
  const { enterRequest } = useAppClient();
  const requestKey = React.useRef(newKey());
  const [sentTo, setSentTo] = React.useState<string>();

  const onSubmit = React.useCallback(
    async (input: EnterRequestInput) => {
      const submit = async () => {
        // One key per submission: a retry or a double click sends one email; submitting again later sends another.
        const sent = await enterRequest(input, requestKey.current);
        requestKey.current = newKey();
        if (!sent) {
          error("Unable to send magic link. Please try again in a bit. If you still see this message, please contact support at info@gnomik.me");
        }
      };

      await Promise.all([
        sleep(1000),
        submit(),
      ]);
      setSentTo(input.email);
    },
    [
      error,
      enterRequest,
    ],
  );

  const goHome = React.useCallback(() => navigate('/'), [navigate]);

  return (
    <GrinchBox>
      {sentTo
        ? (
          <>
            <h2>HO-HO-HO!</h2>
            <br />
            <p>Our team of elves has just sent you a magic link to {sentTo}. Please check your inbox and follow the instructions.</p>
            <p>If you didn't receive anything from us, refresh this page and try again.</p>

            <Button variant="secondary" surface="dark" pill onClick={goHome}>Return back to home</Button>

            <SnowConfetti />
          </>
        )
        : (
          <Form
            initialValues={{ email: "" }}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
          >
            <h2>Enter with your email address</h2>

            <FormField
              name="email"
              horizontal={false}
              children={<Input placeholder="Email address for a magic link" maxLength={MAX_EMAIL_LENGTH} />}
            />

            <p>Enter your email address above and we'll send you a magic link to sign in.</p>
            <p>We promise not to send you any marketing materials or share your personal data with third parties.</p>

            <div className="actions">
              <Submit variant="brand" size="lg" surface="dark" pill>Send me a magic link!</Submit>
            </div>
          </Form>
        )
      }
    </GrinchBox >
  )
}
