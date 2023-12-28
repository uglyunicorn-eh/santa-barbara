import React from "react";
import { Button, Hero } from "react-bulma-components";
import { useNavigate } from "react-router-dom";

import { GrinchBox } from "src/components/GrinchBox";
import { SnowConfetti } from "src/components/SnowConfetti";
import { UnsplashCredit } from "src/components/UnsplashCredit";
import { Footer } from "src/components/hoc/Footer";
import { useCurrentUser } from "src/components/hooks";
import type { Party } from "src/types";

type Props = {
  party: Party;
};

export const JoinBox = ({ party }: Props) => {
  const navigate = useNavigate();
  const [busy, setBusy] = React.useState(false);
  const { profile, signIn } = useCurrentUser();

  const onActionClick = React.useCallback(
    () => {
      if (!profile) {
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
      profile,
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
        <GrinchBox>
          <h2>
            &mdash; {party?.isClosed ? "Buenos noches" : "Howdy"}, {profile?.name ?? "anonymous friend"}!
          </h2>
          <h3>
            {
              party?.isClosed
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
          </h3>

          {party?.isClosed
            ? (
              <Button
                size="medium"
                outlined
                text
                onClick={onGoHomeClick}
              >
                &larr;&nbsp;<span className="is-hidden-tablet">Get me home!</span><span className="is-hidden-mobile">Take me home, country roads!</span>
              </Button>
            )
            : (
              <Button
                size="medium"
                color={"primary"}
                className="is-rounded is-link"
                loading={busy}
                disabled={busy}
                onClick={onActionClick}
              >
                &#x1F973;&nbsp;{profile ? "Join the party!" : "Sign in & Join the party!"}
              </Button>
            )}

          {!party?.isClosed ? <SnowConfetti /> : null}
        </GrinchBox>
      </Hero.Body>

      <Hero.Footer>
        <Footer profileAsLink>
          <UnsplashCredit nickname="nicolebaster" name="Nicole Baster" />
        </Footer>
      </Hero.Footer>
    </Hero >
  );
};
