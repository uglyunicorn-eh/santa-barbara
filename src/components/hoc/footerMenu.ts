// Shared by the app's Footer and the static AstroFooter: on phones the footer line keeps only these links, and the
// rest go under a ☰ menu.

export const COMPACT_KEYS = ["how-it-works", "buy-me-coffee"];

/** The "more links" control (a ☰ icon), sized and coloured like the footer's links. */
export const moreTriggerClass =
  "inline-flex cursor-pointer items-center self-center bg-transparent p-0 [font:inherit] text-inherit [text-shadow:inherit] hover:underline focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none";

/** The menu card: white on any background. */
export const morePopupClass =
  "min-w-48 rounded-lg border border-border bg-white py-1 text-left font-sans text-base shadow-lg outline-none";

/** A link in the menu (overrides the footer's white, shadowed link styles). */
export const moreItemClass =
  "flex flex-row items-center justify-start gap-2 px-4 py-2 text-zinc-900 no-underline [text-shadow:none] outline-none select-none hover:bg-zinc-100 hover:text-zinc-900 hover:no-underline focus-visible:bg-zinc-100 data-highlighted:bg-zinc-100 data-highlighted:text-zinc-900";
