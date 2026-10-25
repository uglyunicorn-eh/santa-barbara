import React from 'react';
import { Button } from "src/components/bulma";
import { Route, Routes, useNavigate } from 'react-router-dom';

import { ConfirmPartyDelete } from 'src/components/hoc/ConfirmPartyDelete';

/** The host's quiet "delete" action under the party, with its confirmation dialog at ./delete. */
export const DeletePartyLink = () => {
  const navigate = useNavigate();
  const onClick = React.useCallback(() => navigate('delete'), [navigate]);

  return (
    <>
      <p className="has-text-centered-touch" style={{ marginTop: '3em' }}>
        <Button color="danger" light onClick={onClick}>
          <span aria-hidden="true" style={{ marginRight: '0.5em' }}>💥</span>
          Delete this party
        </Button>
      </p>
      <Routes>
        <Route path="delete" Component={ConfirmPartyDelete} />
      </Routes>
    </>
  );
};
