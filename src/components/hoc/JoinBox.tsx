import React from "react";

import { newKey } from "@/api/client";
import { NO_KEY_MESSAGE, newSessionKey } from "@/api/dpop";
import { Hero } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import * as v from "valibot";

import { GrinchBox } from "@/components/GrinchBox";
import { SnowConfetti } from "@/components/SnowConfetti";
import { UnsplashCredit } from "@/components/UnsplashCredit";
import { Form } from "@/components/forms/Form";
import { FormField } from "@/components/forms/FormField";
import { Input } from "@/components/forms/Input";
import { Submit } from "@/components/forms/Submit";
import { maxLen, required, validEmail } from "@/components/forms/messages";
import { Footer } from "@/components/hoc/Footer";
import { TINTS, useAppClient, useCurrentUser, usePageTint, useSignals } from "@/components/hooks";
import type { Party, User } from "@/types";
import { useNotifications } from "@/components/hoc/NotificationsContainer";
import type { JoinPartyInput } from "@/components/hooks/useAppClient";
import { MAX_EMAIL_LENGTH, MAX_PERSON_NAME_LENGTH, MAX_PARTY_CODE_LENGTH, MAX_PHRASE_LENGTH } from "@/limits";

type Props = {
  party: Party;
  /** An emailed invite's token, when the visitor came with one (useLinkToken): signed out, they join with just a name. */
  inviteToken?: string | null;
  /** A member's sign-in link's token, from the reminder or "dice are rolled" email (usePartyLink). */
  memberToken?: string | null;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** The party's code rides along with both forms (not shown); a schema drops fields it doesn't declare, so it's here. */
const partyCode = v.pipe(
  v.string(),
  v.nonEmpty(required("party")),
  v.maxLength(MAX_PARTY_CODE_LENGTH, maxLen("party", MAX_PARTY_CODE_LENGTH)),
);

const joinSchema = v.object({
  party: partyCode,
  name: v.pipe(v.string(), v.nonEmpty(required("Name")), v.maxLength(MAX_PERSON_NAME_LENGTH, maxLen("Name", MAX_PERSON_NAME_LENGTH))),
  password: v.pipe(v.string(), v.maxLength(MAX_PHRASE_LENGTH, maxLen("Secret phrase", MAX_PHRASE_LENGTH))),
});

const signInSchema = v.object({
  email: v.pipe(
    v.string(),
    v.nonEmpty(required("Email")),
    v.maxLength(MAX_EMAIL_LENGTH, maxLen("Email", MAX_EMAIL_LENGTH)),
    v.email(validEmail("Email")),
  ),
  party: partyCode,
});


export const JoinBox = ({ party, inviteToken, memberToken }: Props) => {
  const navigate = useNavigate();
  usePageTint(TINTS.partyDoor);

  const { profile } = useCurrentUser();

  // A member's link is offered until it turns out unusable (or they'd rather stay as they are); the door is then as if
  // it never came. A signed-in member never sees this door, so their link stays unused for another device.
  const [memberLinkGone, setMemberLinkGone] = React.useState(false);
  const memberLink = memberToken && !memberLinkGone ? memberToken : null;
  const onMemberLinkGone = React.useCallback(() => setMemberLinkGone(true), []);

  const deadEnd = profile?.id && party?.isClosed && !party?.isJoined && !memberLink;

  const onGoHomeClick = React.useCallback(() => navigate('/'), [navigate]);

  return (
    <>
      <Hero size={"fullheight"} className="join-container">
        <Hero.Body>
          <GrinchBox>
            <h2>
              &mdash; {deadEnd ? "Buenos noches" : "Howdy"}, {profile?.name || "anonymous friend"}!
            </h2>

            {deadEnd
              ? (
                <>
                  <h3>
                    Sorry to disappoint you, <br />
                    but {party.name.replace(/!+$/, '')} is over!
                  </h3>

                  <Button variant="secondary" surface="dark" pill onClick={onGoHomeClick}>
                    <span className="tablet:hidden">Get me home!</span><span className="max-tablet:hidden">Take me home, country roads!</span>
                  </Button>
                </>
              )
              : (
                <>
                  <h3>Welcome to the {party.name.replace(/!+$/, '')}!</h3>

                  {memberLink
                    ? <MemberLinkSignIn party={party} token={memberLink} signedInAs={profile} onGone={onMemberLinkGone} />
                    : profile
                      ? <SubmitRequestForm party={party} profile={profile} />
                      : inviteToken && !party.isClosed
                        ? <InviteForm party={party} token={inviteToken} />
                        : <SignInControls party={party} />}
                </>
              )
            }
          </GrinchBox>
        </Hero.Body>

        <Hero.Footer>
          <Footer profileAsLink>
            <UnsplashCredit id="24JJStvqFLs" name="Nicole Baster" username="nicolebaster" />
          </Footer>
        </Hero.Footer>
      </Hero >
    </>
  );
};

type SignInControlsProps = {
  party: Party;
};

const SignInControls = ({ party }: SignInControlsProps) => {
  const { error } = useNotifications();
  const { enterRequest } = useAppClient();
  const requestKey = React.useRef(newKey());

  const [busy, setBusy] = React.useState(false);
  const [displayForm, setDisplayForm] = React.useState(false);
  const [sentTo, setSentTo] = React.useState<string>();

  const onActionClick = React.useCallback(
    async () => {
      try {
        setBusy(true);
        await sleep(500);
        setDisplayForm(true);
      }
      finally {
        setBusy(false);
      }
    },
    [],
  );

  const onSubmit = React.useCallback(
    async (input: v.InferOutput<typeof signInSchema>) => {
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
        sleep(500),
        submit(),
      ]);
      // Only a sent link turns the form into "check your inbox"; after an error the form stays, to try again.
      if (sent) {
        setSentTo(input.email);
      }
    },
    [
      enterRequest,
      error,
    ],
  );

  if (sentTo) {
    return (
      <Notice action={<HomeButton />}>
        <p>Our team of elves has just sent you a magic link to {sentTo}. Please check your inbox and follow the instructions.</p>
        <p>If you didn't receive anything from us, refresh this page and try again.</p>
        <SnowConfetti />
      </Notice>
    );
  }

  if (displayForm) {
    return (
      <Form
        defaultValues={{ email: "", party: party.code }}
        schema={signInSchema}
        onSubmit={onSubmit}
      >
        <FormField
          name="email"
          label="Enter with your email address"
          horizontal={false}
          surface="dark"
          size="lg"
          children={<Input placeholder="Email address for a magic link" maxLength={MAX_EMAIL_LENGTH} />}
        />
        <p>
          Enter your email address above and we'll send you a magic link to sign in.
        </p>
        <div className="actions">
          <Submit variant="brand" size="lg" surface="dark" pill>
            &#x1F973;&nbsp;Send me a magic link!
          </Submit>
        </div>
      </Form>
    );
  }

  return (
    <>
      <p style={{ textAlign: "justify" }}>
        {/* Nobody joins a rolled party: its members sign in to see it. */}
        To {party.isClosed ? "see" : "join"} the party, please sign in with your email address. We promise not to send you any marketing materials or share your personal data with third parties.
      </p >
      <div className="actions">
        <Button variant="brand" size="lg" surface="dark" pill loading={busy} onClick={onActionClick}>
          &#x1F973;&nbsp;Sign in to {party.isClosed ? "see" : "join"} the party!
        </Button>
      </div >
    </>
  )
};

