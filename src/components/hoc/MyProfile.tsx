import { useFormContext, useFormState } from "react-hook-form";
import React from "react";
import { Content } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Route, Routes, useMatch } from "react-router-dom";
import { ClipLoader } from 'react-spinners';
import { Calendar, ChevronRight, Gift, Lock, Mail, Star, Trash2, X } from 'react-feather';
import * as v from "valibot";

import { DialogBox, DialogFooterStart } from "@/components/DialogBox";
import { DialogCharacter } from "@/components/DialogCharacter";
import { Tab, Tabs } from "@/components/Tab";
import { Form } from "@/components/forms/Form";
import { FormFieldContext } from "@/components/forms/FormField";
import { Input } from "@/components/forms/Input";
import { Submit } from "@/components/forms/Submit";
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
  // The history scrolls under the footer: a rule sets the footer apart there (full width like the tabs' from tablet
  // up, inset on a phone's sheet). The Profile tab has none.
  const onHistory = !!useMatch(`${base}history/`);
  const footerRule = onHistory ? (tabletUp ? "border-t border-border" : "mx-5 border-t border-border px-0") : undefined;
  // Kept here, not in the Profile tab, so "Check your email" is still there after a look at the history.
  const [deletionSent, setDeletionSent] = React.useState(false);
  const onDeletionSent = React.useCallback(() => setDeletionSent(true), []);

  return (
    <DialogBox
      className={"profile-box"}
      noHeader
      dismissLabel={"Okie Dokie!"}
      dismissLocation={dismissLocation}
      size="lg"
      footerClassName={footerRule}
    >
      {/* From tablet up the greeting and the tabs stay at the top while the rest scrolls under them; on a phone's
          sheet the greeting scrolls away and only the tabs stick, to leave the small screen to the content. */}
      {/* (On phones the wrapper is `contents`, so the tabs stick to the sheet's body, not to this box.) */}
      {/* Both stick flush with the body's top edge (-top-5 takes back its p-5), so nothing scrolls by above them. From
          tablet up the box takes the body's top padding in as white padding of its own, so it stays exactly where it
          was when it sticks, the tilted sticker whole. On a phone the tabs stop 8px lower, under the sheet's grip, and a white shadow fills those 8px (over
          the greeting's mb-2 before they stick). */}
      <div className="max-tablet:contents tablet:sticky tablet:-top-5 tablet:z-20 tablet:-mx-5 tablet:-mt-5 tablet:bg-white tablet:px-5 tablet:pt-5">
        <Greeting />
        <Tabs label="Profile" className="z-20 -mx-5 mb-4 bg-white max-tablet:sticky max-tablet:-top-3 max-tablet:shadow-[0_-8px_0_white]">
          <Tab to={base}>Profile</Tab>
          <Tab to={`${base}history/`}>Latest history</Tab>
        </Tabs>
      </div>
      <Content>
        <Routes>
          <Route path="" element={<Profile deletionSent={deletionSent} onDeletionSent={onDeletionSent} />} />
          <Route path="history/" Component={History} />
        </Routes>
      </Content>
    </DialogBox>
  );
};

/** The profile's header, on both tabs: a sticker and "Hey, <name>!". Signing out is in the page's footer. */
const Greeting = () => {
  const { profile } = useCurrentUser();
  const name = profile?.name?.trim();

  return (
    <div className="-mt-1 mb-2 flex items-center gap-3 max-tablet:pt-5 tablet:gap-4">
      <img src={HiImg.src} alt="" width={76} height={76} className="size-15 shrink-0 -rotate-6 tablet:size-19" />
      {/* One line: a long name truncates, in full in `title`. */}
      <h2 className="m-0 min-w-0 grow truncate text-xl font-semibold text-zinc-900 tablet:text-2xl" title={name}>
        {name ? `Hey, ${name}!` : "Hey there!"}
      </h2>
    </div>
  );
};

/**
 * Name and email. Delete account is only on this tab: from tablet up in the footer's bottom-left corner, opposite Okie
 * Dokie; on a phone's sheet a trash icon beside the email's Change, so the footer keeps just Okie Dokie.
 */
