import React from "react";
import { Columns, Container, Content, Hero, Image } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

import { UnsplashCredit } from '@/components/UnsplashCredit';
import { Footer } from '@/components/hoc/Footer';
import { LoginHero } from '@/components/hoc/LoginBox';
import { useNotifications } from '@/components/hoc/NotificationsContainer';
import { newKey } from '@/api/client';
import { NO_KEY_MESSAGE, newSessionKey } from '@/api/dpop';
import { TINTS, useAppClient, useCurrentUser, usePageTint } from '@/components/hooks';
import { useLinkToken } from '@/components/hooks/useLinkToken';

import image from '@/images/enter.png';

/** Signing in, or why it didn't work: the link expired, it's no good, or this browser can't keep a session key. */
type Outcome = "working" | "expired" | "invalid" | "no-key";

const INVALID_LINK = "The magic link you are using is not valid. We are not sure where did you get it from, but it's not working.";

export const EnterContainer = () => {
  usePageTint(TINTS.enter);
  // The sign-in link's token (after "#" in new links, in the path in older ones), moved off the address bar.
  const linkToken = useLinkToken("/enter/link");
  const { error, success } = useNotifications();
  const navigate = useNavigate();
  const { signIn } = useCurrentUser();

  const { enter, enterAgain } = useAppClient();
  // One key for this page's "send a new link" button, so a double click sends one email.
  const resendKey = React.useRef(newKey());
  const [resending, setResending] = React.useState(false);

  const [outcome, setOutcome] = React.useState<Outcome>("working");
  const [sent, setSent] = React.useState(false);
  // Each link is tried once per page, however often this renders.
  const tried = React.useRef<string>(undefined);

  React.useEffect(
    () => {
      if (linkToken === null) {
        // No token at all (say, the page was opened in another tab): show the "not valid" screen.
        setOutcome("invalid");
        return;
      }
      if (!linkToken || tried.current === linkToken) {
        return;
      }
      tried.current = linkToken;

      (async function () {
        // The session is bound to a key this browser keeps. Without one, the link stays unused for another browser.
        let key;
        try {
          key = await newSessionKey();
        } catch {
          setOutcome("no-key");
          return;
        }

        // A reload of this page repeats the same request, which signs in again instead of "already used".
        const entered = await enter(linkToken, key);
        if (!entered.ok) {
          if (entered.code === "link_expired") {
            setOutcome("expired");
            return;
          }
          setOutcome("invalid");
          error(entered.code === "invalid_link" ? INVALID_LINK : entered.message);
          return;
        }

        signIn({ profile: entered.user, userToken: entered.userToken });

        if (entered.party) {
          navigate(`/p/${entered.party}`);
        }
        else {
          setTimeout(() => navigate('/'), 750);
        }
      })();
    },
    [
      linkToken,
      error,
      signIn,
      enter,
      navigate,
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

  const resend = React.useCallback(
    async () => {
      if (!linkToken) {
        return;
      }

      setResending(true);
      let ok;
      try {
        // The API opens the expired link and emails a new one to the address and party inside it.
        ok = await enterAgain(linkToken, resendKey.current);
      }
      finally {
        setResending(false);
      }
      if (!ok) {
        return;
      }

      setSent(true);

      success("Magic must go on! A new link has just been sent to your email address.");
    },
    [
      success,
      linkToken,
      enterAgain,
    ],
  );

  if (outcome === "working") {
    return (
      <LoginHero>
        <Button variant="brand" size="lg" surface="dark" pill loading>
          Enter with your email address
        </Button>
      </LoginHero>
    );
  }

  return (
    <Hero size={"fullheight"} className="enter-container">
      <Hero.Body>
        <Container>
          <Columns vCentered breakpoint={"tablet"}>
            <Columns.Column mobile={{ textAlign: "center" }} tablet={{ textAlign: "center" }} desktop={{ textAlign: "right", size: 5 }}>
              <Image src={image.src} alt="Magic isn't working anymore" />
            </Columns.Column>
            <Columns.Column>
              <Content>
                <h1>Hey beautiful angel!<br />Or maybe you're a lost soul?</h1>

                {outcome === "no-key"
                  ? <p>{NO_KEY_MESSAGE}</p>
                  : (
                    <p>
                      It seems like the magic isn't working anymore.
                      {" "}
                      {outcome === "expired" ? <>Perhaps the link you're trying to use is expired.</> : <>Something is telling me that the link you're trying to use is not valid.</>}
                    </p>
                  )}

                {sent && <p>Good news! We have just sent you a new, better, more magic powered link! Check out your mailbox and follow the rabbit...</p>}

                <div className="actions">
                  {(outcome === "expired" && !sent)
                    ? (
                      <Button variant="brand" size="lg" pill onClick={resend} loading={resending} disabled={sent}>
                        &mdash; Send me that magic again<span className="max-tablet:hidden">, por favor</span>!
                      </Button>
                    )
                    : (
                      <Button variant="secondary" pill onClick={goHome}>
                        <span className="tablet:hidden">Get me home!</span><span className="max-tablet:hidden">Take me home, country roads!</span>
                      </Button>
                    )}
                </div>

              </Content>
            </Columns.Column>
          </Columns>
        </Container>
      </Hero.Body>
      <Hero.Footer>
        <Footer noUser profileAsLink>
          <UnsplashCredit id="lNUQnuhqnLQ" name="Annie Spratt" username="anniespratt" />
        </Footer>
      </Hero.Footer>
    </Hero>
  );
};
