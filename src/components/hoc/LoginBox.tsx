import React from "react";
import { Button, Container, Hero } from "react-bulma-components";
import { Route, Routes, useNavigate } from "react-router-dom";

import { GrinchBox } from "src/components/GrinchBox";
import { SnowConfetti } from "src/components/SnowConfetti";
import { UnsplashCredit } from "src/components/UnsplashCredit";
import { Form, FormField, Submit, Input } from "src/components/forms";
import { Footer } from "src/components/hoc/Footer";

import "src/styles/login.scss";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const LoginBox = () => {
  return (
    <Hero size={"fullheight"} className="login-container has-dark-background">
      <Hero.Body>
        <Container textAlign="centered">
          <Routes>
            <Route path="/" Component={EnterActions} />
            <Route path="/enter/" Component={EnterForm} />
          </Routes>
        </Container>
      </Hero.Body>

      <Hero.Footer>
        <Footer noUser noHome profileAsLink>
          <UnsplashCredit nickname="callmefred" name="Frederick Tubiermont" />
        </Footer>
      </Hero.Footer>
    </Hero>
  );
};

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
    <Button
      size="medium"
      className="is-rounded is-link login-button"
      loading={busy}
      disabled={busy}
      onClick={onLoginClick}
    >
      Enter with your email address
    </Button>
  );
}

const EnterForm = () => {
  return (
    <GrinchBox>
      <h2>Enter with your email address</h2>

      <Form>
        <FormField
          name="email"
          horizontal={false}
          children={<Input placeholder="Email address for a magic link" />}
        />

        <p>Enter your email address above and we'll send you a magic link to sign in.</p>
        <p>We promise not to send you any marketing materials or share any of your personal data to third parties.</p>

        <div className="actions">
          <Submit rounded>Send me a magic link!</Submit>
        </div>
      </Form>

      <SnowConfetti />
    </GrinchBox>
  )
}
