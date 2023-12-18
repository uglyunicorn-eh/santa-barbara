import TheConfetti from 'react-confetti';

export const Confetti = () => (
  <TheConfetti
    recycle={false}
    numberOfPieces={750}
    style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0 }}
  />
);
