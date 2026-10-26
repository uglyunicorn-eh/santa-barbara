import React from "react";

import { newKey } from "@/api/client";
import { Container, Hero } from "@/components/layout";
import { Button, buttonVariants } from "@/components/ui/button";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import * as v from "valibot";

import { GrinchDialog } from "@/components/GrinchBox";
import { SnowConfetti } from "@/components/SnowConfetti";
import { UnsplashCredit } from "@/components/UnsplashCredit";
import { Form, FormField, Input, Submit } from "@/components/forms";
import { maxLen, required, validEmail } from "@/components/forms/messages";
import { Footer } from "@/components/hoc/Footer";
import { useNotifications } from "@/components/hoc/NotificationsContainer";
import { useAppClient } from "@/components/hooks";
import type { EnterRequestInput } from "@/components/hooks/useAppClient";
import { MAX_EMAIL_LENGTH } from "@/limits";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const schema = v.object({
  email: v.pipe(
    v.string(),
    v.nonEmpty(required("Email")),
    v.maxLength(MAX_EMAIL_LENGTH, maxLen("Email", MAX_EMAIL_LENGTH)),
    v.email(validEmail("Email")),
  ),
});

export const LoginBox = () => {
  return (
    <>
      <LoginHero>
        <Routes>
          <Route path="/" Component={EnterActions} />
          {/* The sign-in form opens over the front door, which stays as it was behind it. */}
          <Route path="/enter/" element={<><EnterActions /><EnterForm /></>} />
          {/* Signed out, every other page (the profile, a new party…) is the front door. */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </LoginHero>
    </>
  );
};

export const LoginHero = ({ children }: { children: React.ReactNode }) => (
  <Hero size={"fullheight"} className="login-container">
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
        return sent;
      };

      const [, sent] = await Promise.all([
        sleep(1000),
        submit(),
      ]);
      // Only a sent link turns the form into "check your inbox"; after an error the form stays, to try again.
      if (sent) {
        setSentTo(input.email);
      }
    },
    [
      error,
      enterRequest,
    ],
  );

  const goHome = React.useCallback(() => navigate('/'), [navigate]);

  return (
    <GrinchDialog closeTo="/" className="login-dialog">
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
            defaultValues={{ email: "" }}
            schema={schema}
            onSubmit={onSubmit}
          >
            <h2>Enter with your email address</h2>

            <FormField
              name="email"
              horizontal={false}
          surface="dark"
          size="lg"
              children={<Input autofocus placeholder="Email address for a magic link" maxLength={MAX_EMAIL_LENGTH} />}
            />

            <p>Enter your email address above and we'll send you a magic link to sign in.</p>
            <p>We promise not to send you any marketing materials or share your personal data with third parties.</p>

            <div className="actions flex flex-col items-center gap-3">
              <Submit variant="brand" size="lg" surface="dark" pill>Send me a magic link!</Submit>
              <a href="/how-it-works/" target="_blank" className={buttonVariants({ variant: "ghost", surface: "dark", pill: true })}>How this works?</a>
            </div>
          </Form>
        )
      }
    </GrinchDialog>
  )
}
