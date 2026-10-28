import { useFormContext, useFormState } from "react-hook-form";
import React from "react";
import { Content } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Route, Routes } from "react-router-dom";
import { ClipLoader } from 'react-spinners';
import { Calendar, ChevronRight, Gift, Lock, LogOut, Star, X } from 'react-feather';
import * as v from "valibot";

import { DialogBox, DialogFooterStart } from "@/components/DialogBox";
import { DialogCharacter } from "@/components/DialogCharacter";
import { Tab, Tabs } from "@/components/Tab";
import { Form, FormFieldContext, Input, Submit } from "@/components/forms";
import { maxLen, required, validEmail } from "@/components/forms/messages";
import { useNotifications } from "@/components/hoc/NotificationsContainer";
import { useAppClient, useCurrentUser, useSignals, useTabletUp } from "@/components/hooks";
import { PARTIES_CHANGED } from "@/components/hooks/useAppClient";
import type { RequestEmailChangeInput, UpdateNameInput } from "@/components/hooks/useAppClient";
import type { Party } from "@/types";
import { MAX_EMAIL_LENGTH, MAX_PERSON_NAME_LENGTH } from "@/limits";
import { pageTitle } from "@/site";

import GrinchImg from "@/images/grinch.png";
import HiImg from "@/images/hi.png";

/** The latest parties shown when the history opens. */
const HISTORY_FIRST_PAGE_SIZE = 5;
/** How many more each "Show more" (or scroll to the end) loads. */
const HISTORY_MORE_PAGE_SIZE = 10;

type HistoryPage = {
  items: Party[];
  hasMore: boolean;
  endCursor: string | null;
};

/** The person's parties, a page at a time. Loads again from the start whenever their parties change. */
const usePartyHistory = () => {
  const { getPartyHistory } = useAppClient();
  const { subscribe } = useSignals();
  const [page, setPage] = React.useState<HistoryPage | null>();
  const [loading, setLoading] = React.useState(true);
  const [reloads, setReloads] = React.useState(0);

  React.useEffect(
    () => {
      let current = true;
      setLoading(true);
      getPartyHistory(HISTORY_FIRST_PAGE_SIZE).then(first => {
        if (current) {
          setPage(first);
          setLoading(false);
        }
      });
      return () => {
        current = false;
      };
    },
    [
      getPartyHistory,
      reloads,
    ],
  );

  React.useEffect(
    () => subscribe(PARTIES_CHANGED, () => setReloads(n => n + 1)),
    [
      subscribe,
    ],
  );

  const fetchMore = React.useCallback(
    async () => {
      if (!page?.endCursor) {
        return;
      }
      const next = await getPartyHistory(HISTORY_MORE_PAGE_SIZE, page.endCursor);
      if (next) {
        setPage(previous => previous && { items: [...previous.items, ...next.items], hasMore: next.hasMore, endCursor: next.endCursor });
      }
    },
    [
      getPartyHistory,
      page?.endCursor,
    ],
  );

  return { loading, page, fetchMore };
};

const nameSchema = v.object({
  name: v.pipe(v.string(), v.trim(), v.nonEmpty(required("Name")), v.maxLength(MAX_PERSON_NAME_LENGTH, maxLen("Name", MAX_PERSON_NAME_LENGTH))),
});

/** Rejects the current address here, so the request (and its emailing rate limit) is never spent on it. */
const emailSchema = (currentEmail: string) => v.object({
  email: v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty(required("New email")),
    v.maxLength(MAX_EMAIL_LENGTH, maxLen("New email", MAX_EMAIL_LENGTH)),
    v.email(validEmail("New email")),
    v.check(value => value.toLowerCase() !== currentEmail.toLowerCase(), "That's already your email."),
  ),
});

/**
 * The profile dialog, with its two tabs as routes under `base`: "/profile/" from the home screen, under the party on a
 * party page (closing it goes back to `dismissLocation`).
 */
