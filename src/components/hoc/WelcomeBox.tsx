import React from "react";
import { Route, Routes } from "react-router";
import { Navigate } from "react-router-dom";

import { GarageDoor } from "src/components/GarageDoor";
import { EnterContainer } from "src/components/hoc/EnterContainer";
import { LoginBox } from "src/components/hoc/LoginBox";
import { StartPage } from "src/components/hoc/StartPage";
import { useCurrentUser } from "src/components/hooks";

export const WelcomeBox = () => {
  const { profile } = useCurrentUser();

  const renderLoginContainer = React.useCallback(
    () => (
      <Routes>
        <Route path="/*" Component={LoginBox} />
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
