# Layout audit: today's screens at the limits

Step 1.4 of `docs/tailwind-migration-plan.md`: every screen checked at 320, 375 and 1280px with normal data and with
the longest values the API allows (100-character names, a party name with no spaces, a 128-character email, 100
participants). Found with `npm run shots` on `main` at a1c36c7 (label `before`); the full list is in
`.shots/before/overflow.md` after a run.

Each problem is fixed by the PR that rebuilds its screen, as the plan says. Phase 4.1 (the Button) fixed five of the
six normal-data problems below: buttons now wrap instead of overflowing, and the widest element was often a button. Widths are how far
the content reaches past the screen's edge.

## Problems with normal data (happening today)

| Screen | Width | What happens | Fixed in |
|---|---|---|---|
| Party created ("Congratz!" with the secret code) | 320px (59px), 375px (4px) | The 8-letter code, in large letters spaced far apart, is cut off at the right. 5-letter codes fitted; 8-letter ones are new | 4.3 (dialogs) |
| Closed party (the draw is done) | 320px (51px) | The page is wider than the screen: text is cut at the right, and the gnome's speech bubble with its "Yes, please!" button runs off the edge | **Fixed in 4.1:** the bubble's button wraps now |
| Open party, guest view, and the leave dialog over it | 320px (12px) | The text column is a little wider than the screen | **Fixed in 4.1** (the "I changed my mind…" button was the widest thing) |
| Sign-in page ("Enter with your email address" button) | 320px (29px) | The button is wider than the screen | **Fixed in 4.1** |
| Expired sign-in link | 320px (9px) | Heading, text and the "send me a new link" button are a little too wide | **Fixed in 4.1** (the button wraps) |
| Failed account links (delete account, change email) | 320px (11px) | Heading, text and the "take me home" button are a little too wide | **Fixed in 4.1** |

## Problems with the longest values

| Screen | Width | What happens | Fixed in |
|---|---|---|---|
| Party pages: host, guest, closed, deleted, and the close / delete / leave dialogs over them | 320px (973px), 375px (918px), 1280px (212px) | A party name without spaces never wraps, so the whole column grows to its width: the text is cut off and the gnome, the draw and delete buttons are pushed off screen. At desktop width it still overflows. The 100-name participant list makes the page very long but does wrap | 5c (and 4.3 for the dialogs) |
| Joining a party: signed out, signed in, and with a secret phrase | 320px (261px), 375px (206px); at 1280px the heading's text spills 728px out of its box | "Welcome to the &lt;party name&gt;" doesn't wrap, and takes the form with it | 5b |
| Email change confirmed | 320px (263px), 375px (208px); at 1280px the text spills 463px out of its box | "From now on, we know you as &lt;email&gt;": a 128-character address doesn't wrap | 5e |

The long-value problems all share one cause, and one rule from the plan fixes it: names, codes and emails in running
text get `overflow-wrap: anywhere`, and flex and grid children that hold them get `min-width: 0`.

## Checked and fine

Everything else at every width and with both data sets: the start page, the email sign-in form, an invalid sign-in
link, new party form, join by code, the profile (settings with a 128-character email, and a 25-party history with
long names), the knowledge pages, the 404 page, the loading spinner, party not found, the delete-account link, and
the email-change cancel link.
