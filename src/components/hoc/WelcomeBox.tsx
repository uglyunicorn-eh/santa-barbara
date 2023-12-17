import React from "react";

import { GarageDoor } from "src/components/GarageDoor";
import { LoginBox } from "src/components/hoc/LoginBox";
import { StartPage } from "src/components/hoc/StartPage";
import { useCurrentUser } from "src/components/hooks";

export const WelcomeBox = () => {
  const { user } = useCurrentUser();

  const renderLoginContainer = React.useCallback(
    () => <LoginBox />,
    [],
  );

  return (
    <GarageDoor locked={!user} doorRenderer={renderLoginContainer}>
      <StartPage />
    </GarageDoor>
  );
}
