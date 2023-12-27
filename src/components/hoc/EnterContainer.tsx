import { gql, useMutation } from '@apollo/client';
import * as jose from 'jose';
import type { JOSEError } from 'jose/errors';
import React from "react";
import { Button, Columns, Container, Content, Hero, Image, Level } from 'react-bulma-components';
import { useNavigate, useParams } from "react-router-dom";

import { UnsplashCredit } from 'src/components/UnsplashCredit';
import { Footer } from 'src/components/hoc/Footer';
import { useNotifications } from 'src/components/hoc/NotificationsContainer';
import { useCurrentUser } from 'src/components/hooks';

import { issuer } from 'src/config.json';
import image from 'src/images/enter.png';

const PUBLIC_KEY = import.meta.env.PUBLIC_KEY.split('\\n').join('\n');

type EnterRequestToken = {
  email: string;
  party?: string;
}

export const EnterContainer = () => {
  const { token } = useParams();
  const { error, success } = useNotifications();
  const navigate = useNavigate();
  const { user } = useCurrentUser();

  const [expiredToken, setExpiredToken] = React.useState<EnterRequestToken>();
  const [sent, setSent] = React.useState(false);

  React.useEffect(
    () => {
      if (!token) {
        return;
      }

      (async function () {
        const publicKey = await jose.importSPKI(PUBLIC_KEY, 'RS256');

        try {
          const jwtToken = await jose.jwtVerify<EnterRequestToken>(token, publicKey, { issuer });
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

  React.useEffect(
    () => {
      if (user && expiredToken && navigate) {
        if (user.email === expiredToken.email) {
          navigate('/');
        }
      }
    },
    [
      user,
      expiredToken,
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

  const [enterRequest, { loading }] = useMutation(
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

  const resend = React.useCallback(
    async () => {
      if (!expiredToken) {
        return;
      }

      const input = {
        email: expiredToken.email,
        party: expiredToken.party,
      };

      await enterRequest({ variables: { input } });

      setSent(true);

      success("Magic must go on! A new link has just been sent to your email address.");
    },
    [
      success,
      expiredToken,
      enterRequest,
    ],
  );

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
                      <Button onClick={resend} loading={loading} disabled={loading || sent} color={"primary"} rounded>
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
