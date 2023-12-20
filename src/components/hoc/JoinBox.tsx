import { motion } from "framer-motion";
import React from "react";
import { Button, Card, Container, Hero } from "react-bulma-components";
import { useNavigate } from "react-router-dom";

import { SnowConfetti } from "src/components/SnowConfetti";
import { UnsplashCredit } from "src/components/UnsplashCredit";
import { Footer } from "src/components/hoc/Footer";
import { useCurrentUser } from "src/components/hooks";
import type { Party } from "src/types";

import hiImg from "src/images/grinch.png";

import "src/styles/login.scss";

type Props = {
  party: Party;
};

export const JoinBox = ({ party }: Props) => {
  const navigate = useNavigate();
  const [busy, setBusy] = React.useState(false);
  const { user, signIn } = useCurrentUser();

  const onActionClick = React.useCallback(
    () => {
      if (!user) {
        setBusy(true);
        setTimeout(() => {
          signIn({
            id: "123",
            name: "Fred",
            email: "",
          });
          setBusy(false);
        }, 1000);
      }
    },
    [
      user,
      signIn,
    ],
  );

  const onGoHomeClick = React.useCallback(
    () => {
      navigate('/');
    },
    [
      navigate,
    ],
  );

  return (
    <Hero size={"fullheight"} className="join-container">
      <Hero.Body>
        <Container textAlign="centered">
          <motion.div
            initial={{ opacity: 0.2, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.1 }}
          >
            <Card>
              <Card.Content>
                <img src={hiImg.src} alt="Hi!" className="hi-img" width={250} />

                <h2>
                  {party?.closed ? "Buenos noches" : "Howdy"}, {user?.name ?? "anonymous friend"}!
                  {
                    party?.closed
                      ? (
                        <>
                          <br />
                          Sorry to disappoint you,
                          <br />
                          but {party.name.replace(/!+$/, '')} is over!
                        </>
                      )
                      : (
                        <>
                          <br />
                          Welcome to the {party.name.replace(/!+$/, '')}!
                        </>
                      )
                  }
                </h2>

                {party?.closed
                  ? (
                    <Button
                      size="medium"
                      className="go-home-button"
                      outlined
                      text
                      onClick={onGoHomeClick}
                    >
                      &larr;&nbsp;<span className="is-hidden-tablet">Get me home!</span><span className="is-hidden-mobile">Take me home, country road!</span>
                    </Button>
                  )
                  : (
                    <Button
                      size="medium"
                      className="is-rounded is-link login-button"
                      loading={busy}
                      disabled={busy}
                      onClick={onActionClick}
                    >
                      &#x1F973;&nbsp;{user ? "Join the party!" : "Sign in & Join the party!"}
                    </Button>
                  )}

                {!party?.closed ? <SnowConfetti /> : null}
              </Card.Content>
            </Card>
          </motion.div>
        </Container>
      </Hero.Body>

      <Hero.Footer>
        <Footer profileAsLink>
          <UnsplashCredit nickname="nicolebaster" name="Nicole Baster" />
        </Footer>
      </Hero.Footer>
    </Hero >
  );
};
