import { Route, RouterProvider, Routes, createBrowserRouter } from "react-router-dom";

import { WelcomeBox } from "src/components/hoc/WelcomeBox";

const router = createBrowserRouter([
  { path: "*", Component: Root },
]);

export const AppContainer = () => <RouterProvider router={router} />;

function Root() {
  return (
    <Routes>
      <Route path="/" element={<WelcomeBox />} />
    </Routes>
  );
}
