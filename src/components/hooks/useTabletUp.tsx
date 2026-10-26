import React from "react";

/** Tailwind's `tablet:` breakpoint (src/styles/tailwind.css). */
const TABLET_UP = "(min-width: 769px)";

const subscribe = (listener: () => void) => {
  const query = window.matchMedia(TABLET_UP);
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
};

/** Whether the screen is tablet width or wider, updated as it changes (false while rendering on the server). */
export const useTabletUp = () =>
  React.useSyncExternalStore(subscribe, () => window.matchMedia(TABLET_UP).matches, () => false);
