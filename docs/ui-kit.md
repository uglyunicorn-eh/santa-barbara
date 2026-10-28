# UI kit

The UI kit is a page that shows every control in every state, on the app's three surfaces. It's the reference for
how controls look; this file holds the rules behind it.

```bash
npm run dev
```

Then open <http://localhost:4321/ui-kit>. The page exists in `npm run dev` only (`src/dev/ui-kit.astro`, added by
the `uiKit` integration in `astro.config.mjs`); builds leave it out.

The components: buttons (`src/components/ui/button.tsx`), inputs (`src/components/ui/input.tsx`), form fields
(`src/components/forms/`), dialogs (`src/components/DialogBox.tsx`, on Base UI's Dialog), tabs (`src/components/Tab.tsx`),
menus (`src/components/ui/menu.ts`), the Party'o'meter (`src/components/Odometer.tsx`) and the page layout pieces (`src/components/layout.tsx`, styled in
`src/styles/layout.css`). The kit shows the real buttons, inputs and toaster; its dialog and tab samples are drawn to match.

## Surfaces

Every control is shown on each surface it can sit on:

- **Night:** dark photo backgrounds (the start page, sign-in, join, and behind dialogs).
- **Paper:** white cards (dialogs, the profile, the join box) and the light party page.
- **Glass:** dark translucent panels on photos (the sign-in card).

Page layouts, artwork, photo backgrounds, the Cuprum font and the copy are the app's own; the kit covers controls.

## Colour

The tokens and their values live in `src/styles/tailwind.css`. Tailwind's own palette is switched off, so only those
exist. Components use the roles, not the colours:

| Role | On paper | On night / glass |
|---|---|---|
| `primary` / its label | turquoise `#33dac1` / `#04342c`, hover `#00d1b2` | same |
| `brand` | red `#c62a30`, white text, hover `#a8222a` | same |
| `destructive` (text) | `#a8222a` | `#f6c6c7` |
| `destructive-strong` (the final confirm) | `#a8222a`, white text, hover `#8a1f25` | same |
| text / muted text | `zinc-900` / `zinc-500` | white / `zinc-400` |
| `border` / input border | `zinc-200` / `zinc-300` | white at 20% / 30% |
| `ring` (focus) | `#007a68`; red buttons ring in their own red | white |
| `link` | `#007a68`, underlined | `zinc-100`, underlined |
| `success` | `#257942` on `#effaf3` | `#acdcbf` |

- **Two main-action colours.** Hero screens (sign-in, join, the sign-in link page, account links, party not found,
  404) use the brand red. Content screens (party pages, dialogs, the profile, knowledge pages) use turquoise. Red on a
  content screen means danger only.
- **Festive accents** are named tokens too: `cream` `#f7f7c6` (speech bubbles), `cream-50`, `gold`.
- Every text colour passes WCAG AA (4.5:1). Button contrast is between the label and the fill, so the same fills work
  on every surface.

## Type, spacing, corners, shadows

- **Cuprum**, body text **18px**. Seven sizes: `text-xs` 13, `text-sm` 15, `text-base` 18, `text-lg` 20, `text-xl` 24,
  `text-2xl` 30, `text-3xl` 40. Weights: 400 body, 500 buttons and labels, 600 headings.
- **Long values:** names, party names, codes and emails in running text wrap anywhere (`wrap-anywhere`); one-line
  slots truncate with the full value in `title`. The kit's "Long values" section shows the longest the API allows.
- **Spacing:** Tailwind's 4px scale.
- **Corners:** 8px on controls (buttons, inputs, toasts), 16px on cards (dialogs, panels, speech bubbles).
- **Shadows:** `shadow-sm` for controls on photos, `shadow-md` for bubbles, glass panels and toasts, `shadow-lg` for
  dialogs.
- **Breakpoints:** `tablet` 769px, `desktop` 1024px, `widescreen` 1216px, `fullhd` 1408px. Use `tablet:` /
  `max-tablet:`, never `md:` or `lg:`. Plain CSS in `src/styles/` uses the same widths in `@media` queries.

## Controls in general

- **Sizes:** `sm` 32px, `md` 40px (default), `lg` 48px tall. Long labels wrap rather than overflow.
- **Focus:** keyboard only (`:focus-visible`), a 2px ring with a 2px gap in the surface colour. Teal on paper, white
  on dark; red buttons on paper ring in red. Inputs on dark cards use the same white outline.
- **Disabled:** 50% opacity. **Loading:** the label dims and a glowing beam runs around the button's edge (white on filled buttons, teal on white ones, otherwise the label's colour) (a still outline, with reduced motion); the button keeps its size and can't be pressed twice.
- **Motion:** 150ms colour transitions.

## Buttons

| Variant | For |
|---|---|
| `brand` | a hero screen's main action |
| `primary` | a content screen's main action |
| `secondary` | dismiss, cancel, go home, show more |
| `ghost` | quiet actions in rows: Change, Cancel |
| `ghost-destructive` | delete actions, until the final confirm |
| `destructive` | only the final confirm of a delete |
| `link` | links in a sentence, inline at its size |

- **Hero screens:** the main action is `brand` `lg` `pill`; going home or back is `secondary` `pill`.
- **Content screens:** the main action is `primary`, `md`, no pill.
- **Deletes stay quiet** until the final confirm, which is the only filled red button. The host's "Delete this party"
  lives in the ☰ menu beside the main button.
