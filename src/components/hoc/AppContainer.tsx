import { useCurrentUser } from "src/components/hooks/useCurrentUser";

export const AppContainer = () => {
  const { user } = useCurrentUser();
  console.log({ user });
  return (
    <>
      Howdy!
    </>
  )
};
