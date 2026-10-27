import React from "react";

import { PartyOMeterView } from "@/components/Odometer";
import { Button } from "@/components/ui/button";

// The kit's Party'o'meter: the app's odometer with counts set here instead of the API's. Each sample rolls up from
// 000000 when the page loads, as the front door's does when its first count arrives.

const STATES: { label: string; rolled: number | null; note: string }[] = [
  { label: "No count yet", rolled: null, note: "null: nothing shows until the first count arrives" },
  { label: "Small", rolled: 13, note: "13, with leading zeros" },
  { label: "Six digits", rolled: 654321, note: "the minimum width, all wheels used" },
  { label: "Longer", rolled: 123456789, note: "past six digits, the odometer grows" },
];

/** Every state side by side, on the front door's closing section. */
export const OdometerStates = () => (
  <div className="grid gap-6 tablet:grid-cols-2">
    {STATES.map(({ label, rolled, note }) => (
      <figure key={label} className="kit-meter rounded-card p-6 text-center">
        <figcaption className="mb-2 text-sm text-zinc-400">{label} · {note}</figcaption>
        {rolled === null
          ? <p className="py-10 text-zinc-500">(renders nothing)</p>
          : <PartyOMeterView rolled={rolled} />}
      </figure>
    ))}
  </div>
);

const START = 29;

/** One odometer and buttons that change its count, to watch the wheels roll (still with reduced motion). */
export const OdometerDemo = () => {
  const [rolled, setRolled] = React.useState(START);
  const add = (n: number) => () => setRolled(current => current + n);

  return (
    <div className="kit-meter rounded-card p-6 text-center">
      <PartyOMeterView rolled={rolled} />
      <div className="mt-6 flex flex-wrap justify-center gap-2">
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
