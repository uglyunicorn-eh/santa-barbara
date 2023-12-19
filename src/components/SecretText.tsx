import React from "react";
import { Button } from "react-bulma-components";

type Props = {
  label: string;
  children: React.ReactNode;
}

export const SecretText = ({ label, children }: Props) => {
  const [revealed, setRevealed] = React.useState(false);

  const reveal = React.useCallback(
    () => setRevealed(true),
    [],
  );

  return (
    revealed ? <>{children}</> : <Button color="primary" rounded onClick={reveal}>{label}</Button>
  );
};
