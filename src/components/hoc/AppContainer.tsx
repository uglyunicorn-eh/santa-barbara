import React from "react";
import { Route, RouterProvider, Routes, createBrowserRouter } from "react-router-dom";

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
    <Routes>
      <Route path="" Component={WelcomeBox} />
      <Route path="p">
        <Route path="new" Component={WelcomeBox} />
        <Route path="join" Component={WelcomeBox} />
        <Route path=":party" element={<>PARTY!!!!</>} />
      </Route>
    </Routes>
  );
}
