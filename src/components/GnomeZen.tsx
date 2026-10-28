import React from "react";
import { SyncLoader } from "react-spinners";

// An easter egg in the gnome's bubble while the party waits for its dice (gnome.css). The bubble shows "•••", as if the
// gnome were thinking; a click (or a tap, or Enter) makes him say one of his little bits of wisdom, never the same twice
// in a row, and after a while he goes back to thinking.

const LINES = [
  "When the time comes, you'll know.",
  "A watched dice never rolls.",
  "Patience, young elf. Even snow falls one flake at a time.",
  "The gift you seek is already seeking you.",
  "The stars say: soon. The stars always say soon.",
  "Shhh. The elf is doing his complex math.",
  "Ask not whom you'll gift. Ask what socks they wear.",
  "Before the dice: wait. After the dice: shop.",
  "He who peeks early gets coal.",
  "Every party starts with one brave click. Not this one, though.",
  "The best surprises are the ones you wait for.",
  "I am not sleeping. I am rolling the dice in my mind.",
];

/** How long a line stays, by its length: long enough to read, then back to thinking. */
const showMs = (line: string) => 3500 + line.length * 45;

export const GnomeZen = () => {
  const [line, setLine] = React.useState<number | null>(null);

  React.useEffect(
    () => {
      if (line === null) {
        return;
      }
      const timer = setTimeout(() => setLine(null), showMs(LINES[line]));
      return () => clearTimeout(timer);
    },
    [line],
  );

  const speak = () => setLine(last => {
    // Any line but the one just said.
    const next = Math.floor(Math.random() * (LINES.length - 1));
    return last !== null && next >= last ? next + 1 : next;
  });

  return (
    <button type="button" className="gnome-zen" onClick={speak} aria-label="Ask the gnome" title="Ask the gnome">
      {line === null
        ? <SyncLoader size={10} />
        // Read out when it changes, like someone speaking.
        : <span className="gnome-zen-line" aria-live="polite">&mdash; {LINES[line]}</span>}
    </button>
  );
};
