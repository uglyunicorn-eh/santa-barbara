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
  { label: "Longer", rolled: 123456789, note: "past six digits, the row grows" },
];

/**
 * The typefaces left to choose between. Cuprum is the site's own; DIN Condensed is this Mac's, for a preview, and would
 * be hosted as the free font named in `hosted` (the site loads fonts from itself only). `shift` sits each one's
 * digits a hair above the ticket's middle (measured: DIN leaves more room below its digits than above).
 */
const FONTS: { name: string; font: string; weight?: number; scale?: number; shift: string; feel: string; hosted: string }[] = [
  { name: "Cuprum", font: "inherit", shift: "-0.01em", feel: "The site's own font", hosted: "already hosted" },
  { name: "DIN Condensed", font: "'DIN Condensed', sans-serif", scale: 1.15, shift: "0.106em", feel: "A cinema ticket stub", hosted: "Oswald or Barlow Condensed" },
];

const panel = "kit-meter rounded-card px-3 py-6 text-center tablet:px-6";

/** Every state, in the site's font. */
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

/** The two typefaces side by side, on one count, and buttons that change it, to compare them and watch the flips. */
export const OdometerDemo = () => {
  const [rolled, setRolled] = React.useState(START);
  const add = (n: number) => () => setRolled(current => current + n);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-center gap-2">
        <Button variant="secondary" surface="dark" onClick={add(1)}>+1</Button>
        <Button variant="secondary" surface="dark" onClick={add(7)}>+7</Button>
        <Button variant="secondary" surface="dark" onClick={add(1234)}>+1,234</Button>
        <Button variant="secondary" surface="dark" onClick={add(1_000_000)}>+1,000,000</Button>
        <Button variant="ghost" surface="dark" onClick={() => setRolled(13)}>Back to 13</Button>
        <Button variant="ghost" surface="dark" onClick={() => setRolled(START)}>Reset</Button>
      </div>
      <div className="grid gap-4 tablet:grid-cols-2">
        {FONTS.map(({ name, font, weight, scale, shift, feel, hosted }) => (
          <figure
            key={name}
            className={panel}
            style={{ "--ticket-font": font, "--ticket-weight": weight, "--ticket-scale": scale, "--ticket-shift": shift } as React.CSSProperties}
          >
            <figcaption className="mb-3">
              <span className="block font-semibold text-white">{name}</span>
              <span className="kit-meter-note block text-sm">{feel}</span>
              <span className="kit-meter-note block text-xs">Hosted: {hosted}</span>
            </figcaption>
            <PartyOMeterView rolled={rolled} />
          </figure>
        ))}
      </div>
    </div>
  );
};
