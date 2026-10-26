import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { DialogBox, DialogFooterStart } from "@/components/DialogBox";
import { Content } from "@/components/layout";
import { SnowConfetti } from "@/components/SnowConfetti";
import { UnsplashCredit } from "@/components/UnsplashCredit";
import { useAppClient } from "@/components/hooks";

/**
 * "The dice are rolled": the message the party's email brings, opened from a reminder on the home screen. It reads
 * like the email itself (who it's from, the subject, a stamp), over a bed of envelopes that fills the page. Its button
 * goes to the party, where the gnome tells whom to give a gift to; the X closes it.
 *
 * `onParty`: opened on the party page itself, the moment the host rolled the dice (PartyDetails), with stars falling.
 * Then closing it, or its button, just shows the party underneath.
 */
export const RolledDialog = ({ onParty = false }: { onParty?: boolean }) => {
  const { code } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { getParty } = useAppClient();
  const [name, setName] = React.useState<string | undefined>((location.state as { name?: string } | null)?.name);

  // Opened from a link rather than the reminder: ask the party its name.
  React.useEffect(
    () => {
      if (!name && code) {
        getParty(code).then(party => party && setName(party.name));
      }
    },
    [name, code, getParty],
  );

  const partyPath = `/p/${code}/`;

  return (
    <>
      {onParty && <SnowConfetti overDialogs />}
      <DialogBox
      className="rolled-box"
      backdropClassName="rolled-backdrop"
      title="This is it! The message you've been waiting for!"
      noDismiss
      dismissLocation={onParty ? partyPath : "/"}
      action={<Button variant="primary" onClick={() => navigate(partyPath)}>{onParty ? "🦄 Ask the Gnomik!" : "🦄 Get me to the Gnomik!"}</Button>}
      size="sm"
    >
      <article className="rolled-mail">
        <span className="rolled-stamp" aria-hidden="true">🎲</span>
        <dl className="rolled-mail-head">
          <div><dt>From</dt><dd>The elves of Gnomik</dd></div>
          <div><dt>To</dt><dd>You, beautiful person</dd></div>
          <div><dt>Subject</dt><dd className="wrap-anywhere">{name ?? "It's time!"}</dd></div>
        </dl>
        <Content className="rolled-message">
          <p>Good day, beautiful person!</p>
          <p>We have some wonderful news to share... <strong>It's time!</strong> It's time to make someone happy!</p>
          <p>
            Our elves have just finished their complex calculations{name ? <> for <strong className="wrap-anywhere">{name}</strong></> : null},
            and now they know your person of interest! Simply follow the link below and ask the gnome for the answer to
            the most mysterious question of the Universe...
          </p>
        </Content>
      </article>
      <DialogFooterStart>
        <div className="text-xs text-zinc-600"><UnsplashCredit id="uGcDWKN91Fs" name="Joanna Kosinska" username="joannakosinska" /></div>
      </DialogFooterStart>
      </DialogBox>
    </>
  );
};
