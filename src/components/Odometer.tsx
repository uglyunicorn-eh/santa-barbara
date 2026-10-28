import React from "react";

// The Party'o'meter's counter, without the API (odometer.css), in one of a few looks:
// - "neon": glowing digits in the site's font, like the neon signs on the front door's photo; digits slide.
// - "brass": a brass tally counter with cream wheels; digits roll.
// - "ticket": cream raffle tickets with red digits; each flips like a split-flap card.
// A jump goes through every digit in between. The app's PartyOMeter feeds it the live count; the UI kit (/ui-kit in
// dev) feeds it its own, and shows the looks side by side.

export type OdometerLook = "neon" | "brass" | "ticket";

/** The look the front door uses. */
export const DEFAULT_LOOK: OdometerLook = "neon";

/** The counter shows at least this many digits, with leading zeros. */
const MIN_DIGITS = 6;

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/** Whether the person asked for less motion (then digits change without moving). */
const useReducedMotion = () => {
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

// Sliding wheels (neon, brass) ------------------------------------------------------------------------------------

/** Twice round, so a wheel always rolls forward: 9 to 0 goes on to the second 0, then quietly back to the first. */
const STRIP = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

/** One digit wheel: it starts at 0 and slides forward to each new digit through the ones in between. */
const Wheel = ({ digit }: { digit: number }) => {
  // Where the strip stands (0–19), and whether it's sliding there or jumping without a transition.
  const [wheel, setWheel] = React.useState({ at: 0, rolling: false });

  React.useEffect(
    () => {
      // A moment after the browser has drawn where the wheel stands now, so it slides rather than jumps. A timer, not
      // an animation frame: frames pause where nothing is drawn, and the wheel must still end on the right digit there.
      const timer = setTimeout(() => setWheel(wheel => {
        const { at } = wheel;
        const steps = (digit - (at % 10) + 10) % 10;
        if (!steps) {
          return wheel;
        }
        // Still on the second round (mid-roll, or never settled): onward from there if it fits.
        return { at: (at + steps < STRIP.length ? at : at % 10) + steps, rolling: true };
      }), 50);
      return () => clearTimeout(timer);
    },
    [digit],
  );

  // Past 9, back to the same digit on the strip's first round, ready for the next roll.
  const settle = () => setWheel(({ at }) => ({ at: at % 10, rolling: false }));

  return (
    <span className="odometer-wheel" aria-hidden="true">
      <span className="odometer-window">
        <span
          className={wheel.rolling ? "odometer-strip is-rolling" : "odometer-strip"}
          style={{ "--at": wheel.at } as React.CSSProperties}
          onTransitionEnd={settle}
        >
          {STRIP.map((n, i) => <span key={i}>{n}</span>)}
        </span>
      </span>
    </span>
  );
};

// Flipping cards (ticket) -----------------------------------------------------------------------------------------

/** One flip takes this long; a run of flips shares about RUN_MS, but no flip is quicker than FASTEST_MS. */
const FLIP_MS = 420;
const RUN_MS = 900;
const FASTEST_MS = 90;

const flipMs = (steps: number) => (steps === 1 ? FLIP_MS : Math.max(FASTEST_MS, Math.round(RUN_MS / steps)));

/** A flip under way: from one digit to the next, how long it takes, and a key that restarts its animation. */
type Flip = { from: number; to: number; ms: number; key: number };

const Half = ({ half, digit, flipping }: { half: "top" | "bottom"; digit: number; flipping?: boolean }) => (
  <span className={`flap flap-${half}${flipping ? " is-flipping" : ""}`}>
    <span>{digit}</span>
  </span>
);

/**
 * One split-flap digit: it starts at 0 and flips forward, one digit at a time, to each new digit; with reduced motion
 * it just shows it. Each step ends on a timer rather than an animation event, so the digit is right even where nothing
 * is drawn (a hidden tab).
 */
const FlapDigit = ({ digit }: { digit: number }) => {
  const reduced = useReducedMotion();
  const [shown, setShown] = React.useState(0);
  const [flip, setFlip] = React.useState<Flip | null>(null);
  const flips = React.useRef(0);

  React.useEffect(
    () => {
      if (shown === digit || reduced) {
        setFlip(null);
        setShown(digit);
        return;
      }
      const to = (shown + 1) % 10;
      const ms = flipMs((digit - shown + 10) % 10);
      setFlip({ from: shown, to, ms, key: flips.current++ });
      const timer = setTimeout(() => setShown(to), ms);
      return () => clearTimeout(timer);
    },
    [digit, shown, reduced],
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

// ------------------------------------------------------------------------------------------------------------------

/** A counter showing `value` on at least MIN_DIGITS digits, in `look`. */
export const Odometer = ({ value, look = DEFAULT_LOOK }: { value: number; look?: OdometerLook }) => {
  const digits = String(value).padStart(MIN_DIGITS, "0");
  const Digit = look === "ticket" ? FlapDigit : Wheel;
  return (
    <span className={`odometer is-${look}`} role="img" aria-label={String(value)}>
      {/* Keyed from the right, so a new leading digit doesn't restart the others. */}
      {[...digits].map((digit, i) => <Digit key={digits.length - i} digit={Number(digit)} />)}
    </span>
  );
};

/** The Party'o'meter for a count: nothing until it's known (null), then the counter and its caption. */
export const PartyOMeterView = ({ rolled, look }: { rolled: number | null; look?: OdometerLook }) => {
  if (rolled === null) {
    return null;
  }
  return (
    <div className="party-o-meter">
      <p className="landing-eyebrow">Party'o'meter</p>
      <Odometer value={rolled} look={look} />
      <p className="party-o-meter-caption">{rolled === 1 ? "party has" : "parties have"} rolled the dice so far</p>
    </div>
  );
};
