import React from "react";
import { Button } from "@/components/ui/button";
import { useWatch } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import * as v from "valibot";
import { ClipLoader } from 'react-spinners';

import { GrinchBox } from "@/components/GrinchBox";
import { SnowConfetti } from "@/components/SnowConfetti";
import { Form, FormField, Input, Submit } from "@/components/forms";
import { LoginHero } from "@/components/hoc/LoginBox";
import { useAppClient, useCurrentUser } from "@/components/hooks";
import type { LinkResult } from "@/components/hooks/useAppClient";
import { useLinkToken } from "@/components/hooks/useLinkToken";

const INCOMPLETE = "This link is incomplete. Please open it from the email again.";

/**
 * Runs a confirmation link once (`run` is called with the link's token, see useLinkToken) and shows the outcome. The
 * links work in any browser, signed in or not: the token alone identifies the account.
 */
const useLinkResult = <T,>(path: string, run: (token: string) => Promise<LinkResult<T>>) => {
  const token = useLinkToken(path);
  const [result, setResult] = React.useState<LinkResult<T>>();
  const started = React.useRef(false);

  React.useEffect(
    () => {
      if (!token || started.current) {
        return;
      }
      // Links are single-use, so make sure it is sent only once.
      started.current = true;
      run(token).then(setResult);
    },
    [
      token,
      run,
    ],
  );

  return token === null ? { ok: false as const, message: INCOMPLETE } : result;
};

const LinkPage = ({ children }: { children: React.ReactNode }) => (
  <>
    <LoginHero>
      <GrinchBox>
        {children}
      </GrinchBox>
    </LoginHero>
  </>
);

const Working = ({ title }: { title: string }) => (
  <LinkPage>
    <h2>{title}</h2>
    <ClipLoader color="white" />
  </LinkPage>
);

const LinkFailed = ({ message }: { message: string }) => {
  const navigate = useNavigate();

  return (
    <LinkPage>
      <h2>Hmm... the magic fizzled</h2>
      <p>{message}</p>
      <Button variant="secondary" surface="dark" pill onClick={() => navigate('/')}><span className="tablet:hidden">Get me home!</span><span className="max-tablet:hidden">Take me home, country roads!</span></Button>
    </LinkPage>
  );
};

const confirmSchema = v.object({
  confirm: v.pipe(v.string(), v.check(value => value.trim().toLowerCase() === "delete", 'Type "delete" to confirm.')),
});

/** "Delete my account" works once the field says delete (any case, spaces around are fine). */
const DeleteButton = () => {
  const confirm = useWatch({ name: "confirm" }) as string;
  return (
    <Submit variant="destructive" size="lg" surface="dark" pill disabled={confirm.trim().toLowerCase() !== "delete"}>
      Delete my account
    </Submit>
  );
};

/**
 * The page the deletion email links to. Nothing happens on opening it (mail scanners open links too): the link is
 * checked, then the account is deleted only once its owner types "delete" and confirms.
 */
