/** The site's name, titles and descriptions: what search engines and link previews show. */

export const SITE_NAME = "Anonymous Ded Morozes";

/** The home page's title, before " | SITE_NAME": the words people search for. */
export const HOME_TITLE = "Free Secret Santa Generator";

/** The home page, in search results. */
export const HOME_DESCRIPTION =
  "Draw names for Secret Santa with friends, family or the office. Free, no ads, no passwords: sign in with a magic link, share a code, roll the dice.";

/** A party link shared in a chat: the preview is an invitation. */
export const INVITE_DESCRIPTION =
  "You're invited to a secret gift exchange. Join the party, wait for the dice roll, and find out who you're getting a gift for. No passwords, no spam.";

/** Under the title on the front door, followed by JEEZ. */
export const TAGLINE =
  "Free Secret Santa for friends, families and offices. No ads, no shady business, just pure fun. Free and open source!";

/** The tagline's last word, underlined like with a pen; hovered or tapped, it pops up JEEZ_POPUP. */
export const JEEZ = "Jeez!";
export const JEEZ_POPUP =
  "OMG! It's FREE! *burp* No GMO! No antibiotics! Zero calories! Gluten-free, sugar-free, f-f-feelings-free! " +
  "One hundred percent organic, free-range elves! *buuurp*";

/** "Title | Anonymous Ded Morozes", or the name alone. */
export const pageTitle = (title?: string) => [title, SITE_NAME].filter(Boolean).join(" | ");
