import React from "react";
import * as v from "valibot";
import { useNavigate } from "react-router-dom";

import { DialogBox } from "@/components/DialogBox";
import { EmailTags, FormField, Submit, looksLikeEmail } from "@/components/forms";
import { usePartyContext } from "@/components/hoc/PartyContext";
import { useNotifications } from "@/components/hoc/NotificationsContainer";
import { useAppClient } from "@/components/hooks";
import { Content } from "@/components/layout";
import { MAX_EMAIL_LENGTH, MAX_INVITES_PER_REQUEST } from "@/limits";

const schema = v.object({
  emails: v.pipe(
    v.array(v.string()),
    v.minLength(1, "Add at least one email address."),
    v.maxLength(MAX_INVITES_PER_REQUEST, `You can invite up to ${MAX_INVITES_PER_REQUEST} people at a time.`),
    v.check(emails => emails.every(looksLikeEmail), "Fix or remove the addresses in red."),
  ),
});

type Values = v.InferOutput<typeof schema>;

const defaultValues: Values = { emails: [] };

const people = (n: number) => `${n} ${n === 1 ? "person" : "people"}`;

/**
 * "Invite by email" (the host's ☰ menu, at ./invite): up to 10 addresses as tags. The API queues an email to each,
 * skipping members and anyone invited in the last day; the toast says how it went, and the dialog closes.
 */
export const InvitePartyDialog = () => {
  const { party } = usePartyContext();
  const { inviteToParty } = useAppClient();
  const { success, info } = useNotifications();
  const navigate = useNavigate();
  const partyPath = `/p/${party?.code}/`;

  const onSubmit = React.useCallback(
    async ({ emails }: Values) => {
      if (!party) {
        return;
      }
      const result = await inviteToParty({ code: party.code, emails });
      if (!result) {
        return;
      }
      const skipped = [
        result.alreadyJoined.length ? `${people(result.alreadyJoined.length)} already joined` : "",
        result.alreadyInvited.length ? `${people(result.alreadyInvited.length)} already got an invite today` : "",
      ].filter(Boolean).join(", and ");
      if (result.invited.length) {
        success(`Invites are on their way to ${people(result.invited.length)}!${skipped ? ` (${skipped}.)` : ""}`);
      } else {
        info(`Nobody new to invite: ${skipped}.`);
      }
      navigate(partyPath);
    },
    [party, inviteToParty, success, info, navigate, partyPath],
  );

  return (
    <DialogBox
      className="party-box"
      title="Invite friends by email"
      dismissLocation={partyPath}
      action={<Submit>✉️ Send invites</Submit>}
      form={{ schema, defaultValues, onSubmit, mode: "onSubmit" }}
      size="sm"
    >
      <Content>
        <p>
          We'll email each of them a link to <strong className="wrap-anywhere">{party?.name}</strong>
          {party?.isProtected ? <>. The secret phrase isn't in it: tell them yourself.</> : "."}
        </p>
        <FormField
          name="emails"
          label="Emails"
          horizontal={false}
          help={`Up to ${MAX_INVITES_PER_REQUEST} at a time. Paste a list, or press Enter after each one.`}
        >
          <EmailTags max={MAX_INVITES_PER_REQUEST} maxLength={MAX_EMAIL_LENGTH} placeholder="friend@example.com" autofocus />
        </FormField>
      </Content>
    </DialogBox>
  );
};
