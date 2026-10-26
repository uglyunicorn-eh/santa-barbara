import type { JOSEError } from 'jose/errors';
import React from "react";
import { Columns, Container, Content, Hero, Image } from "src/components/bulma";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";

import { UnsplashCredit } from 'src/components/UnsplashCredit';
import { Footer } from 'src/components/hoc/Footer';
import { LoginHero } from 'src/components/hoc/LoginBox';
import { useNotifications } from 'src/components/hoc/NotificationsContainer';
import { newKey } from 'src/api/client';
import { useAppClient, useCurrentUser, useJWT } from 'src/components/hooks';

import image from 'src/images/enter.png';

type EnterRequestToken = {
  email: string;
  party?: string;
}

export const EnterContainer = () => {
  const { token: enterRequestToken } = useParams();
  const { error, success } = useNotifications();
  const navigate = useNavigate();
  const { signIn } = useCurrentUser();
  const { verify, decode, isReady } = useJWT();

  const { enter, enterRequest } = useAppClient();
  // One key for this page's "send a new link" button, so a double click sends one email.
  const resendKey = React.useRef(newKey());
  const [resending, setResending] = React.useState(false);

  const [tokenPayloadUntrusted, setTokenPayloadUntrusted] = React.useState<EnterRequestToken | null>();
  const [tokenPayloadTrusted, setTokenPayloadTrusted] = React.useState<EnterRequestToken | null>();
  const [expiredToken, setExpiredToken] = React.useState<EnterRequestToken>();
  const [sent, setSent] = React.useState(false);

  React.useEffect(
    () => {
      if (!enterRequestToken) {
        return;
      }
      try {
        setTokenPayloadUntrusted(decode(enterRequestToken));
      } catch {
        // A malformed link: null shows the "not valid" screen once verification fails.
        setTokenPayloadUntrusted(null);
      }
    },
    [
      enterRequestToken,
      decode,
    ],
  );

  React.useEffect(
    () => {
      if (!enterRequestToken || !isReady) {
        return;
      }

      (async function () {
        try {
          const payloadTrusted = (await verify<EnterRequestToken>(enterRequestToken)).payload;
          setTokenPayloadTrusted(payloadTrusted);

          // A reload of this page repeats the same request, which signs in again instead of "already used".
          const entered = await enter(enterRequestToken);
          if (!entered.ok) {
            throw new Error(entered.message);
          }

          signIn({ profile: entered.user, userToken: entered.userToken });

          if (payloadTrusted.party) {
            navigate(`/p/${payloadTrusted.party}`);
          }
          else {
            setTimeout(() => navigate('/'), 750);
          }
        }
        catch (e) {
          setTokenPayloadTrusted(null);

          const { code } = e as JOSEError;
          if (code === 'ERR_JWT_EXPIRED') {
            setExpiredToken(decode<EnterRequestToken>(enterRequestToken));
            return;
          }
          error("The magic link you are using is not valid. We are not sure where did you get it from, but it's not working.");
        }
      })();
    },
    [
      isReady,
      enterRequestToken,
      verify,
      decode,
      signIn,
      enter,
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
      if (!expiredToken) {
        return;
      }

      const input = {
        email: expiredToken.email,
        party: expiredToken.party,
      };

      setResending(true);
      try {
        await enterRequest(input, resendKey.current);
      }
      finally {
        setResending(false);
      }

      setSent(true);

      success("Magic must go on! A new link has just been sent to your email address.");
    },
    [
      success,
      expiredToken,
      enterRequest,
    ],
  );

  if (tokenPayloadUntrusted === undefined) {
    return <></>;
  }

  if (tokenPayloadTrusted === undefined || tokenPayloadTrusted) {
    return (
      <LoginHero>
        <Button variant="primary" size="lg" surface="dark" pill loading>
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

                <p>
                  It seems like the magic isn't working anymore.
                  {" "}
                  {expiredToken ? <>Perhaps the link you're trying to use is expired.</> : <>Something is telling me that the link you're trying to use is not valid.</>}
                </p>

                {sent && <p>Good news! We have just sent you a new, better, more magic powered link! Check out your mailbox and follow the rabbit...</p>}

                <div className="actions">
                  {(expiredToken && !sent)
                    ? (
                      <Button variant="primary" size="lg" pill onClick={resend} loading={resending} disabled={sent}>
                        &mdash; Send me that magic again, por favor!
                      </Button>
                    )
                    : (
                      <Button variant="secondary" size="lg" onClick={goHome}>
                        &larr; Take me home, country roads!
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
