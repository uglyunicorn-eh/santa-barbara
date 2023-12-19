import React from 'react';
import { Button } from 'react-bulma-components';
import Confetti from 'react-confetti';
import type { ButtonProps } from 'src/types';

type Props = {
  children?: React.ReactNode;
} & ButtonProps;

export const ConfettiButton = (props: Props) => {
  const [rolling, setRolling] = React.useState(false);

  const onClick = React.useCallback(
    () => setRolling(true),
    [],
  );

  const onConfettiComplete = React.useCallback(
    (confetti: any) => {
      confetti.reset();
      setRolling(false);
    },
    [],
  );
  return (
    <>
      <Confetti
        recycle={false}
        run={rolling}
        numberOfPieces={750}
        onConfettiComplete={onConfettiComplete}
        style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0 }}
      />
      <Button color="primary" {...props} loading={rolling} onClick={onClick} />
    </>
  );
};
