import * as jose from 'jose';
import type { JOSEError } from 'jose/errors';
import React from "react";
import { Button, Columns, Container, Content, Hero, Image, Level } from 'react-bulma-components';
import { useNavigate, useParams } from "react-router-dom";

import { UnsplashCredit } from 'src/components/UnsplashCredit';
import { Footer } from 'src/components/hoc/Footer';
import { useNotifications } from 'src/components/hoc/NotificationsContainer';

import { issuer } from 'src/config.json';
import image from 'src/images/enter.png';

const PUBLIC_KEY = import.meta.env.PUBLIC_KEY.split('\\n').join('\n');

type EnterRequestToken = {
  email: string;
  party?: string;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const EnterContainer = () => {
  const { token } = useParams();
  const { error, success } = useNotifications();
  const navigate = useNavigate();

  const [expiredToken, setExpiredToken] = React.useState<EnterRequestToken>();
  const [busy, setBusy] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  React.useEffect(
    () => {
      if (!token) {
        return;
      }

      (async function () {
        const publicKey = await jose.importSPKI(PUBLIC_KEY, 'RS256');

        try {
          const jwtToken = await jose.jwtVerify<EnterRequestToken>(token, publicKey, { issuer }); //, { currentDate: new Date(1703624459)}
          console.log({ jwtToken });
        }
        catch (e) {
          const { code } = e as JOSEError;

          if (code === 'ERR_JWT_EXPIRED') {
            setExpiredToken(await jose.decodeJwt<EnterRequestToken>(token));
            return;
          }

          error("The magic link you are using is not valid. We are not sure where did you get it from, but it's not working.");
        }

      })();

    },
    [
      token,
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
      setBusy(true);

      await sleep(2000);

      setBusy(false);
      setSent(true);

      success("Magic must go on! A new link has just been sent to your email address.");

      await sleep(10000);

      setSent(false);
    },
    [
      success,
    ],
  );

  return (
    <Hero size={"fullheight"} className="enter-container">
      <Hero.Body>
        <Container>
          <Columns vCentered breakpoint={"tablet"}>
            <Columns.Column mobile={{ textAlign: "center" }} tablet={{ textAlign: "center" }} desktop={{ textAlign: "right" }}>
              <Image src={image.src} alt="Magic isn't working anymore" />
            </Columns.Column>
            <Columns.Column>
              <Content>
                <h1>&mdash; Hey beautiful angel!</h1>

                <p>
                  It seems the magic isn't working anymore.

                  {expiredToken ? <>The link you're trying to use is expired.</> : <>The link you're trying to use is not valid.</>}
                </p>

                <div className="actions">
                  {expiredToken
                    ? (
                      <Button onClick={resend} loading={busy} disabled={busy || sent} color={"primary"} rounded>
                        &mdash; Send me that magic again, por favor!
                      </Button>
                    )
                    : (
                      <Button onClick={goHome} outlined>
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
        <Footer noUser noHome profileAsLink>
          <UnsplashCredit nickname="anniespratt" name="Annie Spratt" />
        </Footer>
      </Hero.Footer>
    </Hero>
  );
};
