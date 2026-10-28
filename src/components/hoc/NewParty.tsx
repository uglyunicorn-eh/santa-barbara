import React from "react";
import { Content } from "@/components/layout";
import { Button } from "@/components/ui/button";
import * as v from "valibot";

import type { Party } from "@/types";
import { DialogBox } from "@/components/DialogBox";
import { HaveQuestion } from "@/components/HaveQuestion";
import { DateTimeInput, FormField, Input, Submit } from "@/components/forms";
import { maxLen, required } from "@/components/forms/messages";
import { useAppClient, useCopyPartyLink } from "@/components/hooks";
import { useNavigate } from "react-router-dom";
import { MAX_DUE_AHEAD_MS, MAX_PARTY_NAME_LENGTH, MAX_PHRASE_LENGTH, MIN_DUE_AHEAD_MS } from "@/limits";

/**
 * The due time: roughly when the host means to roll the dice. The API takes it at least an hour ahead and at most 366
 * days. An empty field is none.
 */
const dueAtField = v.pipe(
  v.string(),
  v.check(value => !value || !Number.isNaN(new Date(value).getTime()), "Party start must be a date and time"),
  v.check(value => !value || new Date(value).getTime() >= Date.now() + MIN_DUE_AHEAD_MS, "Party start must be at least an hour from now"),
  v.check(value => !value || new Date(value).getTime() <= Date.now() + MAX_DUE_AHEAD_MS, "Party start must be within a year"),
);

const schema = v.object({
  name: v.pipe(v.string(), v.nonEmpty(required("Party name")), v.maxLength(MAX_PARTY_NAME_LENGTH, maxLen("Party name", MAX_PARTY_NAME_LENGTH))),
  password: v.pipe(v.string(), v.maxLength(MAX_PHRASE_LENGTH, maxLen("Secret phrase", MAX_PHRASE_LENGTH))),
  dueAt: dueAtField,
});

type FormValues = v.InferOutput<typeof schema>;

const defaultValues: FormValues = {
  name: "Very funny secret party!",
  password: "",
  dueAt: "",
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
        // The field is a local date and time; the API takes an exact moment.
        const dueAt = values.dueAt ? new Date(values.dueAt).toISOString() : undefined;
        const party = await createParty({ name: values.name, password: values.password, dueAt, requestId: requestId.current });
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

  // The sticker copies the party's link (what friends open), not just the code.
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
          // The only button: big, round, centred, with a white ring to keep it clear of the monsters behind it.
          : <Button type="button" variant="primary" size="lg" pill className="min-h-14 px-12 text-2xl ring-8 ring-white max-tablet:w-full" onClick={goToParty}>&#x1F973; Yahooooooo!</Button>
      }
      noDismiss={party !== undefined}
      footerAlign={party ? "center" : "end"}
      footerClassName={party ? "pb-9" : undefined}
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

              <FormField
                name="dueAt"
                label="Party starts"
                children={<DateTimeInput min={new Date(Date.now() + MIN_DUE_AHEAD_MS)} max={new Date(Date.now() + MAX_DUE_AHEAD_MS)} placeholder="Optional" />}
                help="Optional. Roughly when you'll roll the dice: the party page counts down to it, and you get a reminder the day before."
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

              {/* A sticker with its corner lifting, as if you could peel the code off and hand it over: a click copies the party's link. */}
              <button type="button" className="code-sticker" onClick={copyLink} title="Copy the party's link" aria-label={`${party.code}: copy the party's link`}>
                <span className="code-sticker-text">{party.code}</span>
              </button>
            </>
          )}

      </Content>
    </DialogBox>
  )
};
