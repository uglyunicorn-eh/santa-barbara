import { Columns, Container, Content, Hero } from "react-bulma-components";
import { SyncLoader } from 'react-spinners';

import type { Party } from "src/types";
import { Confetti } from "src/components/Confetti";
import { GnomeSays } from "src/components/GnomeSays";
import { SecretText } from "src/components/SecretText";
import { UnsplashCredit } from "src/components/UnsplashCredit";
import { Footer } from "src/components/hoc/Footer";

type Props = {
  party: Party;
}

export const PartyDetails = ({ party }: Props) => {
  return (
    <Hero size={"fullheight"} className="party-details">
      <Hero.Body>
        <Container>
          <Columns vCentered>
            <Columns.Column>
              <Content className="has-text-justified has-text-left-touch">
                {
                  party.closed
                    ? <>PARTY IS CLOSED</> // <PartyIsClosedContent {...{ party, user }} />
                    : party.host
                      ? <>YOU HOST A PARTY</> // <HostContent {...{ party, user, onFinish }} />
                      : <>YOU ARE A GUEST</> // <GuestContent {...{ party, user, onLeave }} />
                }
              </Content>
            </Columns.Column>
            <Columns.Column size={5} textAlign="centered">
              <GnomeSays>
                <Content>
                  {party.target
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
                              &mdash; This is <strong>{party.target.name}</strong>, but it's a secret...
                              Good luck with your gift ideas!
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
