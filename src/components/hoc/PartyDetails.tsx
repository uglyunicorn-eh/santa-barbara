import React from "react";
import { Columns, Container, Content, Hero } from "@/components/layout";
import { SyncLoader } from 'react-spinners';

import { Confetti } from "@/components/Confetti";
import { GnomeSays } from "@/components/GnomeSays";
import { SecretText } from "@/components/SecretText";
import { UnsplashCredit } from "@/components/UnsplashCredit";
import { Footer } from "@/components/hoc/Footer";
import GuestContent from "@/components/hoc/GuestContent";
import HostContent from "@/components/hoc/HostContent";
import { DeletedPartyContent } from "@/components/hoc/DeletedPartyContent";
import { PartyIsClosedContent } from "@/components/hoc/PartyIsClosedContent";
import { useToastSurface } from "@/components/hoc/NotificationsContainer";
import { useAppClient, useCurrentUser } from "@/components/hooks";
import type { Party } from "@/types";

type Props = {
  party: Party;
}

export const PartyDetails = ({ party }: Props) => {
  const { profile } = useCurrentUser();
  // The party page is the light one: its toasts are white.
  useToastSurface("light");
  const { markRevealed } = useAppClient();
  // The user heard whom they give a gift to: no more reminders about this party.
  const onReveal = React.useCallback(() => { markRevealed(party.code); }, [markRevealed, party.code]);

  return (
    <>
      <title>{party.name}</title>
      <Hero size={"fullheight"} className="party-details">
        <Hero.Body>
          <Container>
            <Columns vCentered breakpoint="desktop">
              <Columns.Column size={1}>
                &nbsp;
              </Columns.Column>
              <Columns.Column>
                <Content className="party-details-content">
                  <h1 className="text-center">{party.name}</h1>
                  {profile && (
                    party.deletedAt
                      ? <DeletedPartyContent {...{ party, user: profile }} />
                      : party.isClosed
                      ? <PartyIsClosedContent {...{ party, user: profile }} />
                      : party.isHost
                        ? <HostContent {...{ party, user: profile }} />
                        : <GuestContent {...{ party, user: profile }} />
                  )}
                </Content>
              </Columns.Column>
              <Columns.Column desktop={{ size: 5 }} textAlign={"center"}>
                {/* A deleted party has no name to tell: the gnome stays quiet. */}
                <GnomeSays silent={!!party.deletedAt}>
                  <Content>
                    {party.isClosed && party.target
                      ? (
                        <div className="text-right">
                          <p className="text-left" style={{ marginBottom: '0.5em' }}>
                            &mdash; Pssss, kid... Are you alone?.. Wanna hear whom you should get a gift?
                          </p>
                          <SecretText label="&mdash; Yes, please! &#x1F929;" onReveal={onReveal}>
                            <Confetti />

                            <p className="text-right" style={{ marginBottom: '0.5em' }}>
                              &mdash; Yes, please!
                            </p>
                            <p className="text-left">
                              &mdash; This is <strong>{party.target.name}</strong>, but it's a secret...
                              Good luck with your gift ideas!
                            </p>

                            <p className="text-left">
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
            <UnsplashCredit id="78uNJt1kPw8" name="Joanna Kosinska" username="joannakosinska" />
          </Footer>
        </Hero.Footer>
      </Hero>
    </>
  );
};