- **Emoji only on main actions** ("🎉 Rock'n'Roll!", "💥 Yes, delete it"); dismiss and quiet buttons have none. No
  text arrows on back buttons; the knowledge pages' "Jeez, get me out of here" has a ← icon.
- On phones, keep labels short where they'd wrap ("Get me home!" instead of "Take me home, country roads!").
- `buttonVariants()` gives a link the same look: `<a className={buttonVariants({ variant: "secondary" })}>`.

## Menus

Base UI menus (`@base-ui/react/menu`) with the classes in `src/components/ui/menu.ts`: a white card that opens above
its ☰ button, above everything else on the page. The footer uses one on phones for all but two of its links (on the
static pages, a native `<details>` with the same look); when "My Profile" is in it with its red dot (rolled
parties to reveal), the ☰ shows the dot too. The host's ☰ beside "Roll the dice" has Copy link, Invite by email…
and, after a divider, Delete this party in red; items have a 16px icon.

## Form fields

- **Labels:** beside the input from tablet width in the new-party and join dialogs, above it elsewhere.
- **Input:** 40px (48px on hero forms), white, 8px corners; focus border plus ring.
- **Help and errors:** `text-sm` under the input. An error takes the help text's place, in a slot as tall as the
  taller of the two (a field with no help keeps one blank line), so an error appearing or going away never resizes
  the form or its dialog.
- **Inline fields** (the profile's name and email): input and buttons on one line, all 40px; the error below. "Save"
  appears only once the name has changed.
- **On glass** (the sign-in card): labels and help in `zinc-300`, white focus, errors in light red.
- **Email tags** (`EmailTags`, the invite dialog): addresses become teal pills as you type Enter, a comma, a space or
  paste a list; one that doesn't look like an address stays, as a red pill, to fix or remove. Backspace in the empty
  field takes the last one back. At most 10.
- Fields at their limit just stop typing.

## Dialogs, tabs, toasts

- **Dialogs:** white card, 16px corners, `shadow-lg`, on a dark backdrop (or a picture: the rolled letter's envelopes).
  Widths 600 / 700 / 800px from tablet up. On phones a bottom sheet (Base UI Drawer): full width, rounded top, a grip,
  an X in its header, and a swipe down closes it. Focus moves in and Tab stays inside; Esc and a click on the backdrop
  close it, the page behind doesn't scroll. The footer has the dismiss action, then the main one, with room on the
  left for a ghost action ("Show more parties", "How this works?"); a dialog with one big action centres it
  (`footerAlign="center"`, the congratulations). On phones they stack, main action first and full width. The profile
  dialog keeps one height on both tabs (nearly the whole screen on phones), its tabs pinned to the top edge.
- **The Grinch's card** (sign-in) is a dialog too: the dark glass card over the front door, which stays put behind it.
- **Tabs** (the profile): text tabs, the current one underlined in teal; keyboard focus shows an inset ring.
- **Toasts** (Sonner, `NotificationsContainer`): top centre on phones; from tablet up, bottom right, 16px from the
  edges. The dismiss button shows on hover or keyboard focus; on touch, swipe a toast away. Titles in normal weight,
  the icon beside the first line. Errors are solid red (`red-600`), info blue (`blue-600`), success green
  (`green-700`), with white text, on every page; errors go after 2.5 s, other messages after 4 s. Reminders (`remind`)
  have an icon (the 🎲), a title, a description and an action ("Open"), stay until dismissed or opened, and follow the
  surface: dark on night, light on the party page.

## Party'o'meter

The front door's count of parties that rolled the dice (`src/components/Odometer.tsx`, styled in
`src/styles/odometer.css`): a row of raffle tickets, at least five, on the closing section's dark background. On the
front door it's a compact row by the footer (`landing.css`), mirroring the footer's credits: two lines of the footer's
small text ("Party'o'meter", then the caption) level with "Made with…" and "Photo by…", and the tickets beside them
exactly two lines tall. It sits in the footer (Footer's `aside`), between the links and the credits: there on
phones, centred, stacked (tickets over the two lines) below 360px; in the bottom-left corner from tablet up. Cream
(`cream-50`) with red (`red-600`) digits and small notches on both sides at the middle, leaning a little this way and
that. To change, a ticket's top half folds down onto the next digit, like a split-flap card (0.42 s); a jump flips
through every digit in between, sharing about 0.9 s. Clicking the counter (a button) puts on a little show: the tickets flip to random digits, then all to 0, then up to
the count, each step once the last run of flips is done (about a second each); with reduced motion a click does
nothing. A run of flips keeps one pace from start to end. With reduced motion the digits just change. Nothing shows until
the first count arrives. On phones it's smaller, so nine tickets still fit at 320px.

The digits aren't a font: they're SVG strokes drawn in `Odometer.tsx` (`GLYPHS`), condensed and geometric in the
spirit of DIN (straight stems, round bowls, one even stroke) but our own shapes, so there's no font file to host. They
take the text colour, are 0.92em tall (on a 1.3em ticket), and sit a hair (0.04em) above the ticket's middle, which reads as centred.

## Emails

The emails (santa-monica's `src/mail/templates/layout.ts`) follow the same rules: a white card on a light grey page,
Cuprum where the mail app can load it, teal underlined links, and the content buttons, turquoise to go ahead and red
to stop.

## Checking a change

`npm run shots` screenshots every screen at 320, 375 and 1280px, with normal data and the longest values the API
allows, and reports anything that overflows. `npm run shots:compare` diffs two runs. See `scripts/shots/README.md`.
