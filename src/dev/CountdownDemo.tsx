import React from "react";

import { PartyCountdown } from "@/components/PartyCountdown";

// The kit's party countdowns, each due a set while from when the page loads, on the party page's own background, above
// a party's name as on smaller screens (from desktop up the page puts it in its top-right corner).

const STATES: { label: string; aheadMs: number }[] = [
  { label: "Days left", aheadMs: ((3 * 24 + 4) * 60 + 5) * 60_000 + 6_000 },
  { label: "Under an hour", aheadMs: 42 * 60_000 + 17_000 },
  { label: "Time's up: it stays at 0:00:00:00", aheadMs: -60_000 },
  { label: "The longest: a year ahead", aheadMs: 366 * 24 * 60 * 60_000 - 1_000 },
];

export const CountdownDemo = () => {
  // Fixed at the first render, so each state counts down from there.
  const [loadedAt] = React.useState(() => Date.now());
  return (
    <div className="grid gap-4 tablet:grid-cols-2">
      {STATES.map(({ label, aheadMs }) => (
        <figure key={label} className="party-details overflow-hidden rounded-card p-4 shadow-lg">
          <figcaption className="text-sm text-zinc-700">{label}</figcaption>
          <div className="party-details-content kit-due mb-0!">
            <div className="party-due">
              <PartyCountdown dueAt={new Date(loadedAt + aheadMs).toISOString()} />
            </div>
            <h1 className="text-center">Office Secret Santa 2026</h1>
          </div>
        </figure>
      ))}
    </div>
  );
};
