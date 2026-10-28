import React from "react";

import { FlapDigit, RUN_MS, useReducedMotion } from "@/components/FlapDigit";

// The Party'o'meter's counter, without the API (odometer.css): a row of raffle tickets, cream with red digits and
// notched sides. Each ticket is split across the middle; to change, its top half folds down onto the next digit, like a
// split-flap card, and a jump flips through every digit in between. The app's PartyOMeter feeds it the live count; the
// UI kit (/ui-kit in dev) feeds it its own.
// The digits themselves are FlapDigit's.

/** The counter shows at least this many digits, with leading zeros. */
const MIN_DIGITS = 5;

/** A click's show: the tickets flip to random digits, then all to 0, then up to the count, each step once the last is done. */
type Show = "random" | "zeros" | null;

/** How long each step of the show waits: a run of flips takes about RUN_MS. */
const SHOW_STEP_MS = RUN_MS + 150;

/**
 * Whether `element` is in view right now: its middle inside the window and not covered by anything. "Not covered"
 * matters on the front door, whose closing section is pinned under the page and only uncovered as the page scrolls off
 * it, so being inside the window isn't enough.
 */
const inView = (element: HTMLElement) => {
  const box = element.getBoundingClientRect();
  const x = box.left + box.width / 2;
  const y = box.top + box.height / 2;
  if (x < 0 || y < 0 || x > window.innerWidth || y > window.innerHeight) {
    return false;
  }
  const top = document.elementFromPoint(x, y);
  return Boolean(top && element.contains(top));
};

/**
 * Whether `ref`'s element has been seen (`inView`). Stays true once it has. Checked on every scroll (any scroller) and
 * resize, and once at the start.
 */
const useSeen = (ref: React.RefObject<HTMLElement | null>) => {
  const [seen, setSeen] = React.useState(false);
  React.useEffect(
    () => {
      const element = ref.current;
      if (!element) {
        return;
      }
      const check = () => {
        if (inView(element)) {
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
 * Now and then, on its own, the counter plays the click's show: after a random wait between these (ms), so it's rare
 * and never on a beat. The UI kit passes a much shorter range to show it.
 */
export const NOW_AND_THEN_MS: [number, number] = [60_000, 180_000];

/** The show doesn't play on its own this soon (ms) after the counter's digits last changed (a real roll, or the flip-up). */
const QUIET_AFTER_ROLL_MS = 4000;

const randomBetween = ([least, most]: [number, number]) => least + Math.random() * (most - least);

/**
 * A counter showing `value` on at least MIN_DIGITS tickets. It shows zeros until it's first on screen, then flips up
 * to the count, so the flip-up is seen rather than spent off screen. Clicking it puts on a little show: random digits,
 * then zeros, then the count again. Now and then (`nowAndThenMs`) it plays the show on its own, but only while it's in
 * view in a visible tab, not right after its digits changed, and never over a show already playing. With reduced
 * motion there's no show at all, clicked or not (three jumps would only flash).
 */
export const Odometer = ({ value, nowAndThenMs = NOW_AND_THEN_MS }: { value: number; nowAndThenMs?: [number, number] }) => {
  const reduced = useReducedMotion();
  const ref = React.useRef<HTMLButtonElement>(null);
  const seen = useSeen(ref);
  const digits = String(value).padStart(MIN_DIGITS, "0");
  const [show, setShow] = React.useState<{ step: Show; random: number[] }>({ step: null, random: [] });

  // When the digits last changed on their own: the count rolled, or the first flip-up once seen.
  const changedAt = React.useRef(0);
  React.useEffect(
    () => {
      changedAt.current = Date.now();
    },
    [value, seen],
  );

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

  // The latest of what the timer below decides on, without restarting its wait each render.
  const latest = React.useRef({ start, reduced, seen });
  latest.current = { start, reduced, seen };

  // Now and then: wait a random while; then play if all's well, or wait again. A show (clicked or not) ends the wait,
  // and its end starts a new one, so the next comes a full wait after it.
  const idle = show.step === null;
  const [least, most] = nowAndThenMs;
  React.useEffect(
    () => {
      if (!idle) {
        return;
      }
      let timer: ReturnType<typeof setTimeout>;
      const wait = () => {
        timer = setTimeout(play, randomBetween([least, most]));
      };
      const play = () => {
        const { start, reduced, seen } = latest.current;
        const ready = !reduced && seen && document.visibilityState === "visible"
          && Date.now() - changedAt.current > QUIET_AFTER_ROLL_MS && ref.current && inView(ref.current);
        if (ready) {
          start();
        } else {
          wait();
        }
      };
      wait();
      return () => clearTimeout(timer);
    },
    [idle, least, most],
  );

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
export const PartyOMeterView = ({ rolled, nowAndThenMs }: { rolled: number | null; nowAndThenMs?: [number, number] }) => {
  if (rolled === null) {
    return null;
  }
  return (
    <div className="party-o-meter">
      <p className="landing-eyebrow">Party'o'meter</p>
      <Odometer value={rolled} nowAndThenMs={nowAndThenMs} />
      <p className="party-o-meter-caption">{rolled === 1 ? "party has" : "parties have"} rolled the dice so far</p>
    </div>
  );
};
