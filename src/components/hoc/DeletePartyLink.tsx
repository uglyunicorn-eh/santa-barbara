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
      <p className="has-text-centered-touch" style={{ marginTop: '2em' }}>
        <Button color="danger" outlined size="small" onClick={onClick}>Delete this party</Button>
      </p>
      <Routes>
        <Route path="delete" Component={ConfirmPartyDelete} />
      </Routes>
    </>
  );
};
