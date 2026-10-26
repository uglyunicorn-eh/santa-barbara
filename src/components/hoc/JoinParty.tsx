import React from "react";
import { Content } from "@/components/layout";
import * as v from "valibot";

import { DialogBox } from "@/components/DialogBox";
import { FormField, Input, Submit } from "@/components/forms";
import { maxLen, required } from "@/components/forms/messages";
import { HaveQuestion } from "@/components/HaveQuestion";
import { useAppClient } from "@/components/hooks";
import { useNotifications } from "@/components/hoc/NotificationsContainer";
import { useNavigate } from "react-router";
import { MAX_PARTY_CODE_LENGTH } from "@/limits";

const schema = v.object({
  code: v.pipe(
    v.string(),
    v.nonEmpty(required("Secret code")),
    v.maxLength(MAX_PARTY_CODE_LENGTH, maxLen("Secret code", MAX_PARTY_CODE_LENGTH)),
    // New parties have 8-letter codes; older ones keep their 5 letters.
    v.regex(/^(?:[QWERTYUIPASDFGHJKLZXCVBNMO]{5}|[QWERTYUIPASDFGHJKLZXCVBNMO]{8})$/i, "Invalid secret code"),
  ),
});

type FormValues = v.InferOutput<typeof schema>;

const defaultValues: FormValues = {
  code: "",
};

export const JoinParty = () => {
  const { getParty } = useAppClient();
  const { error } = useNotifications();
  const navigate = useNavigate();

  const onSubmit = React.useCallback(
    async (values: FormValues) => {
      const party = await getParty(values.code);
      if (party) {
        navigate(`/p/${party.code}`);
      }
      else {
        error("Hm... we cannot find any party for the code. Please check the code and try again...");
      }
    },
    [
      getParty,
      error,
      navigate,
    ],
  );

  return (
    <DialogBox
      className="party-box"
      title="Join a party!"
      action={<Submit>&#x1F973; Here I come!</Submit>}
      form={{
        schema,
        defaultValues,
        onSubmit,
      }}
      cardStyle={{
        width: 600,
      }}
    >
      <Content>
        <FormField
          name="code"
          label="Secret code"
          children={<Input maxLength={MAX_PARTY_CODE_LENGTH} style={{ textTransform: "uppercase" }} />}
          help="Your friend probably told you a secret code. This is the right place to put it..."
        />
        <HaveQuestion />

      </Content>
    </DialogBox>
  )
};