export const MyProfile = ({ base = "/profile/", dismissLocation = "/" }: { base?: string; dismissLocation?: string }) => {
  const tabletUp = useTabletUp();

  return (
    <DialogBox
      className={"profile-box"}
      noHeader
      dismissLabel={"Okie Dokie!"}
      dismissLocation={dismissLocation}
      size="lg"
      // On a phone's sheet a rule sets the footer apart, with Sign out small above Okie Dokie.
      footerClassName={tabletUp ? undefined : "mx-5 gap-3 border-t border-border px-0 pt-3"}
    >
      {/* From tablet up the greeting and the tabs stay at the top while the rest scrolls under them; on a phone's
          sheet the greeting scrolls away and only the tabs stick, to leave the small screen to the content. */}
      {/* (On phones the wrapper is `contents`, so the tabs stick to the sheet's body, not to this box.) */}
      <div className="max-tablet:contents tablet:sticky tablet:-top-2.5 tablet:z-20 tablet:-mx-5 tablet:bg-white tablet:px-5">
        <Greeting />
        <Tabs label="Profile" className="sticky -top-2.5 z-20 -mx-5 mb-4 bg-white">
          <Tab to={base}>Profile</Tab>
          <Tab to={`${base}history/`}>Latest history</Tab>
        </Tabs>
      </div>
      <Content>
        <Routes>
          <Route path="" Component={Profile} />
          <Route path="history/" Component={History} />
        </Routes>
      </Content>
    </DialogBox>
  );
};

/**
 * The profile's header, on both tabs: a sticker, "Hey, <name>!" and Sign out, in the header from tablet up and above
 * Okie Dokie on a phone's sheet (in the footer's left slot, which stacks below the buttons; `order` lifts it above).
 */
const Greeting = () => {
  const { profile, signOut } = useCurrentUser();
  const tabletUp = useTabletUp();
  const name = profile?.name?.trim();

  return (
    <div className="-mt-1 mb-2 flex items-center gap-3 max-tablet:pt-5 tablet:gap-4">
      <img src={HiImg.src} alt="" width={76} height={76} className="size-15 shrink-0 -rotate-6 tablet:size-19" />
      {/* One line: a long name truncates, in full in `title`. */}
      <h2 className="m-0 min-w-0 grow truncate text-xl font-semibold text-zinc-900 tablet:text-2xl" title={name}>
        {name ? `Hey, ${name}!` : "Hey there!"}
      </h2>
      {tabletUp
        ? (
          <Button type="button" variant="ghost" onClick={signOut}>
            <LogOut size={18} aria-hidden="true" /> Sign out
          </Button>
        )
        : (
          <DialogFooterStart>
            <Button type="button" variant="ghost" size="sm" className="order-1 self-center text-zinc-600" onClick={signOut}>
              <LogOut size={15} aria-hidden="true" /> Sign out
            </Button>
          </DialogFooterStart>
        )}
    </div>
  );
};

const Profile = () => {
  const { profile, updateProfile, signOut } = useCurrentUser();
  const { getProfile, updateName } = useAppClient();
  const { success } = useNotifications();
  // The form follows the profile: when it reloads (or is saved), the field shows the new name.
  const nameValues = React.useMemo(() => ({ name: profile?.name ?? "" }), [profile?.name]);

  // The cached profile may be stale (e.g. the first party joined set the name), so reload it once.
  React.useEffect(
    () => {
      (async function () {
        const user = await getProfile();
        if (user) {
          updateProfile(user);
        }
        else if (user === null) {
          // The session no longer belongs to an account (deleted, or its tokens were revoked).
          signOut();
        }
      })();
    },
    [],
  );

  const onSubmit = React.useCallback(
    async ({ name }: UpdateNameInput) => {
      const user = await updateName({ name: name.trim() });
      if (user) {
        updateProfile(user);
        success("Got it! The elves wrote your new name down.");
      }
    },
    [
      updateName,
      updateProfile,
      success,
    ],
  );

  return (
    <div className="profile-settings">
      <title>{pageTitle("My profile")}</title>

      <Setting
        label="Name"
        hint="We'll suggest it when you join a new party. Parties you've already joined keep the name you joined with."
      >
        <Form
          defaultValues={{ name: profile?.name ?? "" }}
          values={nameValues}
          mode="onSubmit"
          schema={nameSchema}
          onSubmit={onSubmit}
        >
          <InlineField name="name" action={<SaveButton />}>
            <Input placeholder="How should your friends call you?" maxLength={MAX_PERSON_NAME_LENGTH} />
          </InlineField>
        </Form>
      </Setting>

      <EmailSetting email={profile?.email ?? ""} />

      <DeleteAccount email={profile?.email ?? ""} />
    </div>
  );
};

