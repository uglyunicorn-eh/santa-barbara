import { useCurrentUser } from "src/components/hooks/useCurrentUser";
import { WelcomeBox } from "src/components/hoc/WelcomeBox";

export const AppContainer = () => {
  const { user } = useCurrentUser();
  console.log({ user });
  return (
    <>
      <WelcomeBox />
    </>
  )
};
