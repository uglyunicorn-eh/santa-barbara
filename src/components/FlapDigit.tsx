import React from "react";

// Split-flap digits (odometer.css): each a card split across the middle, the top half folding down onto the next
// digit. The Party'o'meter rolls them like a counter; the party countdown flips them like a clock.
//
// The digits are drawn here as SVG strokes, not set in a font: condensed and geometric, in the spirit of DIN (straight
// stems, round bowls, one even stroke), but our own shapes. So there's no font file to host, and they stay sharp at
// any size.

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/** Whether the person asked for less motion (then digits change without flipping). */
export const useReducedMotion = () => {
  // The UI kit renders it on the server too, where there's no window.
  const [reduced, setReduced] = React.useState(() => typeof window !== "undefined" && window.matchMedia(REDUCED_MOTION).matches);
  React.useEffect(
    () => {
      const query = window.matchMedia(REDUCED_MOTION);
      const changed = () => setReduced(query.matches);
      query.addEventListener("change", changed);
      return () => query.removeEventListener("change", changed);
    },
    [],
  );
  return reduced;
};

/** One flip takes this long; a run of flips shares about RUN_MS, but no flip is quicker than FASTEST_MS. */
const FLIP_MS = 420;
export const RUN_MS = 900;
const FASTEST_MS = 90;

const flipMs = (steps: number) => (steps === 1 ? FLIP_MS : Math.max(FASTEST_MS, Math.round(RUN_MS / steps)));

/** A flip under way: from one digit to the next, how long it takes, and a key that restarts its animation. */
type Flip = { from: number; to: number; ms: number; key: number };

/**
 * Each digit's centre line, on a 36 × 64 grid, stroked 8 wide (odometer.css): stems and bars 3.5 in from the edges,
 * bowls of radius 14.5, the middle at 32.
 */
const GLYPHS = [
  "M3.5 18A14.5 14.5 0 0 1 32.5 18V46A14.5 14.5 0 0 1 3.5 46Z",
  "M9 13.5L21.5 3.5V60.5",
  "M3.5 18A14.5 14.5 0 1 1 29.9 26.3L3.5 57V60.5H33",
  "M3.5 3.5H31L17.5 29.5A14.5 14.5 0 1 1 4.2 51.5",
  "M25 60.5V3.5L3.5 45H33",
  "M31 3.5H7L6 28.5C9 26.5 13 25.5 18 25.5C27 25.5 32.5 32 32.5 43C32.5 53.5 27 60.5 18 60.5C11.5 60.5 6.5 57.5 3.5 52",
  "M26.5 3.5L6.1 37.7M3.5 46A14.5 14.5 0 1 0 32.5 46A14.5 14.5 0 1 0 3.5 46Z",
  "M3 3.5H32.5L13 60.5",
  "M5 16.5A13 13 0 1 0 31 16.5A13 13 0 1 0 5 16.5ZM2.5 45A15.5 15.5 0 1 0 33.5 45A15.5 15.5 0 1 0 2.5 45Z",
  "M9.5 60.5L29.9 26.3M32.5 18A14.5 14.5 0 1 0 3.5 18A14.5 14.5 0 1 0 32.5 18Z",
];

/** A digit as SVG, in the text colour. The view box leaves room for the stroke past the grid's edges. */
const Glyph = ({ digit }: { digit: number }) => (
  <svg className="ticket-glyph" viewBox="-0.5 -0.5 37 65" aria-hidden="true">
    <path d={GLYPHS[digit]} />
  </svg>
);

const Half = ({ half, digit, flipping }: { half: "top" | "bottom"; digit: number; flipping?: boolean }) => (
  <span className={`flap flap-${half}${flipping ? " is-flipping" : ""}`}>
    <span><Glyph digit={digit} /></span>
  </span>
);

/**
 * One split-flap digit. It starts at 0 and goes to each new digit: "roll" flips forward one digit at a time, through
 * the ones in between, like a counter (the Party'o'meter); "jump" makes one flip straight to the new digit, like a
 * flip clock counting down (the party countdown), so 8 to 7 is one flip, not nine. With reduced motion it just shows
 * the digit. Each flip ends on a timer rather than an animation event, so the digit is right even where nothing is
 * drawn (a hidden tab).
 */
export const FlapDigit = ({ digit, mode = "roll" }: { digit: number; mode?: "roll" | "jump" }) => {
  const reduced = useReducedMotion();
  const [shown, setShown] = React.useState(0);
  const [flip, setFlip] = React.useState<Flip | null>(null);
  const flips = React.useRef(0);
  // A run's pace, set when it starts (from how many flips it takes) and kept to its end, so a run doesn't slow down.
  const run = React.useRef({ to: digit, ms: FLIP_MS });

  React.useEffect(
    () => {
      if (shown === digit || reduced) {
        setFlip(null);
        setShown(digit);
        return;
      }
      if (run.current.to !== digit || !flip) {
        run.current = { to: digit, ms: mode === "jump" ? FLIP_MS : flipMs((digit - shown + 10) % 10) };
      }
      const to = mode === "jump" ? digit : (shown + 1) % 10;
      const { ms } = run.current;
      setFlip({ from: shown, to, ms, key: flips.current++ });
      const timer = setTimeout(() => setShown(to), ms);
      return () => clearTimeout(timer);
    },
    [digit, shown, reduced, mode],
  );

  return (
    <span className="flap-digit" aria-hidden="true">
      {/* Behind: the next digit's top, and the current digit's bottom until the falling flap covers it. */}
      <Half half="top" digit={flip ? flip.to : shown} />
      <Half half="bottom" digit={flip ? flip.from : shown} />
      {flip && (
        // The flap: the current digit's top folds down, and the next digit's bottom lands in its place.
        <span key={flip.key} className="flap-motion" style={{ "--flip-ms": `${flip.ms}ms` } as React.CSSProperties}>
          <Half half="top" digit={flip.from} flipping />
          <Half half="bottom" digit={flip.to} flipping />
        </span>
      )}
    </span>
  );
};
