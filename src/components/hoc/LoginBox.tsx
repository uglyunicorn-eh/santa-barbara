import React from "react";
import { Button, Container, Hero } from "react-bulma-components";

import { UnsplashCredit } from "src/components/UnsplashCredit";
import { Footer } from "src/components/hoc/Footer";
import { useCurrentUser } from "src/components/hooks";

import "src/styles/login.scss";

export const LoginBox = () => {
  const [busy, setBusy] = React.useState(false);
  const { signIn } = useCurrentUser();

  const onLoginClick = React.useCallback(
    () => {
      setBusy(true);
      setTimeout(() => {
        signIn({
          id: "123",
          name: "Fred",
          email: "",
        });
        setBusy(false);
      }, 1000);
    },
    [
      signIn,
    ],
  );

  return (
    <Hero size={"fullheight"} className="login-container has-dark-background">
      <Hero.Body>
        <Container textAlign="centered">
          <Button
            // isLink={true}
            size="medium"
            className="is-rounded is-link login-button"
            loading={busy}
            onClick={onLoginClick}
            disabled={busy}
            style={{ backgroundColor: '#e94e59' }}
          >
            Enter with your email address
          </Button>
        </Container>
      </Hero.Body>

      <Hero.Footer>
        <Footer>
          <UnsplashCredit nickname="callmefred" name="Frederick Tubiermont" />
        </Footer>
      </Hero.Footer>
    </Hero>
  );
};
