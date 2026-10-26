import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { ClipLoader } from 'react-spinners';

import { GrinchBox } from "src/components/GrinchBox";
import { SnowConfetti } from "src/components/SnowConfetti";
import { LoginHero } from "src/components/hoc/LoginBox";
import { useAppClient, useCurrentUser } from "src/components/hooks";
import type { LinkResult } from "src/components/hooks/useAppClient";

/**
 * Runs a confirmation link once (`run` is called with the token from the URL) and shows the outcome. The links work in
 * any browser, signed in or not: the token alone identifies the account.
 */
const useLinkResult = <T,>(run: (token: string) => Promise<LinkResult<T>>) => {
  const { token } = useParams();
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

  return result;
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

export const ConfirmAccountDeletion = () => {
  const { confirmAccountDeletion } = useAppClient();
  const { resetCredentials } = useCurrentUser();
  const navigate = useNavigate();

  const run = React.useCallback(
    async (token: string) => {
      const result = await confirmAccountDeletion(token);
      if (result.ok) {
        // Whoever is signed in here, the account behind the link is gone; don't keep a session that may be its.
        resetCredentials();
      }
      return result;
    },
    [
      confirmAccountDeletion,
      resetCredentials,
    ],
  );

  const result = useLinkResult(run);

  if (!result) {
    return <Working title="Packing up your things..." />;
  }

  if (!result.ok) {
    return <LinkFailed message={result.message} />;
  }

  return (
    <LinkPage>
      <h2>Farewell, friend!</h2>
      <br />
      <p>Your account is gone. The elves have shredded your file and the parties you were hosting.</p>
      <p>If you ever miss us, just sign in again with your email. We'll keep the cocoa warm.</p>
      <Button variant="secondary" surface="dark" pill onClick={() => navigate('/')}>Okay, bye-e-e!</Button>
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

  const result = useLinkResult(run);

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

  const result = useLinkResult(run);

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
