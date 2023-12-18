import { Columns, Container, Content, Hero } from "react-bulma-components";
import { SyncLoader } from 'react-spinners';

import { Confetti } from "src/components/Confetti";
import { GnomeSays } from "src/components/GnomeSays";
import { SecretText } from "src/components/SecretText";
import { UnsplashCredit } from "src/components/UnsplashCredit";
import { Footer } from "src/components/hoc/Footer";

export const PartyDetails = () => {
  const target = true;

  return (
    <Hero size={"fullheight"} className="party-details">
      <Hero.Body>
        <Container>
          <Columns vCentered>
            <Columns.Column>
              <Content className="has-text-justified has-text-left-touch">
                {/* {
                  party.isClosed
                    ? <PartyIsClosedContent {...{ party, user }} />
                    : party.isHost
                      ? <HostContent {...{ party, user, onFinish }} />
                      : <GuestContent {...{ party, user, onLeave }} />
                } */}
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Possimus porro exercitationem eligendi totam ratione dolores incidunt voluptatibus minus nesciunt magnam quos eius temporibus magni facere, voluptatem aliquid libero, est officia!
              </Content>
            </Columns.Column>
            <Columns.Column size={5} textAlign="centered">
              <GnomeSays>
                <Content>
                  {target
                    ? (
                      <>
                        <p className="has-text-left" style={{ marginBottom: '0.5em' }}>
                          &mdash; Pssss, kid... Are you alone?.. Wanna hear whom you should get a gift?
                        </p>
                        <p className="has-text-right">
                          <SecretText label="&mdash; Yes, please!">
                            <Confetti />

                            <p className="has-text-right" style={{ marginBottom: '0.5em' }}>
                              &mdash; Yes, please!
                            </p>
                            <p className="has-text-left">
                              &mdash; This is <strong>Chuck Norris</strong>, but it's a secret...
                            </p>
                            <p className="has-text-left">
                              Good luck with your ideas and happy holidays!
                            </p>
                          </SecretText>
                        </p>
                      </>
                    )
                    : (
                      <SyncLoader size={10} />
                    )
                  }
                </Content>
              </GnomeSays>
            </Columns.Column>
          </Columns>
        </Container>
      </Hero.Body>
      <Hero.Footer>
        <Footer>
          <UnsplashCredit nickname="joannakosinska" name="Joanna Kosinska" />
        </Footer>
      </Hero.Footer>
    </Hero>
  );
};
