import React from "react";
import { useNavigate } from "react-router-dom";
import * as v from "valibot";

import { newKey } from "@/api/client";
import { GrinchDialog } from "@/components/GrinchBox";
import { SnowConfetti } from "@/components/SnowConfetti";
import { Form } from "@/components/forms/Form";
import { FormField } from "@/components/forms/FormField";
import { Input } from "@/components/forms/Input";
import { Submit } from "@/components/forms/Submit";
import { maxLen, required, validEmail } from "@/components/forms/messages";
import { useNotifications } from "@/components/hoc/NotificationsContainer";
import { useAppClient } from "@/components/hooks";
import type { EnterRequestInput } from "@/components/hooks/useAppClient";
import { Button } from "@/components/ui/button";
import { MAX_EMAIL_LENGTH } from "@/limits";

// The sign-in form, in the Grinch's dialog over the front door. A module of its own: it brings the form libraries and
// the dialog, which the front door loads in the background rather than before it can show (LoginBox).

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const schema = v.object({
  email: v.pipe(
    v.string(),
    v.nonEmpty(required("Email")),
    v.maxLength(MAX_EMAIL_LENGTH, maxLen("Email", MAX_EMAIL_LENGTH)),
    v.email(validEmail("Email")),
  ),
});

export const EnterForm = () => {
  const { error } = useNotifications();
  const navigate = useNavigate();
  const { enterRequest } = useAppClient();
  const requestKey = React.useRef(newKey());
  const [sentTo, setSentTo] = React.useState<string>();

  const onSubmit = React.useCallback(
    async (input: EnterRequestInput) => {
      const submit = async () => {
        // One key per submission: a retry or a double click sends one email; submitting again later sends another.
        const sent = await enterRequest(input, requestKey.current);
        requestKey.current = newKey();
        if (!sent) {
          error("Unable to send magic link. Please try again in a bit. If you still see this message, please contact support at info@gnomik.me");
        }
        return sent;
      };

      const [, sent] = await Promise.all([
        sleep(1000),
        submit(),
      ]);
      // Only a sent link turns the form into "check your inbox"; after an error the form stays, to try again.
      if (sent) {
        setSentTo(input.email);
      }
    },
    [
      error,
      enterRequest,
    ],
  );

  const goHome = React.useCallback(() => navigate('/'), [navigate]);

  return (
    <GrinchDialog closeTo="/" className="login-dialog">
      {sentTo
        ? (
          <>
            <h2>HO-HO-HO!</h2>
            <br />
            <p>Our team of elves has just sent you a magic link to {sentTo}. Please check your inbox and follow the instructions.</p>
            <p>If you didn't receive anything from us, refresh this page and try again.</p>

            <Button variant="secondary" surface="dark" pill onClick={goHome}>Return back to home</Button>

            <SnowConfetti />
          </>
        )
        : (
          <Form
            defaultValues={{ email: "" }}
            schema={schema}
            onSubmit={onSubmit}
          >
            <h2>Enter with your email address</h2>

            <FormField
              name="email"
              horizontal={false}
              surface="dark"
              size="lg"
              children={<Input autofocus placeholder="Email address for a magic link" maxLength={MAX_EMAIL_LENGTH} />}
            />

            <p>Enter your email address above and we'll send you a magic link to sign in.</p>
            <p>We promise not to send you any marketing materials or share your personal data with third parties. No tracking cookies either: we only keep what's needed to sign you in.</p>

            <div className="actions flex flex-col items-center gap-3">
              <Submit variant="brand" size="lg" surface="dark" pill>Send me a magic link!</Submit>
            </div>

            <p className="legal">
              By entering, you confirm you're 18 or older and agree to
              our <a href="/terms/">Terms</a> and <a href="/privacy/">Privacy&nbsp;Policy</a>.
            </p>
          </Form>
        )
      }
    </GrinchDialog>
  )
}
