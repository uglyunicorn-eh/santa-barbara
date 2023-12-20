import React from "react";
import { Button, Card, Container, Hero } from "react-bulma-components";

import type { Party } from "src/types";
import { UnsplashCredit } from "src/components/UnsplashCredit";
import { Footer } from "src/components/hoc/Footer";
import { useCurrentUser } from "src/components/hooks";
import { SnowConfetti } from "src/components/SnowConfetti";

import hiImg from "src/images/grinch.png";

import "src/styles/login.scss";
import { motion } from "framer-motion";

type Props = {
  party: Party;
};

export const JoinBox = ({ party }: Props) => {
  const [busy, setBusy] = React.useState(false);
  const { user, signIn } = useCurrentUser();

  const onLoginClick = React.useCallback(
    () => {
      setBusy(true);
      if (!user) {
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
                  Howdy, {user?.name ?? "anonymous friend"}!<br />
                  Welcome to the {party.name.replace(/!+$/, '')}!
                </h2>
                <Button
                  size="medium"
                  className="is-rounded is-link login-button"
                  loading={busy}
                  disabled={busy}
                  onClick={onLoginClick}
                >
                  &#x1F973;&nbsp;{user ? "Join the party!" : "Sign in & Join the party!"}
                </Button>

                <SnowConfetti />
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
