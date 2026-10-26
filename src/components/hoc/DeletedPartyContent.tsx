import React from 'react';
import { Button } from "@/components/ui/button";

import { useAppClient, useSignals } from "@/components/hooks";
import type { Party, User } from '@/types';

type Props = {
  party: Party;
  user: User;
}

/** What the host sees after deleting a party: nobody else can see it, and it can be restored for a day. */
export const DeletedPartyContent = ({ party, user }: Props) => {
  const { restoreParty } = useAppClient();
  const { signal } = useSignals();
  const [busy, setBusy] = React.useState(false);

  const until = party.restorableUntil
    ? new Date(party.restorableUntil).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    : null;

  const onRestore = React.useCallback(
    async () => {
      setBusy(true);
      try {
        if (await restoreParty({ party: party.code })) {
          signal('party:updated');
        }
      } finally {
        setBusy(false);
      }
    },
    [
      party.code,
      restoreParty,
      signal,
    ],
  );

  return (
    <>
      <p>
        {user.name}, you deleted <strong>{party.name.replace(/!+$/, '')}</strong>. Nobody else can see it now,
        and its link doesn't work.
      </p>
      <p>
        {until
          ? <>You can bring it back, with everyone and everything in it, until <strong>{until}</strong>. After that it's gone for good.</>
          : <>You can bring it back, with everyone and everything in it, for a day after deleting it.</>}
      </p>
      <p style={{ margin: '2em 0' }} className="max-desktop:text-center">
        <Button variant="primary" onClick={onRestore} loading={busy}>&#x1FA84; Restore the party</Button>
      </p>
    </>
  );
};
