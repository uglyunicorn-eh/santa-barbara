import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import React from "react";
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
  const { userTokenValue } = useCurrentUser();

  const authLink = React.useMemo(
    () => new ApolloLink((operation, forward) => {
      operation.setContext({
        headers: {
          ...(userTokenValue ? { authorization: `Bearer ${userTokenValue}` } : {}),
        },
      });

      return forward(operation);
    }),
    [
      userTokenValue,
    ],
  );

  const client = React.useMemo(
    () => new ApolloClient({
      link: authLink.concat(httpLink),
      cache: new InMemoryCache({
        typePolicies: {
          Query: {
            fields: {
              // History pages share one cache entry: the first page replaces it, later pages (with `after`) append.
              partyHistory: {
                keyArgs: false,
                merge(existing, incoming, { args }) {
                  if (!args?.after || !existing) {
                    return incoming;
                  }
                  return { ...incoming, items: [...existing.items, ...incoming.items] };
                },
              },
            },
          },
        },
      }),
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
      <title>Anonymous Ded Morozes</title>
        <NotificationsContainer />

        <Routes>
          <Route path="/*" Component={WelcomeBox} />
          <Route path="/p/:code/*" Component={PartyContainer} />
        </Routes>
    </ApolloProvider>
  );
}
