import React from "react";

import { DEFAULT_LOOK, PartyOMeterView, type OdometerLook } from "@/components/Odometer";
import { Button } from "@/components/ui/button";

// The kit's Party'o'meter: the app's counter with counts set here instead of the API's, on the front door's closing
// section. Each sample counts up from 000000 when the page loads, as the front door's does when its first count
// arrives.

const STATES: { label: string; rolled: number | null; note: string }[] = [
  { label: "No count yet", rolled: null, note: "null: nothing shows until the first count arrives" },
  { label: "Small", rolled: 13, note: "13, with leading zeros" },
  { label: "Six digits", rolled: 654321, note: "the minimum width, all digits used" },
  { label: "Longer", rolled: 123456789, note: "past six digits, the counter grows" },
];

const LOOKS: { look: OdometerLook; name: string; note: string }[] = [
  { look: "neon", name: "Neon sign", note: "Glowing tubes like the signs on the front door's photo; digits slide and flicker." },
  { look: "brass", name: "Brass tally counter", note: "Cream wheels in a brass frame, the last one red; digits roll." },
  { look: "ticket", name: "Raffle tickets", note: "Cream tickets with notched sides and red digits; each flips like a split-flap card." },
];

const panel = "kit-meter rounded-card px-3 py-6 text-center tablet:px-6";

/** Every state, in the front door's look. */
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

/**
 * The looks side by side, on one count, and buttons that change it: to compare them and watch each move (or just
 * change, with reduced motion).
 */
export const OdometerDemo = () => {
  const [rolled, setRolled] = React.useState(START);
  const add = (n: number) => () => setRolled(current => current + n);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 desktop:grid-cols-3">
        {LOOKS.map(({ look, name, note }) => (
          <figure key={look} className={panel}>
            <figcaption className="mb-2">
              <span className="block font-semibold text-white">{name}{look === DEFAULT_LOOK ? " · on the front door now" : ""}</span>
              <span className="kit-meter-note text-sm">{note}</span>
            </figcaption>
            <PartyOMeterView rolled={rolled} look={look} />
          </figure>
        ))}
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
