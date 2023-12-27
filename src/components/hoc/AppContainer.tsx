import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import React from "react";
import DocumentMeta from "react-document-meta";
import { Route, RouterProvider, Routes, createBrowserRouter } from "react-router-dom";

import { EnterContainer } from "src/components/hoc/EnterContainer";
import { NotificationsContainer } from "src/components/hoc/NotificationsContainer";
import { PartyContainer } from "src/components/hoc/PartyContainer";
import { WelcomeBox } from "src/components/hoc/WelcomeBox";

import { apiEndpoint } from "src/config.json";

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
  const client = React.useMemo(
    () => new ApolloClient({
      uri: `${apiEndpoint}/graph/`,
      cache: new InMemoryCache(),
    }),
    [],
  );


  return (
    <ApolloProvider client={client}>
      <DocumentMeta title="Anonymous Ded Morozes">
        <NotificationsContainer />

        <Routes>
          <Route path="/*" Component={WelcomeBox} />
          <Route path="/p/:code/*" Component={PartyContainer} />
          <Route path="/enter/:token" Component={EnterContainer} />
        </Routes>
      </DocumentMeta>
    </ApolloProvider>
  );
}
