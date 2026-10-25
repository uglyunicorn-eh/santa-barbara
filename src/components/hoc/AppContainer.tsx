import React from "react";
import { Route, RouterProvider, Routes, createBrowserRouter } from "react-router-dom";

import { ConfirmAccountDeletion, ConfirmEmailChange } from "src/components/hoc/AccountLinks";
import { NotificationsContainer } from "src/components/hoc/NotificationsContainer";
import { PartyContainer } from "src/components/hoc/PartyContainer";
import { WelcomeBox } from "src/components/hoc/WelcomeBox";

export const AppContainer = () => {
  const router = React.useMemo(
    () => createBrowserRouter([
      { path: "*", Component: Root },
    ]),
    [],
  );

  return (
    <RouterProvider router={router} />
  )
};

function Root() {
  return (
    <>
      <title>Anonymous Ded Morozes</title>
      <NotificationsContainer />

      <Routes>
        <Route path="/*" Component={WelcomeBox} />
        <Route path="/p/:code/*" Component={PartyContainer} />
        {/* Emailed links: they work signed in or not, so they sit outside the login door. */}
        <Route path="/profile/delete/:token" Component={ConfirmAccountDeletion} />
        <Route path="/profile/email/:token" Component={ConfirmEmailChange} />
      </Routes>
    </>
  );
}