/** One row of the profile: a label, its control, and a short hint under the control. */
const Setting = ({ label, hint, children }: { label: string, hint?: React.ReactNode, children: React.ReactNode }) => (
  <div className="setting">
    <div className="setting-label">{label}</div>
    <div className="setting-body">
      {children}
      {hint && <p className="setting-hint">{hint}</p>}
    </div>
  </div>
);

/** An input with its buttons on the same line, all one height, and the field's error (after a submit) underneath. */
const InlineField = ({ name, action, children }: { name: string, action: React.ReactNode, children: React.ReactNode }) => {
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name });
  const id = React.useId();
  const error: string | undefined = getFieldState(name, formState).error?.message;

  return (
    <FormFieldContext.Provider value={{ name, id, messageId: `${id}-error`, invalid: !!error }}>
      <div className="setting-control">
        <div className="setting-input">{children}</div>
        {action}
      </div>
      {error && <p id={`${id}-error`} className="mt-1 text-sm text-destructive">{error}</p>}
    </FormFieldContext.Provider>
  );
};

/** Saves the name: shown only once it's been edited. */
const SaveButton = () => {
  const { isDirty } = useFormState();
  return isDirty ? <Submit>Save</Submit> : null;
};

/** Shows the email; changing it sends a confirmation link to the new address (handled by ConfirmEmailChange). */
const EmailSetting = ({ email }: { email: string }) => {
  const { requestEmailChange } = useAppClient();
  const [editing, setEditing] = React.useState(false);
  const [sentTo, setSentTo] = React.useState<string>();
  // One id per opened form: sending the same address again from it doesn't email twice; a new address is a new request.
  const requestId = React.useRef("");
  const schema = React.useMemo(() => emailSchema(email), [email]);

  const startEditing = React.useCallback(
    () => {
      requestId.current = crypto.randomUUID();
      setEditing(true);
    },
    [],
  );

  const onSubmit = React.useCallback(
    async (input: RequestEmailChangeInput) => {
      const newEmail = input.email.trim();
      if (await requestEmailChange({ email: newEmail, requestId: requestId.current })) {
        setSentTo(newEmail);
        setEditing(false);
      }
    },
    [
      requestEmailChange,
    ],
  );

  if (editing) {
    return (
      <Setting label="Email" hint={<>We'll email a confirmation link to the new address. Until you click it, you stay {email}.</>}>
        <Form defaultValues={{ email: "" }} mode="onSubmit" schema={schema} onSubmit={onSubmit}>
          <InlineField
            name="email"
            action={
              <>
                <Submit>Send link</Submit>
                {/* An X, so the field and both buttons fit on one line, phones included. */}
                <Button type="button" variant="ghost" className="size-10 shrink-0 px-0" aria-label="Cancel" title="Cancel" onClick={() => setEditing(false)}>
                  <X size={20} aria-hidden="true" />
                </Button>
              </>
            }
          >
            <Input type="email" placeholder="Your new email address" autofocus maxLength={MAX_EMAIL_LENGTH} />
          </InlineField>
        </Form>
      </Setting>
    );
  }

  return (
    <Setting
      label="Email"
      hint={sentTo && <>Check {sentTo} for a confirmation link. Your email changes once you click it.</>}
    >
      <div className="setting-control">
        <span className="setting-value">{email}</span>
        <Button type="button" variant="ghost" onClick={startEditing}>Change</Button>
      </div>
    </Setting>
  );
};

const noValues = {};

/**
 * Deleting the account takes two steps: confirm in a danger sheet on top of the profile, then click the emailed link
 * (handled by ConfirmAccountDeletion). The sheet isn't a route: /profile/delete is that link's page.
 */
const DeleteAccount = ({ email }: { email: string }) => {
  const { requestAccountDeletion } = useAppClient();
  const [stage, setStage] = React.useState<"idle" | "confirming" | "sent">("idle");
  // One id per confirmation: retrying it after a failure is fine, it never emails twice.
  const requestId = React.useRef("");

  const startConfirming = React.useCallback(
    () => {
      requestId.current = crypto.randomUUID();
      setStage("confirming");
    },
    [],
  );

  const keep = React.useCallback(() => setStage("idle"), []);

  // A failure keeps the sheet open (the toast says what went wrong), to try again.
  const onConfirm = React.useCallback(
    async () => {
      if (await requestAccountDeletion(requestId.current)) {
        setStage("sent");
      }
    },
    [
      requestAccountDeletion,
    ],
  );

  return (
    <div className="danger-zone">
      <div className="setting-control">
        <div className="danger-text">
          <strong>Delete account</strong>
          <p>
            {stage === "sent"
              ? <>We've sent a confirmation link to {email}. Your account is deleted only once you click it.</>
              : <>Removes your account and the parties you host that haven't rolled the dice yet.</>
            }
          </p>
        </div>
        {stage !== "sent" && (
          <Button type="button" variant="ghost-destructive" onClick={startConfirming}>
            Delete account
          </Button>
        )}
      </div>

      {stage === "confirming" && (
        <DialogBox
          title="Delete your account?"
          tone="danger"
          size="sm"
          onDismiss={keep}
          dismissLabel="Keep my account"
          action={<Submit variant="destructive">&#x1F4A5; Yes, email me the link</Submit>}
          form={{ defaultValues: noValues, onSubmit: onConfirm }}
        >
          <DialogCharacter image={{ src: GrinchImg.src, width: 150, height: 150 }}>
            <p>
              Your account goes, and so do the parties you host that haven't rolled the dice yet.
            </p>
            <p>
              Parties that already rolled keep your name, so whoever drew you still knows who to buy a gift for. We'll
              email <strong className="wrap-anywhere">{email}</strong> a link to finish.
            </p>
          </DialogCharacter>
        </DialogBox>
      )}
    </div>
  );
};

const History = () => {
  const { loading, page, fetchMore } = usePartyHistory();

  const [loadingMore, setLoadingMore] = React.useState(false);
  // State updates land a render late, so a ref keeps a second request from starting while one is on its way.
  const inFlight = React.useRef(false);
  // After the first "More" click, scrolling to the end of the list loads the next page too.
  const [autoLoad, setAutoLoad] = React.useState(false);
  const sentinelRef = React.useRef<HTMLDivElement>(null);

  const hasMore = Boolean(page?.hasMore && page.endCursor);

  const loadMore = React.useCallback(
    async () => {
      if (!page?.endCursor || inFlight.current) {
        return;
      }
      inFlight.current = true;
      setLoadingMore(true);
      try {
        await fetchMore();
      }
      finally {
        inFlight.current = false;
        setLoadingMore(false);
      }
    },
    [
      page?.endCursor,
      fetchMore,
    ],
  );

  const onMoreClick = React.useCallback(
    () => {
      setAutoLoad(true);
      loadMore();
    },
    [
      loadMore,
    ],
  );
  const tabletUp = useTabletUp();

  React.useEffect(
    () => {
      const sentinel = sentinelRef.current;
      if (!autoLoad || !hasMore || loadingMore || !sentinel) {
        return;
      }
      // Only scrolling the end of the list into view loads a page. The observer's first report is where the list stands
      // right now, just after a click or a page loaded: acting on it would load a second page nobody asked for.
      let first = true;
      const observer = new IntersectionObserver(
        entries => {
          if (!first && entries.some(entry => entry.isIntersecting)) {
            loadMore();
          }
          first = false;
        },
        // The list scrolls inside the dialog, not the page.
        { root: sentinel.closest('.dialog-body'), rootMargin: "100px" },
      );
      observer.observe(sentinel);
      return () => observer.disconnect();
    },
    [
      autoLoad,
      hasMore,
      loadingMore,
      loadMore,
    ],
  );

  const title = <title>{pageTitle("My party history")}</title>;

  if (loading && !page) {
    return (
      <Content style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {title}
        <ClipLoader />
      </Content>
    );
  }

  if (!page?.items.length) {
    return (
      <div className="history-empty">
        {title}
        <Gift size={32} />
        <p>No parties yet. Host one or join a friend's, and it will show up here.</p>
      </div>
    );
  }

  const showMore = <Button variant="ghost" onClick={onMoreClick} loading={loadingMore}>Show more parties</Button>;

  return (
    <div className="history">
      {title}
      <ul className="history-list">
        {page.items.map(party => <HistoryItem key={party.code} party={party} />)}
      </ul>

      {/* Once "Show more parties" was pressed, reaching the end of the list loads the next page. */}
      {hasMore && autoLoad && (
        <div className="history-more" ref={sentinelRef}>
          {loadingMore && <ClipLoader size={20} />}
        </div>
      )}
      {/* From tablet up on the footer's left; on a phone's sheet right under the list, above the stacked footer. */}
      {/* Once pressed, reaching the end loads the rest (with the spinner above), so the button goes away. */}
      {hasMore && !autoLoad && (tabletUp
        ? <DialogFooterStart>{showMore}</DialogFooterStart>
        : <div className="mt-1 flex justify-center">{showMore}</div>)}
    </div>
  );
};

const dateFormat = new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", year: "numeric" });

const formatDate = (iso?: string | null) => {
  const date = iso ? new Date(iso) : null;
  return date && !isNaN(date.getTime()) ? dateFormat.format(date) : null;
};

/**
 * One party: whether you host it or joined it, its code, when it started and when the dice were rolled (parties
 * rolled before that was recorded have no roll date), and its status: open, rolled, or deleted by its host.
 */
const HistoryItem = ({ party: { code, name, isClosed, isHost, isProtected, createdAt, rolledAt, deletedAt } }: { party: Party }) => {
  const started = formatDate(createdAt);
  const rolled = formatDate(rolledAt);
  const state = deletedAt ? "is-deleted" : isClosed ? "is-closed" : "is-open";
  const status = deletedAt ? "Deleted" : isClosed ? "Dice rolled" : "Open";

  return (
    <li className={state}>
      <Link to={`/p/${code}/`}>
        <span className={`history-icon ${isHost ? "is-host" : "is-guest"}`}>
          {isHost ? <Star size={18} /> : <Gift size={18} />}
        </span>

        <span className="history-text">
          <span className="history-name">{name}</span>
          <span className="history-meta">
            {isHost ? "You host" : "You joined"} &middot; <code>{code}</code>
            {isProtected && <> &middot; <Lock size={12} /> secret phrase</>}
            <span className="history-meta-status"> &middot; {status}</span>
          </span>
          {started && (
            <span className="history-dates">
              <Calendar size={12} /> Started {started}
              {rolled && <> &middot; rolled {rolled}</>}
            </span>
          )}
        </span>

        <span className={`history-status ${state}`}>
          {status}
        </span>

        <ChevronRight size={18} className="history-chevron" />
      </Link>
    </li>
  );
};
