import React from "react";

// The party page's countdown to the party's due time (party-details.css): days, then hours, minutes and seconds,
// "D:HH:MM:SS". It ticks every second while the tab is visible. Once the time is up it shows 0:00:00:00 and nothing
// else happens.

const SECOND = 1000;

/** Time left as "D:HH:MM:SS": days unpadded, the rest two digits; never below 0:00:00:00. */
export const formatCountdown = (msLeft: number) => {
  const total = Math.max(0, Math.floor(msLeft / SECOND));
  const pad = (n: number) => String(n).padStart(2, "0");
  const days = Math.floor(total / 86_400);
  const hours = Math.floor(total / 3_600) % 24;
  const minutes = Math.floor(total / 60) % 60;
  const seconds = total % 60;
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

/** "Due in D:HH:MM:SS" for a party with a due time (ISO 8601), with the date itself under it. */
export const PartyCountdown = ({ dueAt }: { dueAt: string }) => {
  const due = new Date(dueAt).getTime();
  const now = useClock(due);
  if (Number.isNaN(due)) {
    return null;
  }
  const date = dueDate.format(due);
  return (
    <div className="party-countdown">
      <span className="party-countdown-label">Due in</span>
      {/* The ticking digits aren't announced each second: the label says when it's due. */}
      <span className="party-countdown-time" role="timer" aria-label={`Due ${date}`}>{formatCountdown(due - now)}</span>
      <span className="party-countdown-date">{date}</span>
    </div>
  );
};
