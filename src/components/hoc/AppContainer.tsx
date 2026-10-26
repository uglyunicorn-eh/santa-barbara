import React from "react";
import { Route, RouterProvider, Routes, createBrowserRouter } from "react-router-dom";

import { CancelEmailChange, ConfirmAccountDeletion, ConfirmEmailChange } from "@/components/hoc/AccountLinks";
import { NotificationsContainer } from "@/components/hoc/NotificationsContainer";
import { PartyContainer } from "@/components/hoc/PartyContainer";
import { WelcomeBox } from "@/components/hoc/WelcomeBox";

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
        {/* Deletion links carry the token after "#" (older ones in the path); the page takes it off the URL. */}
        <Route path="/profile/delete" Component={ConfirmAccountDeletion} />
        <Route path="/profile/delete/:token" Component={ConfirmAccountDeletion} />
        <Route path="/profile/email/cancel/:token" Component={CancelEmailChange} />
        <Route path="/profile/email/:token" Component={ConfirmEmailChange} />
      </Routes>
    </>
  );
}