/**
 * A message in place of a form (a link is on its way, you're already in, the invite expired): kept to a readable
 * width, its lines balanced, and its one button below with the same gap as a form's.
 */
const Notice = ({ action, children }: { action: React.ReactNode; children: React.ReactNode }) => (
  <div className="join-notice">
    {children}
    <div className="actions">{action}</div>
  </div>
);

/** Back to the start page, under a message that ends the visit here. */
const HomeButton = () => {
  const navigate = useNavigate();
  return <Button variant="secondary" surface="dark" pill onClick={() => navigate('/')}>Return back to home</Button>;
};

type ExpiredLinkProps = {
  /** The expired link's token. */
  token: string;
  /** What expired, and that a magic link can replace it. */
  expired: string;
  /** Where the magic link takes them, once it's sent. */
  resent: string;
};

/**
 * An emailed link (an invite, or a member's sign-in link) that expired: one tap emails a magic link to the same
 * address, for the same party. The API reads both from the old link.
 */
const ExpiredLink = ({ token, expired, resent }: ExpiredLinkProps) => {
  const { enterAgain } = useAppClient();
  // One key for the button, so a double click sends one email.
  const resendKey = React.useRef(newKey());
  const [resending, setResending] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  const resend = React.useCallback(
    async () => {
      setResending(true);
      try {
        setSent(await enterAgain(token, resendKey.current));
      } finally {
        setResending(false);
      }
    },
    [
      enterAgain,
      token,
    ],
  );

  if (sent) {
    return (
      <Notice action={<HomeButton />}>
        <p>{resent}</p>
      </Notice>
    );
  }
  return (
    <Notice
      action={
        <Button variant="brand" size="lg" surface="dark" pill loading={resending} onClick={resend}>
          &#x2728;&nbsp;Send me a fresh link!
        </Button>
      }
    >
      <p>{expired}</p>
    </Notice>
  );
};

