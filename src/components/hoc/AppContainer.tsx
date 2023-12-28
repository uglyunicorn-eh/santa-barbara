import { ApolloClient, ApolloLink, ApolloProvider, HttpLink, InMemoryCache } from "@apollo/client";
import React from "react";
import DocumentMeta from "react-document-meta";
import { Route, RouterProvider, Routes, createBrowserRouter } from "react-router-dom";

import { NotificationsContainer } from "src/components/hoc/NotificationsContainer";
import { PartyContainer } from "src/components/hoc/PartyContainer";
import { WelcomeBox } from "src/components/hoc/WelcomeBox";
import { useCurrentUser } from "src/components/hooks";

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

const httpLink = new HttpLink({ uri: `${apiEndpoint}/graph/` });

function Root() {
  const { userTokenJWT } = useCurrentUser();

  const authLink = React.useMemo(
    () => new ApolloLink((operation, forward) => {
      operation.setContext({
        headers: {
          authorization: userTokenJWT ? `Bearer ${userTokenJWT}` : null,
        },
      });

      return forward(operation);
    }),
    [
      userTokenJWT,
    ],
  );

  const client = React.useMemo(
    () => new ApolloClient({
      link: authLink.concat(httpLink),
      cache: new InMemoryCache(),
      defaultOptions: {
        query: {
          fetchPolicy: "network-only",
        }
      }
    }),
    [
      authLink,
    ],
  );

  return (
    <ApolloProvider client={client}>
      <DocumentMeta title="Anonymous Ded Morozes">
        <NotificationsContainer />

        <Routes>
          <Route path="/*" Component={WelcomeBox} />
          <Route path="/p/:code/*" Component={PartyContainer} />
        </Routes>
      </DocumentMeta>
    </ApolloProvider>
  );
}
