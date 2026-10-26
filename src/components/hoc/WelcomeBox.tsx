import React from "react";
import { Route, Routes } from "react-router";
import { Navigate } from "react-router-dom";

import { GarageDoor } from "@/components/GarageDoor";
import { EnterContainer } from "@/components/hoc/EnterContainer";
import { LoginBox } from "@/components/hoc/LoginBox";
import { StartPage } from "@/components/hoc/StartPage";
import { useCurrentUser } from "@/components/hooks";

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
      <StartPage />

      <Routes location={location} key={location.pathname}>
        <Route path="/enter/*" element={<Navigate to="/" replace={true} />} />
      </Routes>
    </GarageDoor>
  );
};