const Profile = ({ deletionSent, onDeletionSent }: { deletionSent: boolean; onDeletionSent: () => void }) => {
  const { profile, updateProfile, signOut } = useCurrentUser();
  const { getProfile, updateName } = useAppClient();
  const { success } = useNotifications();
  const tabletUp = useTabletUp();
  const email = profile?.email ?? "";
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

      <EmailSetting
        email={email}
        extra={!tabletUp && <DeleteAccount email={email} sent={deletionSent} onSent={onDeletionSent} iconOnly />}
      />

      {tabletUp && (
        <DialogFooterStart>
          <DeleteAccount email={email} sent={deletionSent} onSent={onDeletionSent} />
        </DialogFooterStart>
      )}
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

/**
 * Shows the email; changing it sends a confirmation link to the new address (handled by ConfirmEmailChange). `extra`
 * goes after Change (a phone's Delete account icon), hidden while the new address is typed in.
 */
const EmailSetting = ({ email, extra }: { email: string; extra?: React.ReactNode }) => {
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
        {extra}
      </div>
    </Setting>
  );
};

const noValues = {};

/**
 * Deleting the account takes two steps: this button opens a danger sheet on top of the profile, which asks to confirm,
 * then the emailed link finishes it (handled by ConfirmAccountDeletion). The sheet isn't a route: /profile/delete is
 * that link's page. Once the link is sent (`sent`, kept by the dialog), the button says so (and a toast says where).
 * `iconOnly`: just the trash can (a mail icon once sent), the size of the X beside a field, named in its label.
 */
const DeleteAccount = ({ email, sent, onSent, iconOnly }: { email: string; sent: boolean; onSent: () => void; iconOnly?: boolean }) => {
  const { requestAccountDeletion } = useAppClient();
  const { success } = useNotifications();
  const [confirming, setConfirming] = React.useState(false);
  // One id per confirmation: retrying it after a failure is fine, it never emails twice.
  const requestId = React.useRef("");
  const iconSize = iconOnly ? 20 : 18;
  const iconClass = iconOnly ? "size-10 shrink-0 px-0" : undefined;

  const startConfirming = React.useCallback(
    () => {
      requestId.current = crypto.randomUUID();
      setConfirming(true);
    },
    [],
  );

  const keep = React.useCallback(() => setConfirming(false), []);

  // A failure keeps the sheet open (the toast says what went wrong), to try again.
  const onConfirm = React.useCallback(
    async () => {
      if (await requestAccountDeletion(requestId.current)) {
        setConfirming(false);
        onSent();
        success(`Check ${email} for the link. Your account is deleted only once you click it.`);
      }
    },
    [
      requestAccountDeletion,
      onSent,
      success,
      email,
    ],
  );

  return (
    <>
      {sent
        ? (
          <Button
            type="button"
            variant="ghost"
            className={iconClass}
            disabled
            aria-label={iconOnly ? "Check your email" : undefined}
            title={`We've sent a link to ${email}`}
          >
            <Mail size={iconSize} aria-hidden="true" />{!iconOnly && " Check your email"}
          </Button>
        )
        : (
          <Button
            type="button"
            variant="ghost-destructive"
            className={iconClass}
            aria-label={iconOnly ? "Delete account" : undefined}
            title={iconOnly ? "Delete account" : undefined}
            onClick={startConfirming}
          >
            <Trash2 size={iconSize} aria-hidden="true" />{!iconOnly && " Delete account"}
          </Button>
        )}

      {confirming && !sent && (
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
    </>
  );
};

const History = () => {
  const { loading, page, fetchMore } = usePartyHistory();
  const tabletUp = useTabletUp();

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
      {/* From tablet up in the footer's bottom-left corner (Delete account's on the Profile tab); on a phone's sheet
          right under the list, above the stacked footer. Once pressed, reaching the end loads the rest (with the
          spinner above), so the button goes away. */}
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
