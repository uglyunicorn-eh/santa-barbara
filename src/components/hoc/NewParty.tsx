import React from "react";
import { Content } from "@/components/layout";
import { Button } from "@/components/ui/button";
import * as v from "valibot";

import type { Party } from "@/types";
import { DialogBox, DialogFooterStart } from "@/components/DialogBox";
import { Link2 } from "react-feather";
import { HaveQuestion } from "@/components/HaveQuestion";
import { FormField, Input, Submit } from "@/components/forms";
import { maxLen, required } from "@/components/forms/messages";
import { useAppClient, useCopyPartyLink } from "@/components/hooks";
import { useNavigate } from "react-router-dom";
import { MAX_PARTY_NAME_LENGTH, MAX_PHRASE_LENGTH } from "@/limits";

const schema = v.object({
  name: v.pipe(v.string(), v.nonEmpty(required("Party name")), v.maxLength(MAX_PARTY_NAME_LENGTH, maxLen("Party name", MAX_PARTY_NAME_LENGTH))),
  password: v.pipe(v.string(), v.maxLength(MAX_PHRASE_LENGTH, maxLen("Secret phrase", MAX_PHRASE_LENGTH))),
});

type FormValues = v.InferOutput<typeof schema>;

const defaultValues: FormValues = {
  name: "Very funny secret party!",
  password: "",
};

export const NewParty = () => {
  const { createParty } = useAppClient();
  const navigate = useNavigate();
  const [party, setParty] = React.useState<Party | undefined>(undefined);

  // A double click or a repeated Enter can fire a second submit before the form re-renders as busy; each one would create a party.
  const submitting = React.useRef(false);
  // The API returns the same party for a repeated request id, so even a request that was sent twice makes one party.
  const requestId = React.useRef(crypto.randomUUID());

  const onSubmit = React.useCallback(
    async (values: FormValues) => {
      // The party is made; the form stays mounted under the congratulations, so ignore any later submit.
      if (submitting.current || party) {
        return;
      }
      submitting.current = true;
      try {
        const party = await createParty({ ...values, requestId: requestId.current });
        if (!party) {
          return;
        }
        setParty(party);
      } finally {
        submitting.current = false;
      }
    },
    [
      createParty,
      party,
    ],
  );

  const copyLink = useCopyPartyLink(party ?? { code: "", isProtected: false });

  const goToParty = React.useCallback(
    () => {
      if (!party) {
        return;
      }
      navigate(`/p/${party.code}`);
    },
    [
      navigate,
      party,
    ],
  );

  return (
    <DialogBox
      className={["party-box"].concat(party ? ["congratz-box"] : []).join(" ")}
      title={!party ? "Let's start a new party!" : "Congratz!"}
      action={
        !party
          ? <Submit>&#x1F389; Rock'n'Roll!</Submit>
          // Still inside the form: without type="button" it would submit it again.
          // A white ring keeps it clear of the monsters behind it.
          : <Button type="button" variant="primary" className="ring-8 ring-white" onClick={goToParty}>&#x1F973; Yahooooooo!</Button>
      }
      noDismiss={party !== undefined}
      dismissLocation={party ? `/p/${party.code}` : "/"}
      form={{
        schema,
        defaultValues,
        onSubmit,
      }}
      size="sm"
    >
      <Content>
        {!party
          ? (
            <>
              <FormField
                name="name"
                label="Party name"
                children={<Input autofocus maxLength={MAX_PARTY_NAME_LENGTH} />}
              />

              <FormField
                name="password"
                label="Secret phrase"
                children={<Input placeholder="Optional" maxLength={MAX_PHRASE_LENGTH} />}
                help="Everyone must know this phrase for entry. Leave it blank to allow access via a shared link."
              />
              <HaveQuestion />
            </>
          )
          : (
            <>
              <p>
                We have successfully created your new party {party.name.replace(/!+$/, '')}!
              </p>

              <p>
                Here's your party's secret code:
              </p>

              {/* A sticker with its corner lifting, as if you could peel the code off and hand it over. */}
              <div className="code-sticker">
                <span className="code-sticker-text">{party.code}</span>
              </div>

              <DialogFooterStart>
                <Button type="button" variant="ghost" className="bg-white/90 ring-8 ring-white/90" onClick={copyLink}>
                  <Link2 size={18} aria-hidden="true" /> Copy link
                </Button>
              </DialogFooterStart>
            </>
          )}

      </Content>
    </DialogBox>
  )
};
