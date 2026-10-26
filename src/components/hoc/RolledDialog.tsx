import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { DialogBox, DialogFooterStart } from "@/components/DialogBox";
import { Content } from "@/components/layout";
import { UnsplashCredit } from "@/components/UnsplashCredit";
import { useAppClient } from "@/components/hooks";

/**
 * "The dice are rolled": the message the party's email brings, opened from a reminder on the home screen, on a bed of
 * envelopes. Its button goes to the party, where the gnome tells whom to give a gift to.
 */
export const RolledDialog = () => {
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

  return (
    <DialogBox
      className="rolled-box"
      title="This is it! The message you've been waiting for!"
      dismissLabel="Later"
      action={<Button variant="primary" onClick={() => navigate(`/p/${code}/`)}>🦄 Get me to the Gnomik!</Button>}
      size="sm"
    >
      <Content className="rolled-message">
        <p>Good day, beautiful person!</p>
        <p>We have some wonderful news to share... <strong>It's time!</strong> It's time to make someone happy!</p>
        <p>
          Our elves have just finished their complex calculations{name ? <> for <strong className="wrap-anywhere">{name}</strong></> : null},
          and now they know your person of interest! Simply follow the link below and ask the gnome for the answer to
          the most mysterious question of the Universe...
        </p>
      </Content>
      <DialogFooterStart>
        <div className="text-xs text-zinc-600"><UnsplashCredit id="uGcDWKN91Fs" name="Joanna Kosinska" username="joannakosinska" /></div>
      </DialogFooterStart>
    </DialogBox>
  );
};