export const ConfirmAccountDeletion = () => {
  const { checkAccountDeletion, confirmAccountDeletion } = useAppClient();
  const { resetCredentials } = useCurrentUser();
  const navigate = useNavigate();
  const token = useLinkToken("/profile/delete");
  const [checked, setChecked] = React.useState<LinkResult<{ email: string }>>();
  const [result, setResult] = React.useState<LinkResult>();

  React.useEffect(
    () => {
      if (token) {
        checkAccountDeletion(token).then(setChecked);
      }
    },
    [token, checkAccountDeletion],
  );

  const onConfirm = React.useCallback(
    async () => {
      const outcome = await confirmAccountDeletion(token!);
      if (outcome.ok) {
        // Whoever is signed in here, the account behind the link is gone; don't keep a session that may be its.
        resetCredentials();
      }
      setResult(outcome);
    },
    [token, confirmAccountDeletion, resetCredentials],
  );

  if (token === null) {
    return <LinkFailed message={INCOMPLETE} />;
  }

  if (result?.ok) {
    return (
      <LinkPage>
        <h2>Farewell, friend!</h2>
        <br />
        <p>Your account is gone. The elves have shredded your file and the parties you were hosting.</p>
        <p>If you ever miss us, just sign in again with your email. We'll keep the cocoa warm.</p>
        <Button variant="secondary" surface="dark" pill onClick={() => navigate('/')}>Okay, bye-e-e!</Button>
      </LinkPage>
    );
  }

  if (result && !result.ok) {
    return <LinkFailed message={result.message} />;
  }

  if (!checked) {
    return <Working title="Checking the link..." />;
  }

  if (!checked.ok) {
    return <LinkFailed message={checked.message} />;
  }

  return (
    <LinkPage>
      <h2>Delete your account?</h2>
      <br />
      <p>This deletes the Anonymous Ded Morozes account for <strong className="text-white">{checked.email}</strong>.</p>
      <p>
        Parties you host that haven't rolled the dice are deleted, and you leave the open parties you joined. In parties
        that already rolled, your Secret Santa keeps the name you joined with, and nothing else about you. This can't be
        undone.
      </p>
      <Form defaultValues={{ confirm: "" }} schema={confirmSchema} mode="onSubmit" onSubmit={onConfirm}>
        <FormField
          name="confirm"
          label='Type "delete" to confirm'
          horizontal={false}
          surface="dark"
          size="lg"
          children={<Input autoComplete="off" autoCapitalize="none" spellCheck={false} placeholder="delete" maxLength={20} />}
        />
        <div className="actions flex flex-col items-center gap-3">
          <DeleteButton />
          <Button type="button" variant="secondary" surface="dark" pill onClick={() => navigate('/')}>Keep my account</Button>
        </div>
      </Form>
    </LinkPage>
  );
};

export const ConfirmEmailChange = () => {
  const { confirmEmailChange } = useAppClient();
  const { signIn } = useCurrentUser();
  const navigate = useNavigate();

  const run = React.useCallback(
    async (token: string) => {
      const result = await confirmEmailChange(token);
      if (result.ok) {
        // The old session tokens stop working; this browser continues with the new address.
        signIn({ profile: result.user, userToken: result.userToken });
      }
      return result;
    },
    [
      confirmEmailChange,
      signIn,
    ],
  );

  const result = useLinkResult("/profile/email", run);

  if (!result) {
    return <Working title="Updating the elves' records..." />;
  }

  if (!result.ok) {
    return <LinkFailed message={result.message} />;
  }

  return (
    <LinkPage>
      <h2>HO-HO-HO!</h2>
      <br />
      <p>From now on, we know you as {result.user.email}. Use it next time you sign in.</p>
      <p>Your other devices were signed out, just in case.</p>
      <Button variant="secondary" surface="dark" pill onClick={() => navigate('/profile/')}>Show me my profile</Button>
      <SnowConfetti />
    </LinkPage>
  );
};

/**
 * "This wasn't me", from the notice about an email change: the change is stopped and every device is signed out,
 * this one included, so the owner signs in again with the email they still have.
 */
export const CancelEmailChange = () => {
  const { cancelEmailChange } = useAppClient();
  const { resetCredentials } = useCurrentUser();
  const navigate = useNavigate();

  const run = React.useCallback(
    async (token: string) => {
      const result = await cancelEmailChange(token);
      if (result.ok) {
        // Every session token of the account stopped working, so don't keep one here.
        resetCredentials();
      }
      return result;
    },
    [
      cancelEmailChange,
      resetCredentials,
    ],
  );

  const result = useLinkResult("/profile/email/cancel", run);

  if (!result) {
    return <Working title="Stopping the sleigh..." />;
  }

  if (!result.ok) {
    return <LinkFailed message={result.message} />;
  }

  return (
    <LinkPage>
      <h2>Stopped it!</h2>
      <br />
      <p>Your email stays the same, and every device was signed out, including whoever asked for the change.</p>
      <p>Sign in again with your email to carry on.</p>
      <Button variant="secondary" surface="dark" pill onClick={() => navigate('/')}>Sign me in</Button>
    </LinkPage>
  );
};
