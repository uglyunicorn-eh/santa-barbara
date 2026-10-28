import React from "react";

import { PartyOMeterView } from "@/components/Odometer";
import { Button } from "@/components/ui/button";

// The kit's Party'o'meter: the app's raffle-ticket counter with counts set here instead of the API's, on the front
// door's closing section. Each sample flips up from 000000 when the page loads, as the front door's does when its
// first count arrives.

const STATES: { label: string; rolled: number | null; note: string }[] = [
  { label: "No count yet", rolled: null, note: "null: nothing shows until the first count arrives" },
  { label: "Small", rolled: 13, note: "13, with leading zeros" },
  { label: "Six digits", rolled: 654321, note: "the minimum width, all tickets used" },
  { label: "Every digit", rolled: 1234567890, note: "past six digits, the row grows" },
];

const panel = "kit-meter rounded-card px-3 py-6 text-center tablet:px-6";

/** Every state. */
export const OdometerStates = () => (
  <div className="grid gap-6 tablet:grid-cols-2">
    {STATES.map(({ label, rolled, note }) => (
      <figure key={label} className={panel}>
        <figcaption className="kit-meter-note mb-2 text-sm">{label} · {note}</figcaption>
        {rolled === null
          ? <p className="kit-meter-note py-10">(renders nothing)</p>
          : <PartyOMeterView rolled={rolled} />}
      </figure>
    ))}
  </div>
);

const START = 29;

/** One counter and buttons that change it, to watch the tickets flip (or just change, with reduced motion). */
export const OdometerDemo = () => {
  const [rolled, setRolled] = React.useState(START);
  const add = (n: number) => () => setRolled(current => current + n);

  return (
    <div className="space-y-4">
      <div className={panel}>
        <PartyOMeterView rolled={rolled} />
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Button variant="secondary" surface="dark" onClick={add(1)}>+1</Button>
        <Button variant="secondary" surface="dark" onClick={add(7)}>+7</Button>
        <Button variant="secondary" surface="dark" onClick={add(1234)}>+1,234</Button>
        <Button variant="secondary" surface="dark" onClick={add(1_000_000)}>+1,000,000</Button>
        <Button variant="ghost" surface="dark" onClick={() => setRolled(13)}>Back to 13</Button>
        <Button variant="ghost" surface="dark" onClick={() => setRolled(START)}>Reset</Button>
      </div>
    </div>
  );
};
