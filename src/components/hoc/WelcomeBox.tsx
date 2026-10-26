import React from "react";
import { Route, Routes } from "react-router";
import { Navigate } from "react-router-dom";

import { GarageDoor } from "@/components/GarageDoor";
import { EnterContainer } from "@/components/hoc/EnterContainer";
import { LoginBox } from "@/components/hoc/LoginBox";
import { useCurrentUser } from "@/components/hooks";

// The signed-in home, behind the door: loaded once someone is signed in, not for the front door.
const StartPage = React.lazy(() => import("@/components/hoc/StartPage").then(m => ({ default: m.StartPage })));

export const WelcomeBox = () => {
  const { profile } = useCurrentUser();

  const renderLoginContainer = React.useCallback(
    () => (
      <Routes>
        <Route path="/*" Component={LoginBox} />
        {/* Sign-in links: /enter/link#token (older ones /enter/:token). */}
        <Route path="/enter/link" Component={EnterContainer} />
        <Route path="/enter/:token" Component={EnterContainer} />
      </Routes>
    ),
    [],
  );

  return (
    <GarageDoor locked={!profile} doorRenderer={renderLoginContainer}>
      <React.Suspense fallback={null}>
        <StartPage />
      </React.Suspense>

      <Routes location={location} key={location.pathname}>
        <Route path="/enter/*" element={<Navigate to="/" replace={true} />} />
      </Routes>
    </GarageDoor>
  );
};
