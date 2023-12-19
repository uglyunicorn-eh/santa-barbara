import React from "react";
import DocumentMeta from "react-document-meta";
import { Route, RouterProvider, Routes, createBrowserRouter } from "react-router-dom";

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
    <DocumentMeta title="Anonymous Ded Morozes">
      <NotificationsContainer />

      <Routes>
        <Route path="/*" Component={WelcomeBox} />
        <Route path="/p/:code/*" Component={PartyContainer} />
      </Routes>
    </DocumentMeta>
  );
}
