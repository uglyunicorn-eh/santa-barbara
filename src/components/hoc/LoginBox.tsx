import { gql, useMutation } from "@apollo/client";
import React from "react";
import { Button, Container, Hero } from "react-bulma-components";
import { Route, Routes, useNavigate } from "react-router-dom";
import * as Yup from 'yup';

import { GrinchBox } from "src/components/GrinchBox";
import { SnowConfetti } from "src/components/SnowConfetti";
import { UnsplashCredit } from "src/components/UnsplashCredit";
import { Form, FormField, Input, Submit } from "src/components/forms";
import { Footer } from "src/components/hoc/Footer";
import { NotificationsContainer, useNotifications } from "src/components/hoc/NotificationsContainer";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .label("Email")
    .required()
    .ensure()
    .email(),
});


export const LoginBox = () => {
  return (
    <>
      <NotificationsContainer />

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
    </>
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
  const { error } = useNotifications();
  const navigate = useNavigate();
  const [sentTo, setSentTo] = React.useState<string>();

  const [enterRequest, { loading, data, error: apiError }] = useMutation(
    gql`
      mutation EnterRequest($input: EnterRequestInput!) {
        auth {
          enterRequest(input: $input) {
            status
            userErrors {
              fieldName
              messages
            }
          }
        }
      }
    `
  );

  const isComplete = React.useMemo(
    () => !!sentTo && !loading && data,
    [
      sentTo,
      loading,
      data,
    ],
  );

  React.useEffect(
    () => {
      if (!data && !apiError) {
        return;
      }
      if (apiError) {
        error(apiError.message)
      }
      else if (data?.auth.enterRequest.status !== "ok") {
        error("Unable to send magic link. Please try again in a bit. If you still see this message, please contact support at info@gnomik.me");
      }
    },
    [
      error,
      data,
      apiError,
    ],
  );

  const onSubmit = React.useCallback(
    async (values: any) => {
      await Promise.all([
        sleep(1000),
        enterRequest({ variables: { input: values } }),
      ]);
      setSentTo(values.email);
    },
    [
      error,
      enterRequest,
    ],
  );

  const goHome = React.useCallback(
    () => {
      navigate('/');
    },
    [
      navigate,
    ],
  );

  return (
    <GrinchBox>
      {isComplete
        ? (
          <>
            <h2>HO-HO-HO!</h2>
            <p>Our team of elves has just sent you a magic link to {sentTo}. Please check your inbox and follow the instructions.</p>
            <p>If you didn't receive anything from us, refresh this page and try again.</p>

            <div className="actions">
              <Button outlined text rounded onClick={goHome}>Return back to home</Button>
            </div>

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
              children={<Input placeholder="Email address for a magic link" />}
            />

            <p>Enter your email address above and we'll send you a magic link to sign in.</p>
            <p>We promise not to send you any marketing materials or share your personal data with third parties.</p>

            <div className="actions">
              <Submit rounded loading={loading}>Send me a magic link!</Submit>
            </div>
          </Form>
        )
      }
    </GrinchBox >
  )
}
