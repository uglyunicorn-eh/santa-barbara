import React from 'react';
import { Button } from "@/components/ui/button";
import { Route, Routes, useNavigate } from 'react-router-dom';

import { ConfirmPartyDelete } from 'src/components/hoc/ConfirmPartyDelete';

/** The host's quiet "delete" action beside the roll-the-dice button, with its confirmation dialog at ./delete. */
export const DeletePartyLink = () => {
  const navigate = useNavigate();
  const onClick = React.useCallback(() => navigate('delete'), [navigate]);

  return (
    <>
      <Button variant="ghost-destructive" onClick={onClick}>
        <span aria-hidden="true">💥</span>
        Delete this party
      </Button>
      <Routes>
        <Route path="delete" Component={ConfirmPartyDelete} />
      </Routes>
    </>
  );
};
