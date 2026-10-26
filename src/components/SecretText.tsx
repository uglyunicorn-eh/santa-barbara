import React from "react";
import { Button } from "@/components/ui/button";

type Props = {
  label: string;
  children: React.ReactNode;
  /** Called once, when the secret is shown. */
  onReveal?: () => void;
}

/** A secret behind a button: pressing it shows the secret. */
export const SecretText = ({ label, children, onReveal }: Props) => {
  const [revealed, setRevealed] = React.useState(false);

  const reveal = React.useCallback(
    () => {
      setRevealed(true);
      onReveal?.();
    },
    [onReveal],
  );

  return (
    revealed ? <>{children}</> : <Button variant="primary" pill onClick={reveal}>{label}</Button>
  );
};
