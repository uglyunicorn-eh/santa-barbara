// Shared by the app's Footer and the static AstroFooter: on phones the footer line keeps only these links, and the
// rest go under a ☰ menu.

export const COMPACT_KEYS = ["how-it-works", "buy-me-coffee"];

/** The "more links" control (a ☰ icon), sized and coloured like the footer's links. Cuprum's letters sit low in
 * their line, so the icon is nudged down 2px to line up with them. */
export const moreTriggerClass =
  "inline-flex translate-y-0.5 cursor-pointer items-center self-center bg-transparent p-0 [font:inherit] text-inherit [text-shadow:inherit] hover:text-white focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none";
