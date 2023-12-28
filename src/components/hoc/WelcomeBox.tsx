import React from "react";
import { Route, Routes, useNavigate } from "react-router";

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
        <Route path="/enter/*" Component={RedirectToHome} />
      </Routes>
    </GarageDoor>
  );
};

const RedirectToHome = () => {
  const navigate = useNavigate();

  React.useEffect(
    () => {
      navigate("/");
    },
    [],
  );

  return null;
}
