import { Columns, Container, Content, Hero } from "react-bulma-components";
import { SyncLoader } from 'react-spinners';

import { Confetti } from "src/components/Confetti";
import { GnomeSays } from "src/components/GnomeSays";
import { SecretText } from "src/components/SecretText";
import { UnsplashCredit } from "src/components/UnsplashCredit";
import { Footer } from "src/components/hoc/Footer";
import GuestContent from "src/components/hoc/GuestContent";
import HostContent from "src/components/hoc/HostContent";
import { PartyIsClosedContent } from "src/components/hoc/PartyIsClosedContent";
import { useCurrentUser } from "src/components/hooks";
import type { Party } from "src/types";

type Props = {
  party: Party;
}

export const PartyDetails = ({ party }: Props) => {
  const { user } = useCurrentUser();

  return (
    <Hero size={"fullheight"} className="party-details">
      <Hero.Body>
        <Container>
          <Columns vCentered>
            <Columns.Column size={1}>
              &nbsp;
            </Columns.Column>
            <Columns.Column>
              <Content className="party-details-content">
                {user && (
                  party.closed
                    ? <PartyIsClosedContent {...{ party, user }} />
                    : party.host
                      ? <HostContent {...{ party, user }} />
                      : <GuestContent {...{ party, user }} />
                )}
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
