import React from "react";
import { Columns, Content } from "@/components/layout";
import { useNavigate } from "react-router";

import { DialogBox } from "@/components/DialogBox";
import { Submit } from "@/components/forms";
import { usePartyContext } from "@/components/hoc/PartyContext";
import { useAppClient } from "@/components/hooks";

import SantaImg from "@/images/santa.png";

const defaultValues = {};

export const ConfirmPartyLeave = () => {
  const { party } = usePartyContext();
  const { leaveParty } = useAppClient();
  const navigate = useNavigate();

  const onSubmit = React.useCallback(
    async () => {
      if (!party?.code) {
        return;
      }

      if (await leaveParty({ party: party.code })) {
        navigate("/");
      }
    },
    [
      party?.code,
      leaveParty,
      navigate,
    ],
  );

  return (
    <DialogBox
      className="party-box confirm-party-leave"
      title="Ouch... Not funny :("
      action={<Submit>&#x1F44B; Bye-e-e! See ya later!</Submit>}
      dismissLabel="That was an accident..."
      dismissLocation={`/p/${party?.code}`}
      form={{
        defaultValues,
        onSubmit,
      }}
      size="md"
    >
      <Columns>
        <Columns.Column narrow mobile={{ display: 'hidden' }} className="tablet:flex">
          <img src={SantaImg.src} alt="Santa" width={200} />
        </Columns.Column>
        <Columns.Column>
          <Content>

            <p>
              Sorry to see you're leaving...
            </p>

            <p>
              But we understand; fun is not for everyone. If you change your mind again (it happened to me once), feel
              free to join the party again while it's still open.
            </p>

            <p>
              <strong>Enjoy your holidays! Bye!</strong>
            </p>

          </Content>
        </Columns.Column>
      </Columns>
    </DialogBox>
  )
};
