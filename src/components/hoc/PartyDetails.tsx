import { Columns, Container, Content, Hero } from "react-bulma-components";
import DocumentMeta from "react-document-meta";
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
  const { profile } = useCurrentUser();

  return (
    <DocumentMeta title={party.name}>
      <Hero size={"fullheight"} className="party-details">
        <Hero.Body>
          <Container>
            <Columns vCentered breakpoint="desktop">
              <Columns.Column size={1}>
                &nbsp;
              </Columns.Column>
              <Columns.Column>
                <Content className="party-details-content">
                  <h1 className="has-text-centered is-visible-mobile">{party.name}</h1>
                  {profile && (
                    party.isClosed
                      ? <PartyIsClosedContent {...{ party, user: profile }} />
                      : party.isHost
                        ? <HostContent {...{ party, user: profile }} />
                        : <GuestContent {...{ party, user: profile }} />
                  )}
                </Content>
              </Columns.Column>
              <Columns.Column desktop={{ size: 5 }} textAlign={"center"}>
                <GnomeSays>
                  <Content>
                    {party.isClosed && party.target
                      ? (
                        <div className="has-text-right">
                          <p className="has-text-left" style={{ marginBottom: '0.5em' }}>
                            &mdash; Pssss, kid... Are you alone?.. Wanna hear whom you should get a gift?
                          </p>
                          <SecretText label="&mdash; Yes, please! &#x1F929;">
                            <Confetti />

                            <p className="has-text-right" style={{ marginBottom: '0.5em' }}>
                              &mdash; Yes, please!
                            </p>
                            <p className="has-text-left">
                              &mdash; This is <strong>{party.target.name}</strong>, but it's a secret...
                              Good luck with your gift ideas!
                            </p>

                            <p className="has-text-left">
                              &mdash; If you enjoyed this experience, please consider supporting me by {" "}
                              <a href="https://www.buymeacoffee.com/uglyunicorn" target="_blank">buying me a coffee &#9749;</a>!
                            </p>
                          </SecretText>
                        </div>
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
    </DocumentMeta>
  );
};
