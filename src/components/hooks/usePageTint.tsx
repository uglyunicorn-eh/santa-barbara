import React from "react";

// The page's edge colour: what Safari on iPhone extends into the strips under the clock and behind its toolbar when
// the page is at its top or bottom (and what shows when the page bounces). Each screen sets the colour at the edges
// of its photo, so those strips blend in instead of looking like black bars. Also set as the theme colour, which
// older Safari and Android use for their bars.

/** Screens currently asking, newest last: the newest wins, and leaving gives the colour back to the one before. */
const stack: string[] = [];

const apply = () => {
  const color = stack[stack.length - 1];
  document.documentElement.style.backgroundColor = color ?? "";
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (meta) {
    meta.dataset.initial ??= meta.content;
    meta.content = color ?? meta.dataset.initial;
  }
};

/** Sets the page's edge colour while the calling screen is on screen. */
export const usePageTint = (color: string) => {
  React.useEffect(
    () => {
      stack.push(color);
      apply();
      return () => {
        stack.splice(stack.lastIndexOf(color), 1);
        apply();
      };
    },
    [color],
  );
};

/** The edge colours of each screen's photo (sampled from its top and bottom rows). */
export const TINTS = {
  /** The home screen's night sky with stars (welcome.jpg). */
  night: "#121520",
  /** The sign-in garage door (login-garage-door.webp). */
  loginDoor: "#090304",
  /** A party's garage door, to join it (party-garage-door-3.jpg). */
  partyDoor: "#161616",
  /** The sign-in link page (enter-background.jpg). */
  enter: "#8d95a3",
  /** The party page's light photo (party-background.jpg). */
  party: "#e2e6e7",
};
