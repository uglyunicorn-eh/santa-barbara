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
import type { UpdateNameInput } from "src/components/hooks/useAppClient";
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

      <BulmaForm.Field horizontal>
        <BulmaForm.Label>Email</BulmaForm.Label>
        <BulmaForm.Field.Body>
          <BulmaForm.Control>
            <BulmaForm.Input value={profile?.email ?? ""} readOnly isStatic />
          </BulmaForm.Control>
        </BulmaForm.Field.Body>
      </BulmaForm.Field>

      <div className="actions">
        <Submit>Save</Submit>
      </div>
    </Form>
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
