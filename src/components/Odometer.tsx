import React from "react";

// The Party'o'meter's odometer, without the API: digit wheels that roll to each new count (odometer.css). The app's
// PartyOMeter feeds it the live count; the UI kit (/ui-kit in dev) feeds it its own.

/** The odometer shows at least this many digits, with leading zeros. */
const MIN_DIGITS = 6;

/** Twice round, so a wheel always rolls forward: 9 to 0 goes on to the second 0, then quietly back to the first. */
const STRIP = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

/**
 * One digit wheel. It starts at 0 and rolls forward to each new digit through the ones in between (odometer.css);
 * with reduced motion it just shows the digit.
 */
const Wheel = ({ digit }: { digit: number }) => {
  // Where the strip stands (0–19), and whether it's rolling there or jumping without a transition.
  const [wheel, setWheel] = React.useState({ at: 0, rolling: false });

  React.useEffect(
    () => {
      // A moment after the browser has drawn where the wheel stands now, so it rolls rather than jumps. A timer, not an
      // animation frame: frames pause where nothing is drawn, and the wheel must still end on the right digit there.
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
      <span
        className={wheel.rolling ? "odometer-strip is-rolling" : "odometer-strip"}
        style={{ "--at": wheel.at } as React.CSSProperties}
        onTransitionEnd={settle}
      >
        {STRIP.map((n, i) => <span key={i}>{n}</span>)}
      </span>
    </span>
  );
};

/** An odometer showing `value` on at least MIN_DIGITS wheels. */
export const Odometer = ({ value }: { value: number }) => {
  const digits = String(value).padStart(MIN_DIGITS, "0");
  return (
    <span className="odometer" role="img" aria-label={String(value)}>
      {/* Keyed from the right, so a new leading digit doesn't restart the others. */}
      {[...digits].map((digit, i) => <Wheel key={digits.length - i} digit={Number(digit)} />)}
    </span>
  );
};

/** The Party'o'meter for a count: nothing until it's known (null), then the odometer and its caption. */
export const PartyOMeterView = ({ rolled }: { rolled: number | null }) => {
  if (rolled === null) {
    return null;
  }
  return (
    <div className="party-o-meter">
      <p className="landing-eyebrow">Party'o'meter</p>
      <Odometer value={rolled} />
      <p className="party-o-meter-caption">{rolled === 1 ? "party has" : "parties have"} rolled the dice so far</p>
    </div>
  );
};
