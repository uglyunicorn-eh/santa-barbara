import { gql, useMutation } from '@apollo/client';
import type { JOSEError } from 'jose/errors';
import React from "react";
import { Button, Columns, Container, Content, Hero, Image } from 'react-bulma-components';
import { useNavigate, useParams } from "react-router-dom";

import { UnsplashCredit } from 'src/components/UnsplashCredit';
import { Footer } from 'src/components/hoc/Footer';
import { useNotifications } from 'src/components/hoc/NotificationsContainer';
import { useCurrentUser, useJWT } from 'src/components/hooks';

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

  const [enterRequest, { loading: enterRequestLoading }] = useMutation(
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

  const [enter, { loading: enterLoading }] = useMutation(
    gql`
      mutation Enter($input: EnterInput!) {
        auth {
          enter(input: $input) {
            userToken
            user {
              id
              name
            }

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

  const [expiredToken, setExpiredToken] = React.useState<EnterRequestToken>();
  const [sent, setSent] = React.useState(false);

  const isPageLoading = enterLoading || !isReady;

  React.useEffect(
    () => {
      if (!enterRequestToken || !isReady) {
        return;
      }

      (async function () {
        try {
          await verify<EnterRequestToken>(enterRequestToken);

          const { data: { auth: { enter: { userToken, user } } } } = await enter({ variables: { input: { enterRequestToken } } });

          signIn({ profile: user, userToken });

          // navigate("/");
        }
        catch (e) {
          const { code } = e as JOSEError;

          if (code === 'ERR_JWT_EXPIRED') {
            setExpiredToken(await decode<EnterRequestToken>(enterRequestToken));
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
                      <Button onClick={resend} loading={enterRequestLoading} disabled={enterRequestLoading || sent} color={"primary"} rounded>
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
        <Footer noUser profileAsLink>
          <UnsplashCredit nickname="anniespratt" name="Annie Spratt" />
        </Footer>
      </Hero.Footer>
    </Hero>
  );
};
