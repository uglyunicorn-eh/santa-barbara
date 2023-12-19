import React from 'react';
import { Button } from 'react-bulma-components';

import type { Party, User } from 'src/types';

type Props = {
  party: Party;
  user: User;
}

const HostContent = ({ party, user }: Props) => {
  const participantCount = React.useMemo(
    () => (
      party.participantCount === 1
        ? <>Currently only you are participating in the party. But don't worry, it's just the beginning...</>
        : <>Currently {party.participantCount} nice people are participating in this, including you!</>
    ),
    [
      party.participantCount,
    ],
  );

  return (
    <>
      <p>Hey, {user.name}! That's so awesome you're gathering the {party.name.replace(/!+$/, '')}!<br /></p>
      <p>{participantCount}</p>
      {party.participantCount! > 1 && <p>Here's a full list: {party.participants!.join(', ')}.</p>}
      <p>If you feel you're ready to Go then Go! Go ahead and press a button bellow. Have fun!</p>

      {!party.closed && <p style={{ margin: '2em 0' }} className="has-text-centered-touch">
        <Button color="primary">&#x1F643; OK, Let's roll the dice!</Button>
      </p>}
    </>
  );
}

export default HostContent;