type SubmitRequestFormProps = {
  profile: User;
  party: Party;
}

/** Joining when signed in: the profile name is filled in. */
const SubmitRequestForm = ({ profile, party }: SubmitRequestFormProps) => {
  const { joinParty } = useAppClient();
  const { updateProfile } = useCurrentUser();
  const { signal } = useSignals();

  const onSubmit = React.useCallback(
    async (input: JoinPartyInput) => {
      if (!await joinParty(input)) {
        return false;
      }
      // The first party joined gives an empty profile its name; mirror that so the cached profile is current.
      if (!profile.name) {
        updateProfile({ ...profile, name: input.name });
      }
      signal('party:updated');
      return true;
    },
    [
      joinParty,
      signal,
      profile,
      updateProfile,
    ],
  );

  return (
    <JoinForm
      party={party}
      name={profile.name}
      nameLabel={profile.name ? "Your name for this party" : "Let us know your name"}
      nameHelp={profile.name ? "We filled in your profile name. Change it if your friends know you by another one." : undefined}
      onSubmit={onSubmit}
    />
  );
};

const INVALID_INVITE = "This invite link isn't working. Please sign in with your email to join.";

/** Where taking up an invite stands: the form, or why it gave way to something else. */
type InviteStep = "form" | "member" | "expired" | "unusable";

type InviteFormProps = {
  party: Party;
  /** The emailed invite's token (useLinkToken). */
  token: string;
};

/**
 * Joining from an emailed invite, signed out: the invite signs the person in, so all it asks is a name (and the
 * secret phrase). A member gets a magic link by email instead; an expired invite can ask for one; a used or broken
 * one falls back to signing in with the email address.
 */
const InviteForm = ({ party, token }: InviteFormProps) => {
  const { acceptInvite } = useAppClient();
  const { signIn } = useCurrentUser();
  const { error } = useNotifications();
  const [step, setStep] = React.useState<InviteStep>("form");

  const onSubmit = React.useCallback(
    async ({ name, password }: JoinPartyInput) => {
      // The session is bound to a key this browser keeps (src/api/dpop.ts).
      let key;
      try {
        key = await newSessionKey();
      } catch {
        error(NO_KEY_MESSAGE);
        return false;
      }
      const result = await acceptInvite(token, key, { name, password });
      if (!result.ok) {
        if (result.code === "link_expired") {
          setStep("expired");
          return false;
        }
        // Anything else keeps the form (a wrong phrase, say), unless the invite itself is no good.
        const unusable = result.code === "link_used" || result.code === "invalid_link";
        error(result.code === "invalid_link" ? INVALID_INVITE : result.message);
        if (unusable) {
          setStep("unusable");
        }
        return false;
      }
      if (!result.session) {
        setStep("member");
        return true;
      }
      // As with any first join, the name joined with becomes an empty profile's name (the API does it right after).
      // Signing in changes the session, so the party loads again, now as a member.
      const { user, userToken } = result.session;
      signIn({ profile: { ...user, name: user.name || name }, userToken });
      return true;
    },
    [
      acceptInvite,
      error,
      signIn,
      token,
    ],
  );

  if (step === "unusable") {
    return <SignInControls party={party} />;
  }

  if (step === "member") {
    return (
      <Notice action={<HomeButton />}>
        <p>Good news: you're already in this party! Our elves have emailed you a magic link, so you can sign in and see it.</p>
        <SnowConfetti />
      </Notice>
    );
  }

  if (step === "expired") {
    return (
      <ExpiredLink
        token={token}
        expired="This invite has expired. No worries: we can email you a fresh magic link to sign in and join."
        resent="A fresh magic link is on its way! Please check your inbox and follow it to join the party."
      />
    );
  }

  return (
    <>
      <p>You're invited! Your invite signs you in, so just tell us your name.</p>
      <JoinForm party={party} nameLabel="Let us know your name" onSubmit={onSubmit} />
    </>
  );
};

const INVALID_MEMBER_LINK = "This sign-in link isn't working. Please sign in with your email.";

type MemberLinkSignInProps = {
  party: Party;
  /** The link's token (usePartyLink). */
  token: string;
  /** Who is signed in here already, when it's someone who isn't in this party: the link offers to switch. */
  signedInAs?: User;
  /** The link won't be used: it's no good, or the person would rather stay as they are. */
  onGone: () => void;
};

