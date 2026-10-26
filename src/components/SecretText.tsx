import React from "react";
import { Button } from "@/components/ui/button";

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
    revealed ? <>{children}</> : <Button variant="primary" onClick={reveal}>{label}</Button>
  );
};
