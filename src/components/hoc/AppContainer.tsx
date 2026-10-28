import React from "react";
import { Route, RouterProvider, Routes, createBrowserRouter } from "react-router-dom";

import { NotificationsContainer } from "@/components/hoc/NotificationsContainer";
import { WelcomeBox } from "@/components/hoc/WelcomeBox";
import { UnrevealedProvider } from "@/components/hooks/useUnrevealed";
import { pageTitle } from "@/site";

// Loaded when their page first shows, so the front door (most visitors' first page) doesn't download them.
const PartyContainer = React.lazy(() => import("@/components/hoc/PartyContainer").then(m => ({ default: m.PartyContainer })));
const accountLinks = () => import("@/components/hoc/AccountLinks");
const ConfirmAccountDeletion = React.lazy(() => accountLinks().then(m => ({ default: m.ConfirmAccountDeletion })));
const ConfirmEmailChange = React.lazy(() => accountLinks().then(m => ({ default: m.ConfirmEmailChange })));
const CancelEmailChange = React.lazy(() => accountLinks().then(m => ({ default: m.CancelEmailChange })));

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
    <UnrevealedProvider>
      <title>{pageTitle()}</title>
      <NotificationsContainer />

      <React.Suspense fallback={null}>
        <Routes>
          <Route path="/*" Component={WelcomeBox} />
          <Route path="/p/:code/*" Component={PartyContainer} />
          {/* Emailed links: they work signed in or not, so they sit outside the login door. */}
          {/* They carry the token after "#" (older ones in the path); the page takes it off the URL (useLinkToken). */}
          <Route path="/profile/delete" Component={ConfirmAccountDeletion} />
          <Route path="/profile/delete/:token" Component={ConfirmAccountDeletion} />
          <Route path="/profile/email/cancel" Component={CancelEmailChange} />
          <Route path="/profile/email/cancel/:token" Component={CancelEmailChange} />
          <Route path="/profile/email" Component={ConfirmEmailChange} />
          <Route path="/profile/email/:token" Component={ConfirmEmailChange} />
        </Routes>
      </React.Suspense>
    </UnrevealedProvider>
  );
}
