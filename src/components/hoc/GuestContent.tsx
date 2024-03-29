import React from 'react';
import { Button } from 'react-bulma-components';
import { Route, Routes, useNavigate } from 'react-router-dom';

import { ConfirmPartyLeave } from 'src/components/hoc/ConfirmPartyLeave';
import type { Party, User } from 'src/types';

type Props = {
  party: Party;
  user: User;
}

export const GuestContent = ({ party, user }: Props) => {
  const navigate = useNavigate();

  const onConfirm = React.useCallback(
    () => {
      navigate('leave');
    },
    [
      navigate,
    ],
  );

  const participants = React.useMemo(
    () => {
      const result = ['You'];

      if (party.participantCount) {
        if (party.participantCount > 2) {
          result.push(`and ${party.participantCount - 1} more nice ${party.participantCount - 1 === 1 ? 'person' : 'people'}`);
          if (party.participants) {
            result.push(result.pop() + ',');
            const pp = party.participants.slice(0, party.participants.length);
            const onePerson = pp.pop();
            if (pp.length > 0) {
              const persons = [pp.join(', '), onePerson].join(' and ');
              result.push(`including ${persons}`);
            }
          }
        } else if (party.participants) {
          result.push(`and ${party.participants[0]}`);
        }
      }

      return result;
    },
    [
      party,
    ],
  );

  return (
    <>
      <p>
        Hey, {user.name}! Welcome to the <strong>{party.name.replace(/!+$/, '')}</strong>!<br />
      </p>

      {(participants.length > 1) && <p>Good news! {participants.join(' ')} are participating in this.</p>}

      <p>
        We're currently waiting for everybody else to join the party, and then our special elf will do
        some complex math to decide who should give a gift to whom.
      </p>
      <p>
        Don't worry, it shouldn't take long. Last year, we had a whole two days to find and buy the gifts.
        Everything's under control; he knows what he's doing!
      </p>

      {!party.isClosed && (
        <>
          <p style={{ margin: '2em 0' }} className="has-text-centered-touch">
            <Button color="black" outlined onClick={onConfirm}>I changed my mind and wanna quit...</Button>
          </p>

          <Routes>
            <Route path="leave" Component={ConfirmPartyLeave} />
          </Routes>
        </>
      )}
    </>
  );
}

export default GuestContent;
