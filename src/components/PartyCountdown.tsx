import React from "react";

import { FlapDigit } from "@/components/FlapDigit";

// The party page's countdown to the party's due time (due-clock.css): light and simple, the Party'o'meter's flip
// cards in four groups (days, hours, minutes, seconds) with a label under each. A digit flips when it changes, straight to its new value. It ticks every second while the tab is visible;
// once the time is up it shows 0:00:00:00 and nothing else happens.

const SECOND = 1000;

/** The time left in whole days, hours, minutes and seconds; never below zero. */
export const timeLeft = (msLeft: number) => {
  const total = Math.max(0, Math.floor(msLeft / SECOND));
  return {
    days: Math.floor(total / 86_400),
    hours: Math.floor(total / 3_600) % 24,
    minutes: Math.floor(total / 60) % 60,
    seconds: total % 60,
  };
};

/** Time left as "D:HH:MM:SS": days unpadded, the rest two digits; never below 0:00:00:00. */
export const formatCountdown = (msLeft: number) => {
  const { days, hours, minutes, seconds } = timeLeft(msLeft);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${days}:${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

/**
 * The time now, updated on each new second until `until` (ms) has passed, and only while the tab is visible (a hidden
 * tab catches up as soon as it's shown again).
 */
const useClock = (until: number) => {
  const [now, setNow] = React.useState(() => Date.now());

  React.useEffect(
    () => {
      let timer: ReturnType<typeof setTimeout> | undefined;
      const tick = () => {
        const time = Date.now();
        setNow(time);
        if (time < until && document.visibilityState === "visible") {
          // On the next second boundary, so the seconds change together with the clock.
          timer = setTimeout(tick, SECOND - (time % SECOND) + 5);
        }
      };
      const shown = () => {
        clearTimeout(timer);
        if (document.visibilityState === "visible") {
          tick();
        }
      };
      tick();
      document.addEventListener("visibilitychange", shown);
      return () => {
        clearTimeout(timer);
        document.removeEventListener("visibilitychange", shown);
      };
    },
    [until],
  );

  return now;
};

const dueDate = new Intl.DateTimeFormat(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });

/** One group of flip cards with its label under it: the days unpadded, the rest two digits. */
const Group = ({ value, pad, unit }: { value: number; pad: number; unit: string }) => {
  const digits = String(value).padStart(pad, "0");
  return (
    <span className="due-clock-group">
      <span className="due-clock-digits">
        {/* Keyed from the right, so a new leading digit (10 days) doesn't restart the others. */}
        {[...digits].map((digit, i) => <FlapDigit key={digits.length - i} digit={Number(digit)} mode="jump" />)}
      </span>
      <span className="due-clock-unit">{unit}</span>
    </span>
  );
};

/** The countdown for a party with a due time (ISO 8601). */
export const PartyCountdown = ({ dueAt }: { dueAt: string }) => {
  const due = new Date(dueAt).getTime();
  const now = useClock(due);
  if (Number.isNaN(due)) {
    return null;
  }
  const { days, hours, minutes, seconds } = timeLeft(due - now);
  const date = dueDate.format(due);
  return (
    // Screen readers get the date, not digits changing every second; the text form shows on hover.
    <div className="due-clock" role="timer" aria-label={`Gifts due ${date}`} title={formatCountdown(due - now)}>
      <span className="due-clock-title">Gifts due in</span>
      <span className="due-clock-row" aria-hidden="true">
        <Group value={days} pad={1} unit={days === 1 ? "day" : "days"} />
        <span className="due-clock-colon">:</span>
        <Group value={hours} pad={2} unit="hours" />
        <span className="due-clock-colon">:</span>
        <Group value={minutes} pad={2} unit="min" />
        <span className="due-clock-colon">:</span>
        <Group value={seconds} pad={2} unit="sec" />
      </span>
      <span className="due-clock-date">{date}</span>
    </div>
  );
};
