import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import React from "react";
import { Button, Content, Form as BulmaForm, Tabs } from "src/components/bulma";
import { Link } from "react-router-dom";
import { Route, Routes } from "react-router-dom";
import { ClipLoader } from 'react-spinners';
import { Gift, Star } from 'react-feather';
import * as Yup from 'yup';

import { DialogBox } from "src/components/DialogBox";
import { Tab } from "src/components/Tab";
import { Form, FormField, Input, Submit } from "src/components/forms";
import { useNotifications } from "src/components/hoc/NotificationsContainer";
import { useAppClient, useCurrentUser } from "src/components/hooks";
import type { RequestEmailChangeInput, UpdateNameInput } from "src/components/hooks/useAppClient";
import type { Party } from "src/types";

const HISTORY_PAGE_SIZE = 10;

const HISTORY_QUERY = gql`
  query PartyHistory($first: Int, $after: String) {
    partyHistory(first: $first, after: $after) {
      items {
        id
        code
        name
        isClosed
        isHost
      }
      hasMore
      endCursor
    }
  }
`;

type PartyHistory = {
  partyHistory: {
    items: Party[];
    hasMore: boolean;
    endCursor: string | null;
  } | null;
};

const nameValidationSchema = Yup.object().shape({
  name: Yup.string()
    .label("Name")
    .trim()
    .max(100)
    .required()
    .ensure(),
});

const emailValidationSchema = Yup.object().shape({
  email: Yup.string()
    .label("New email")
    .trim()
    .max(128)
    .required()
    .email()
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
    <>
      <Form
        initialValues={{ name: profile?.name ?? "" }}
        enableReinitialize
        validationSchema={nameValidationSchema}
        onSubmit={onSubmit}
      >
        <FormField
          name="name"
          label="Name"
          children={<Input placeholder="How should your friends call you?" />}
          help="We'll suggest it whenever you join a new party. Parties you've already joined keep the name you joined with."
        />

        <div className="actions">
          <Submit>Save</Submit>
        </div>
      </Form>

      <EmailSection email={profile?.email ?? ""} />

      <DeleteAccountSection email={profile?.email ?? ""} />
    </>
  );
};

/** Shows the email; changing it sends a confirmation link to the new address (handled by ConfirmEmailChange). */
const EmailSection = ({ email }: { email: string }) => {
  const { requestEmailChange } = useAppClient();
  const [editing, setEditing] = React.useState(false);
  const [sentTo, setSentTo] = React.useState<string>();

  const onSubmit = React.useCallback(
    async (input: RequestEmailChangeInput) => {
      const newEmail = input.email.trim();
      if (await requestEmailChange({ email: newEmail })) {
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
      <Form initialValues={{ email: "" }} validationSchema={emailValidationSchema} onSubmit={onSubmit}>
        <FormField
          name="email"
          label="New email"
          children={<Input type="email" placeholder={email} autofocus />}
          help="We'll send a confirmation link to the new address. Your email changes once you click it."
        />

        <div className="actions">
          <Button type="button" text onClick={() => setEditing(false)}>Never mind</Button>
          <Submit>Send me the link</Submit>
        </div>
      </Form>
    );
  }

  return (
    <BulmaForm.Field horizontal>
      <BulmaForm.Label>Email</BulmaForm.Label>
      <BulmaForm.Field.Body>
        <BulmaForm.Control>
          <div className="profile-email">
            <BulmaForm.Input value={email} readOnly isStatic />
            <Button type="button" size="small" text onClick={() => setEditing(true)}>Change</Button>
          </div>
          {sentTo && (
            <BulmaForm.Help>
              Our elves have sent a confirmation link to {sentTo}. Until you click it, you're still {email}.
            </BulmaForm.Help>
          )}
        </BulmaForm.Control>
      </BulmaForm.Field.Body>
    </BulmaForm.Field>
  );
};

/** Deleting the account takes two steps: confirm here, then click the emailed link (handled by ConfirmAccountDeletion). */
const DeleteAccountSection = ({ email }: { email: string }) => {
  const { requestAccountDeletion } = useAppClient();
  const [stage, setStage] = React.useState<"idle" | "confirming" | "sending" | "sent">("idle");

  const onConfirm = React.useCallback(
    async () => {
      setStage("sending");
      setStage(await requestAccountDeletion() ? "sent" : "confirming");
    },
    [
      requestAccountDeletion,
    ],
  );

  return (
    <div className="danger-zone">
      <h4>Leaving us?</h4>

      {stage === "idle" && (
        <Button type="button" color="danger" outlined size="small" onClick={() => setStage("confirming")}>
          Delete my account
        </Button>
      )}

      {(stage === "confirming" || stage === "sending") && (
        <>
          <p>
            This deletes your account and every party you host that hasn't rolled the dice yet.
            Parties that already did keep your name, so whoever drew you still knows who to buy a gift for.
            We'll email you a link to confirm.
          </p>
          <div className="actions">
            <Button type="button" text onClick={() => setStage("idle")} disabled={stage === "sending"}>No, I'm staying!</Button>
            <Button type="button" color="danger" onClick={onConfirm} loading={stage === "sending"}>Yes, delete it</Button>
          </div>
        </>
      )}

      {stage === "sent" && (
        <p>
          We've sent a confirmation link to {email}. Your account is deleted only once you click it.
        </p>
      )}
    </div>
  );
};

const History = () => {
  const { loading, data, fetchMore } = useQuery<PartyHistory>(HISTORY_QUERY, {
    variables: { first: HISTORY_PAGE_SIZE },
    fetchPolicy: "cache-and-network",
  });

  const [loadingMore, setLoadingMore] = React.useState(false);
  // After the first "More" click, further pages load as the list is scrolled.
  const [autoLoad, setAutoLoad] = React.useState(false);
  const sentinelRef = React.useRef<HTMLDivElement>(null);

  const page = data?.partyHistory;
  const hasMore = Boolean(page?.hasMore && page.endCursor);

  const loadMore = React.useCallback(
    async () => {
      if (!page?.endCursor || loadingMore) {
        return;
      }
      setLoadingMore(true);
      try {
        await fetchMore({ variables: { first: HISTORY_PAGE_SIZE, after: page.endCursor } });
      }
      finally {
        setLoadingMore(false);
      }
    },
    [
      page?.endCursor,
      loadingMore,
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
      // The list scrolls inside the dialog, not the page.
      const observer = new IntersectionObserver(
        entries => entries.some(entry => entry.isIntersecting) && loadMore(),
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

  if (loading && !page) {
    return (
      <Content style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <ClipLoader />
      </Content>
    );
  }

  if (!page?.items.length) {
    return (
      <Content>
        <p>No parties yet. Host one or join a friend's, and it will show up here.</p>
      </Content>
    );
  }

  return (
    <Content>
      <ul>
        {page.items.map(
          ({ code, name, isClosed, isHost }: Party) => (
            <li key={code} className={isClosed ? "is-closed" : "is-open"}>
              <Link to={`/p/${code}/`}>
                {isHost ? <Star size={16} color="gold" /> : <Gift size={16} />} {name}
              </Link>
            </li>
          ))
        }
      </ul>

      {hasMore && (
        <div className="history-more" ref={sentinelRef}>
          {autoLoad
            ? loadingMore && <ClipLoader size={20} />
            : <Button text onClick={onMoreClick} loading={loadingMore}>More</Button>
          }
        </div>
      )}
    </Content>
  );
};
