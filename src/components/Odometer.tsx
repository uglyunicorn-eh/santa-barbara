import React from "react";

// The Party'o'meter's counter, without the API (odometer.css): a row of raffle tickets, cream with red digits and
// notched sides. Each ticket is split across the middle; to change, its top half folds down onto the next digit, like a
// split-flap card, and a jump flips through every digit in between. The app's PartyOMeter feeds it the live count; the
// UI kit (/ui-kit in dev) feeds it its own.
//
// The digits are drawn here as SVG strokes, not set in a font: condensed and geometric, in the spirit of DIN (straight
// stems, round bowls, one even stroke), but our own shapes. So there's no font file to host, and they stay sharp at
// any size.

/** The counter shows at least this many digits, with leading zeros. */
const MIN_DIGITS = 5;

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/** Whether the person asked for less motion (then digits change without flipping). */
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

/** One flip takes this long; a run of flips shares about RUN_MS, but no flip is quicker than FASTEST_MS. */
const FLIP_MS = 420;
const RUN_MS = 900;
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
 * One split-flap digit: it starts at 0 and flips forward, one digit at a time, to each new digit; with reduced motion
 * it just shows it. Each step ends on a timer rather than an animation event, so the digit is right even where nothing
 * is drawn (a hidden tab).
 */
const FlapDigit = ({ digit }: { digit: number }) => {
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
        run.current = { to: digit, ms: flipMs((digit - shown + 10) % 10) };
      }
      const to = (shown + 1) % 10;
      const { ms } = run.current;
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

/** A click's show: the tickets flip to random digits, then all to 0, then up to the count, each step once the last is done. */
type Show = "random" | "zeros" | null;

/** How long each step of the show waits: a run of flips takes about RUN_MS. */
const SHOW_STEP_MS = RUN_MS + 150;

/**
 * Whether `ref`'s element has been seen: its middle on screen and not covered by anything. Stays true once it has.
 * "Not covered" matters on the front door, whose closing section is pinned under the page and only uncovered as the
 * page scrolls off it, so being inside the window isn't enough. Checked on every scroll (any scroller) and resize,
 * and once at the start.
 */
const useSeen = (ref: React.RefObject<HTMLElement | null>) => {
  const [seen, setSeen] = React.useState(false);
  React.useEffect(
    () => {
      const element = ref.current;
      if (!element) {
        return;
      }
      const uncovered = () => {
        const box = element.getBoundingClientRect();
        const x = box.left + box.width / 2;
        const y = box.top + box.height / 2;
        if (x < 0 || y < 0 || x > window.innerWidth || y > window.innerHeight) {
          return false;
        }
        const top = document.elementFromPoint(x, y);
        return Boolean(top && element.contains(top));
      };
      const check = () => {
        if (uncovered()) {
          setSeen(true);
          stop();
        }
      };
      const stop = () => {
        document.removeEventListener("scroll", check, true);
        window.removeEventListener("resize", check);
        clearTimeout(first);
      };
      document.addEventListener("scroll", check, { capture: true, passive: true });
      window.addEventListener("resize", check, { passive: true });
      // After the page's first layout (and the garage door's opening), for a counter already in view.
      const first = setTimeout(check, 300);
      return stop;
    },
    [ref],
  );
  return seen;
};

/**
 * A counter showing `value` on at least MIN_DIGITS tickets. It shows zeros until it's first on screen, then flips up
 * to the count, so the flip-up is seen rather than spent off screen. Clicking it puts on a little show: random digits,
 * then zeros, then the count again. With reduced motion a click does nothing (three jumps would only flash).
 */
export const Odometer = ({ value }: { value: number }) => {
  const reduced = useReducedMotion();
  const ref = React.useRef<HTMLButtonElement>(null);
  const seen = useSeen(ref);
  const digits = String(value).padStart(MIN_DIGITS, "0");
  const [show, setShow] = React.useState<{ step: Show; random: number[] }>({ step: null, random: [] });

  React.useEffect(
    () => {
      if (!show.step) {
        return;
      }
      const next = show.step === "random" ? "zeros" : null;
      const timer = setTimeout(() => setShow(current => ({ ...current, step: next })), SHOW_STEP_MS);
      return () => clearTimeout(timer);
    },
    [show.step],
  );

  const start = () => {
    if (!reduced) {
      setShow({ step: "random", random: [...digits].map(() => Math.floor(Math.random() * 10)) });
    }
  };

  // What each ticket shows now: zeros until first seen, then the show's step, or the count.
  const shown = [...digits].map((digit, i) =>
    !seen ? 0 : show.step === "random" ? show.random[i] ?? 0 : show.step === "zeros" ? 0 : Number(digit));

  return (
    <button ref={ref} type="button" className="odometer" aria-label={String(value)} title="Flip again" onClick={start}>
      {/* Keyed from the right, so a new leading digit doesn't restart the others. */}
      {shown.map((digit, i) => <FlapDigit key={digits.length - i} digit={digit} />)}
    </button>
  );
};

/** The Party'o'meter for a count: nothing until it's known (null), then the counter and its caption. */
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