/**
 * Signing a member in with the link in a party's reminder or "dice are rolled" email. It takes a tap, never just
 * opening the page, so a mail scanner that opens links doesn't use it up. Signed in as someone outside the party, it
 * offers to switch to the link's account. An expired link can ask for a magic link; a used or broken one, or one for
 * someone no longer in the party, gives way to the usual door.
 */
const MemberLinkSignIn = ({ party, token, signedInAs, onGone }: MemberLinkSignInProps) => {
  const { partySignIn } = useAppClient();
  const { signIn } = useCurrentUser();
  const { error } = useNotifications();
  const [expired, setExpired] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  const onSignIn = React.useCallback(
    async () => {
      setBusy(true);
      // The session is bound to a key this browser keeps (src/api/dpop.ts).
      let key;
      try {
        key = await newSessionKey();
      } catch {
        error(NO_KEY_MESSAGE);
        setBusy(false);
        return;
      }
      const result = await partySignIn(token, key);
      if (!result.ok) {
        setBusy(false);
        if (result.code === "link_expired") {
          setExpired(true);
          return;
        }
        error(result.code === "invalid_link" ? INVALID_MEMBER_LINK : result.message);
        // A link that will never work gives way to the usual door; anything else (a dropped connection, say) keeps
        // the button, to try again.
        if (["invalid_link", "link_used", "not_member"].includes(result.code ?? "")) {
          onGone();
        }
        return;
      }
      // Signing in changes the session, so the party loads again, now as a member; the button stays busy until then.
      signIn({ profile: result.user, userToken: result.userToken });
    },
    [
      error,
      onGone,
      partySignIn,
      signIn,
      token,
    ],
  );

  if (expired) {
    return (
      <ExpiredLink
        token={token}
        expired="This sign-in link has expired. No worries: we can email you a fresh magic link to sign in."
        resent="A fresh magic link is on its way! Please check your inbox and follow it to see the party."
      />
    );
  }

  if (signedInAs) {
    return (
      <Notice
        action={
          <div className="join-choices">
            <Button variant="brand" size="lg" surface="dark" pill loading={busy} onClick={onSignIn}>
              Switch account
            </Button>
            <Button variant="secondary" size="lg" surface="dark" pill disabled={busy} onClick={onGone}>
              Stay as I am
            </Button>
          </div>
        }
      >
        <p>The link you followed is for another account, not the one signed in here. Switch to that account?</p>
      </Notice>
    );
  }

  return (
    <Notice
      action={
        <Button variant="brand" size="lg" surface="dark" pill loading={busy} onClick={onSignIn}>
          &#x2728;&nbsp;Sign me in!
        </Button>
      }
    >
      <p>
        {party.isClosed
          ? "The dice are rolled! The link from your email signs you in: one tap, and Gnomik tells you whom you're surprising."
          : "The link from your email signs you in: one tap, and you're back at your party."}
      </p>
    </Notice>
  );
};

type JoinFormProps = {
  party: Party;
  /** The name to start with. */
  name?: string;
  nameLabel: string;
  nameHelp?: string;
  /** Joins; true when it worked, so the button stays busy while the party opens. */
  onSubmit: (input: JoinPartyInput) => Promise<boolean>;
};

/** The name to join with, and the secret phrase for a protected party. */
const JoinForm = ({ party, name = "", nameLabel, nameHelp, onSubmit }: JoinFormProps) => {
  const [busy, setBusy] = React.useState(false);

  const submit = React.useCallback(
    async (input: JoinPartyInput) => {
      setBusy(true);
      if (!await onSubmit(input)) {
        setBusy(false);
      }
    },
    [onSubmit],
  );

  return (
    <Form
      defaultValues={{
        party: party.code,
        name,
        password: "",
      }}
      schema={joinSchema}
      onSubmit={submit}
    >
      <FormField
        name="name"
        label={nameLabel}
        horizontal={false}
        surface="dark"
        size="lg"
        children={<Input maxLength={MAX_PERSON_NAME_LENGTH} />}
        help={nameHelp}
      />

      {party.isProtected &&
        (
          <>
            <p>
              Before we let you in, please enter a secret phrase we hope you've been told...
            </p>

            <FormField
              name="password"
              label="Secret phrase"
              horizontal={false}
              surface="dark"
              size="lg"
              children={<Input maxLength={MAX_PHRASE_LENGTH} />}
              help="We beleave your friend didn't forget to tell it to you..."
            />
          </>
        )
      }

      <div className="actions">
        <Submit variant="brand" size="lg" surface="dark" pill loading={busy}>
          &#x1F973;&nbsp;Join the party!
        </Submit>
      </div>

      <SnowConfetti />
    </Form>
  );
};
