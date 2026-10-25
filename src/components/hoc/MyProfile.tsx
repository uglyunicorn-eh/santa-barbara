import { useField, useFormikContext } from "formik";
import React from "react";
import { Button, Content, Form as BulmaForm, Tabs } from "src/components/bulma";
import { Link } from "react-router-dom";
import { Route, Routes } from "react-router-dom";
import { ClipLoader } from 'react-spinners';
import { Calendar, ChevronRight, Gift, Lock, Star } from 'react-feather';
import * as Yup from 'yup';

import { DialogBox } from "src/components/DialogBox";
import { Tab } from "src/components/Tab";
import { Form, FormFieldContext, Input, Submit } from "src/components/forms";
import { useNotifications } from "src/components/hoc/NotificationsContainer";
import { useAppClient, useCurrentUser, useSignals } from "src/components/hooks";
import { PARTIES_CHANGED } from "src/components/hooks/useAppClient";
import type { RequestEmailChangeInput, UpdateNameInput } from "src/components/hooks/useAppClient";
import type { Party } from "src/types";

/** The latest parties shown when the history opens. */
const HISTORY_FIRST_PAGE_SIZE = 5;
/** How many more each "Show more" (or scroll to the end) loads. */
const HISTORY_MORE_PAGE_SIZE = 10;

const SITE_NAME = "Anonymous Ded Morozes";

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

const nameValidationSchema = Yup.object().shape({
  name: Yup.string()
    .label("Name")
    .trim()
    .max(100)
    .required()
    .ensure(),
});

/** Rejects the current address here, so the request (and its emailing rate limit) is never spent on it. */
const emailValidationSchema = (currentEmail: string) => Yup.object().shape({
  email: Yup.string()
    .label("New email")
    .trim()
    .max(128)
    .required()
    .email()
    .test("not-current", "That's already your email.", value => value?.toLowerCase() !== currentEmail.toLowerCase())
    .ensure(),
});

export const MyProfile = () => (
  <DialogBox
    className={"profile-box"}
    noHeader
    dismissLabel={"Okie Dokie!"}
    cardStyle={{
      width: 800,
    }}
  >
    <Tabs size={"large"} align={"center"} fullwidth>
      <Tab to="/profile/" exact>Profile</Tab>
      <Tab to="/profile/history/">Latest history</Tab>
    </Tabs>
    <Content>
      <Routes>
        <Route path="" Component={Profile} />
        <Route path="history/" Component={History} />
      </Routes>
    </Content>
  </DialogBox>
);

const Profile = () => {
  const { profile, updateProfile, signOut } = useCurrentUser();
  const { getProfile, updateName } = useAppClient();
  const { success } = useNotifications();

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
      <title>{`My profile | ${SITE_NAME}`}</title>

      <Setting
        label="Name"
        hint="We'll suggest it when you join a new party. Parties you've already joined keep the name you joined with."
      >
        <Form
          initialValues={{ name: profile?.name ?? "" }}
          enableReinitialize
          validateOnBlur={false}
          validationSchema={nameValidationSchema}
          onSubmit={onSubmit}
        >
          <InlineField name="name" action={<SaveButton />}>
            <Input placeholder="How should your friends call you?" />
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

/** An input with its button on the same line, and the field's error (shown after a submit) underneath. */
const InlineField = ({ name, action, children }: { name: string, action: React.ReactNode, children: React.ReactNode }) => {
  const [, meta] = useField(name);

  return (
    <FormFieldContext.Provider value={{ name }}>
      <div className="setting-control">
        <div className="setting-input">{children}</div>
        {action}
      </div>
      {meta.error && meta.touched && <BulmaForm.Help color="danger">{meta.error}</BulmaForm.Help>}
    </FormFieldContext.Provider>
  );
};

/** Saves the name; there is nothing to save until it is edited. */
const SaveButton = () => {
  const { dirty } = useFormikContext();
  return <Submit size="small" disabled={!dirty}>Save</Submit>;
};

/** Shows the email; changing it sends a confirmation link to the new address (handled by ConfirmEmailChange). */
const EmailSetting = ({ email }: { email: string }) => {
  const { requestEmailChange } = useAppClient();
  const [editing, setEditing] = React.useState(false);
  const [sentTo, setSentTo] = React.useState<string>();
  // One id per opened form: sending the same address again from it doesn't email twice; a new address is a new request.
  const requestId = React.useRef("");

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
        <Form initialValues={{ email: "" }} validateOnBlur={false} validationSchema={emailValidationSchema(email)} onSubmit={onSubmit}>
          <InlineField
            name="email"
            action={
              <>
                <Submit size="small">Send link</Submit>
                <Button type="button" size="small" text onClick={() => setEditing(false)}>Cancel</Button>
              </>
            }
          >
            <Input type="email" placeholder="Your new email address" autofocus />
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
        <Button type="button" size="small" text onClick={startEditing}>Change</Button>
      </div>
    </Setting>
  );
};

/** Deleting the account takes two steps: confirm here, then click the emailed link (handled by ConfirmAccountDeletion). */
const DeleteAccount = ({ email }: { email: string }) => {
  const { requestAccountDeletion } = useAppClient();
  const [stage, setStage] = React.useState<"idle" | "confirming" | "sending" | "sent">("idle");
  // One id per confirmation: retrying it after a failure is fine, it never emails twice.
  const requestId = React.useRef("");

  const startConfirming = React.useCallback(
    () => {
      requestId.current = crypto.randomUUID();
      setStage("confirming");
    },
    [],
  );

  const onConfirm = React.useCallback(
    async () => {
      setStage("sending");
      setStage(await requestAccountDeletion(requestId.current) ? "sent" : "confirming");
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
        {stage === "idle" && (
          <Button type="button" size="small" color="danger" outlined onClick={startConfirming}>
            Delete account
          </Button>
        )}
      </div>

      {(stage === "confirming" || stage === "sending") && (
        <div className="danger-confirm">
          <p>
            Sure? Parties that already rolled the dice keep your name, so whoever drew you still knows who to buy a
            gift for. We'll email you a link to finish.
          </p>
          <div className="setting-control">
            <Button type="button" size="small" color="danger" onClick={onConfirm} loading={stage === "sending"}>
              Yes, email me the link
            </Button>
            <Button type="button" size="small" text onClick={() => setStage("idle")} disabled={stage === "sending"}>
              Keep my account
            </Button>
          </div>
        </div>
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
        { root: sentinel.closest('.modal-card-body'), rootMargin: "100px" },
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

  const title = <title>{`My party history | ${SITE_NAME}`}</title>;

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

  return (
    <div className="history">
      {title}
      <ul className="history-list">
        {page.items.map(party => <HistoryItem key={party.code} party={party} />)}
      </ul>

      {hasMore && (
        <div className="history-more" ref={sentinelRef}>
          {autoLoad && loadingMore
            ? <ClipLoader size={20} />
            : <Button outlined size="small" onClick={onMoreClick} loading={loadingMore}>Show more parties</Button>
          }
        </div>
      )}
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
