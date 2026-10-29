// Shared by the app's Footer and the static AstroFooter: on phones the footer line keeps only these links, and the
// rest go under a ☰ menu: "Home | How this works? | ☰" (the home screen swaps Home for My Profile).

export const COMPACT_KEYS = ["home", "how-it-works"];

/**
 * The ☰ menu, top to bottom, a rule between groups: GitHub; the site's pages and Buy me a coffee; then the account (My
 * Profile when it isn't in the line, and Sign out). Every footer link is in one of them.
 */
const MENU_GROUPS = [
  ["github"],
  ["home", "how-it-works", "terms", "privacy", "status", "buy-me-coffee"],
  ["profile", "sign-out"],
];

/** The links for the ☰ menu, in its order and groups (empty groups left out). */
export const menuGroups = <T extends { key: string }>(items: T[]): T[][] =>
  MENU_GROUPS
    .map(keys => keys.flatMap(key => items.filter(item => item.key === key)))
    .filter(group => group.length > 0);

/** The "more links" control (a ☰ icon), sized and coloured like the footer's links. Cuprum's letters sit low in
 * their line, so the icon is nudged down 2px to line up with them. */
export const moreTriggerClass =
  "inline-flex translate-y-0.5 cursor-pointer items-center self-center bg-transparent p-0 [font:inherit] text-inherit [text-shadow:inherit] hover:text-white focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none";
