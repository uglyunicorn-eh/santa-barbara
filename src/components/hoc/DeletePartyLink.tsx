import React from 'react';
import { Button } from "src/components/bulma";
import { Route, Routes, useNavigate } from 'react-router-dom';

import { ConfirmPartyDelete } from 'src/components/hoc/ConfirmPartyDelete';

/** The host's quiet "delete" action beside the roll-the-dice button, with its confirmation dialog at ./delete. */
export const DeletePartyLink = () => {
  const navigate = useNavigate();
  const onClick = React.useCallback(() => navigate('delete'), [navigate]);

  return (
    <>
      <Button className="is-ghost has-text-danger" onClick={onClick}>
        <span aria-hidden="true" style={{ marginRight: '0.5em' }}>💥</span>
        Delete this party
      </Button>
      <Routes>
        <Route path="delete" Component={ConfirmPartyDelete} />
      </Routes>
    </>
  );
};
