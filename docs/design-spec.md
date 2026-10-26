# Design spec: controls and type

Status: **settled** (2026-10-25; revised the same day: primary colour, see Decision 1; lighter fills, red focus on red buttons, light toasts on paper) · Phase 2 step 3 of `docs/tailwind-migration-plan.md`

This spec covers what the migration restyles: colours, type, spacing, corners, shadows, buttons, form fields,
dialogs and toasts. **Page layouts stay as they are** (the plan's "same layout, exacting controls"). The artwork, the
photo backgrounds, the Cuprum font and the copy stay too.

The six decisions it needed are made; each section notes what else was considered. The values go into
`src/styles/tailwind.css` in Phase 3 step 5.

## What we start from

Measured from today's SCSS and the "before" screenshots (`npm run shots`):

- **No system to speak of:** 24 different font sizes, 7 corner radii, 10 box shadows and about 40 colours, a dozen
  of them near-identical greys (`#7a7a7a`, `#8a8a8a`, `#9a9a9a`, `#a0a0a0`, `#aaa`, `#b4b3b4`, `#b5b5b5`, …).
- **Two primary colours:** dialogs and party pages use Bulma's default turquoise (`#00d1b2`, never chosen on purpose),
  while the sign-in screens use a red (`#eb4f5e`). Links and tabs are Bulma's blue.
- **Contrast failures** (WCAG AA asks 4.5:1 for text under 24px):

  | Where | Colours | Contrast |
  |---|---|---|
  | Main buttons in dialogs and party pages ("Rock'n'Roll!", "Let's roll the dice!", "Yes, please!") | white on `#00d1b2` | **1.95:1** |
  | Sign-in buttons ("Enter with your email address", "Send me a magic link!") | white on `#eb4f5e` | **3.6:1** |
  | Error toasts | white on `#f14668` | **3.6:1** |
  | Success toasts | white on `#548ccb` | **3.5:1** |

  Everything below passes AA.

- **Three kinds of surface** the controls sit on:
  - *Night*: dark photo backgrounds (start page, sign-in, join, the backdrop behind most dialogs). `#111217` / `#141414`.
  - *Paper*: white cards (every dialog, the profile, the join box) and the light party page.
  - *Glass*: dark translucent panels on photos (the sign-in form card).

## 1. Colour

### Two main-action colours: brand red on hero screens, turquoise on content screens

The main action on a screen gets a filled button. Which colour depends on the screen:

- **Hero screens** (sign-in, join, the sign-in link page, account links, party not found, 404): **brand red**. It's
  the site's own red: the browser theme colour `#b3202c`, the neon "HOHOHO", and these screens already used red.
- **Content screens** (party pages, dialogs, the profile, knowledge pages): **turquoise**, the colour these screens
  have always had (Bulma's `#00d1b2`), a touch lighter (`#33dac1`, the old tone with 20% white) and with a dark teal
  label instead of white (7.8:1 instead of 1.95:1).

Red everywhere was tried first. On content screens it put "Let's roll the dice!" (go) beside "Delete this party"
(danger) in the same colour; with turquoise there, red on a content screen means danger only. (Considered: evergreen
`#1d6b45`; a darker turquoise `#007a68` with white text, which keeps the white label but loses the old minty tone.)

Turquoise, the old tone at 500 and the primary fill a step lighter:

| Token | Value | Use | Contrast |
|---|---|---|---|
| `teal-50` | `#eefcfa` | light tints | `teal-900` text on it 7.4:1 |
| `teal-300` | `#93ecde` | soft accents, illustrations | |
| `teal-400` | `#33dac1` | **primary** fill | `teal-900` label on it 7.8:1 |
| `teal-500` | `#00d1b2` | primary hover; Bulma's old primary | `teal-900` label on it 7.0:1 |
| `teal-700` | `#007a68` | links, focus rings, teal text on paper | 5.3:1 on white |
| `teal-900` | `#04342c` | the label on primary buttons | |

The turquoise fill itself is light against white (1.95:1) and the cream bubble (1.77:1); the dark label is what marks
the button, which is enough for a labelled control. Focus rings use `teal-700`, never the 400 or 500.

Red, for brand and danger:

| Token | Value | White text on it | Use |
|---|---|---|---|
| `red-50` | `#fdf3f3` | | danger zone background |
| `red-100` | `#fbe3e3` | | |
| `red-200` | `#f6c6c7` | | destructive text on night (12.3:1) |
| `red-500` | `#dc3a40` | 4.4:1 (too low for text) | icons, illustrations only |
| `red-600` | `#c62a30` | 5.6:1 | **brand** fill (hero main actions) |
| `red-700` | `#a8222a` | 7.2:1 | brand hover; the final destructive confirm fill; destructive text on paper (7.2:1 on white) |
| `red-800` | `#8a1f25` | 9.1:1 | destructive confirm hover |

### Destructive actions: never filled until the last step

Delete actions stay quiet so they never compete with the main action. Delete buttons are `ghost` or
`secondary` with `red-700` text and an icon (today's "💥 Delete this party" already has one). Only the final button in
a confirm dialog ("Delete my account", "Delete this party" in its confirm) is filled, in `red-700`, darker than the
brand red. (Considered: a dark neutral fill with red text, which reads as "important" rather than
"dangerous".)

### Links: teal-700, underlined

Links take the content screens' accent, `teal-700` (5.3:1 on white), underlined. On night, links are `zinc-100`,
underlined. Red stays for brand and danger. (Considered: `red-700` links, when red was the only primary; keeping
a blue, `#3b5bdb`, as a third colour.)

### Neutrals

One neutral scale replaces the dozen greys. Zinc fits the cool night backgrounds (`#111217` is a blue-tinted black):

| Token | Value | Use |
|---|---|---|
| `zinc-50` | `#fafafa` | subtle fills on paper (history row hover, disabled inputs) |
| `zinc-100` | `#f4f4f5` | links on night (17:1) |
| `zinc-200` | `#e4e4e7` | borders, dividers on paper |
| `zinc-300` | `#d4d4d8` | input borders; secondary text on night (12.7:1) |
| `zinc-400` | `#a1a1aa` | muted text on night (7.3:1); too light for text on paper (2.6:1) |
| `zinc-500` | `#71717a` | muted text on paper (4.8:1): help text, metadata, placeholders |
| `zinc-600` | `#52525b` | secondary text on paper (7.7:1) |
| `zinc-700` | `#3f3f46` | labels, ghost button text on paper (10.4:1) |
| `zinc-900` | `#18181b` | body text on paper; toast fill on night |
| `night` | `#111217` | the page background behind photos (kept) |

### Festive accents and success (kept)

The speech bubbles and highlights keep their warmth, as named tokens instead of loose values:

| Token | Value | Today |
|---|---|---|
| `cream` | `#f7f7c6` | the gnome's speech bubble |
| `cream-50` | `#fff6d6` | the host star badge in history |
| `gold` | `#c99700` | the star icon |
| `green-700` / `green-50` | `#257942` on `#effaf3` (5.1:1) | "Dice rolled" and other positive states |
| `green-200` | `#acdcbf` | the success icon in toasts on night |

### Semantic tokens

Components use these roles, not the colours directly:

| Role | On paper | On night / glass |
|---|---|---|
| `primary` / `primary-foreground` | `teal-400` / `teal-900` | `teal-400` / `teal-900` |
| `primary-hover` | `teal-500` | `teal-500` |
| `brand` / `brand-foreground` | `red-600` / white | `red-600` / white |
| `brand-hover` | `red-700` | `red-700` |
| `destructive` (text, borders) | `red-700` | `red-200` |
| `destructive-strong` (final confirm fill) | `red-700` / white text, hover `red-800` | same |
| `text` / `text-muted` | `zinc-900` / `zinc-500` | white / `zinc-400` |
| `border` / `input-border` | `zinc-200` / `zinc-300` | white at 20% / white at 30% |
| `ring` (focus) | `teal-700`; red buttons use their own red | white |
| `link` | `teal-700` | `zinc-100` |
| `success` | `green-700` on `green-50` | `green-200` |

Button contrast is between the label and the fill, so the same fills work on every surface.

## 2. Type

Cuprum stays, in weights 400, 500 and 600 (the single 700 today becomes 600). Cuprum is a narrow face, so it reads
smaller than its size; today's body text is mostly `1.2rem` (19px) for that reason.

**Body text is 18px**, close to today's reading size. Seven steps cover everything (considered: a 16px body, which
would make text visibly smaller than today on every screen):

| Token | Size / line height | Use (today's sizes it replaces) |
|---|---|---|
| `text-xs` | 13 / 18 | footer credits, photo credits (0.8rem, 0.8em) |
| `text-sm` | 15 / 22 | help text, labels, metadata, small buttons (0.85–0.95rem, 0.9em) |
| `text-base` | 18 / 28 | body text, inputs, buttons (1rem–1.2rem, 1.1em, 1.2em) |
| `text-lg` | 20 / 28 | lead paragraphs, large buttons (1.25rem, 1.3rem) |
| `text-xl` | 24 / 32 | dialog titles (1.5rem, 1.5em) |
| `text-2xl` | 30 / 36 | page headings (1.75rem, 1.8rem, 2rem) |
| `text-3xl` | 40 / 44 | the start page's welcome, the party code (32px, 40px, 3rem) |

Weights: 400 body, 500 buttons and labels, 600 headings and dialog titles. Text on photos keeps one shadow token
(`0 1px 2px rgb(0 0 0 / 0.35)`) instead of today's several.

Long values (from `docs/layout-audit.md`): names, party names, codes and emails in running text use
`overflow-wrap: anywhere`; one-line slots (history rows, dialog titles) use `truncate` with the full value in
`title`. The party code in "Congratz!" uses less letter spacing and `text-2xl` below 375px so 8 letters fit.

## 3. Spacing, corners, shadows

- **Spacing:** Tailwind's 4px scale only. In practice: 4, 8, 12, 16, 24, 32, 48. No arbitrary values outside
  artwork CSS.
- **Corners: 8px on controls** (buttons, inputs, toasts), **16px on cards** (dialogs, panels, speech bubbles). The
  main action on hero screens is a pill (see Buttons). (Considered: pills everywhere with 24px cards, which make tabs,
  inline fields and small buttons awkward; and 6px / 12px, plainer than today's 20px dialogs.)
- **Shadows:** three levels replace ten:
  - `shadow-sm` `0 1px 3px rgb(0 0 0 / 0.2)`: controls on photos
  - `shadow-md` `0 8px 20px rgb(0 0 0 / 0.25)`: speech bubbles, glass panels, toasts
  - `shadow-lg` `0 16px 40px rgb(0 0 0 / 0.45)`: dialogs

## 4. Controls in general

- **Sizes:** `sm` 32px, `md` 40px (default), `lg` 48px tall; horizontal padding 12 / 16 / 20px; text `text-sm` /
  `text-base` / `text-lg`. On touch screens every control has at least a 40px tap target (small ones extend it with
  padding).
- **Focus:** a 2px ring in `ring` with a 2px offset in the surface colour, on keyboard focus only (`:focus-visible`).
  On paper, red buttons (`brand`, `destructive`, ghost deletes) ring in their own red instead of teal.
- **Disabled:** 50% opacity and no pointer; never the only signal (e.g. Save also stays labelled).
- **Loading:** a spinner replaces the icon (or appears before the label); the label and width stay, so nothing jumps;
  `aria-busy` on the button.
- **Motion:** 150ms colour and shadow transitions. Dialog open animations respect `prefers-reduced-motion`.

## 5. Buttons

| Variant | On paper | On night / glass | Today's buttons that become it |
|---|---|---|---|
| `brand` | `red-600` fill, white text, hover `red-700` | same, with `shadow-sm` | hero main actions: "Enter with your email address", "Send me a magic link!", "Sign in to join the party!", "Join the party!", "Send me that magic again" |
| `primary` | `teal-400` fill, `teal-900` text, hover `teal-500` | same | content main actions: "Rock'n'Roll!", "Let's roll the dice!", "Yes, please!", "Can't wait any longer!", "Restore the party", Save, Submit |
| `secondary` | white fill, `zinc-300` border, `zinc-900` text, hover `zinc-50` | transparent, white 40% border, white text, hover white 10% | "Nah, never mind", "Not ready yet…", "Okie Dokie!", "Show more parties", "Take me home…", the white outlined links on 404 / party not found |
| `ghost` | no fill, `zinc-700` text, hover `zinc-100` | white text, hover white 10% | "Change", "Cancel"; "💥 Delete this party" and "Delete account" with `destructive` text |
| `destructive` | `red-700` fill, white text, hover `red-800` | same | only the final confirm: "Delete my account", the delete-party confirm |
| `link` | `teal-700`, underline, inline at the sentence's size | `zinc-100`, underline | inline "Check out", text links in copy |

- Sizes: `md` by default; `sm` in the profile settings rows; `lg` for each hero screen's main action.
- `pill` (fully rounded) only on hero screens: the main action (`brand` `lg`) and going home or back
  (`secondary` `md`). Nothing on a content screen is a pill.
- `fullWidth` on phones for the main action in dialogs and the sign-in card.
- Emoji stay where the copy has them; they sit in the icon slot so labels line up.

## 6. Form fields

- **Label placement stays per form:** beside the input from tablet width up in the NewParty and JoinParty dialogs
  (label column 150px, right-aligned, stacked below tablet); above the input everywhere else.
- **Input:** 40px tall (48px on hero forms), white fill, 1px `input-border`, `text-base`, 8px radius, placeholder
  `zinc-500` (4.8:1). Focus: border `teal-700` plus the focus ring. Disabled while submitting: `zinc-50` fill.
- **Label:** `text-sm`, weight 500, `zinc-700` on paper, `zinc-300` on glass.
- **Help text:** `text-sm`, `text-muted`, directly under the input, 4px gap.
- **Error:** `text-sm`, `destructive`, under the input (replacing help text while shown); the input border turns
  `destructive`; `aria-invalid` and `aria-describedby` link them.
- **Inline field** (profile name and email): input and button side by side, same height (`sm`, 32px), 8px gap; the
  error below both.
- **Glass forms** (sign-in card): the same white input, so it stays readable on the photo; labels and help in
  `zinc-300`.
- Fields at their limit (`maxLength`) just stop typing; no counter.

## 7. Dialogs

- **Widths stay:** `sm` 600px (NewParty, JoinParty, ConfirmPartyDelete), `md` 700px (ConfirmPartyClose,
  ConfirmPartyLeave), `lg` 800px (MyProfile). On phones: full width minus 16px each side.
- **Card:** white, 16px radius, `shadow-lg`, padding 24px (16px on phones). The artwork (bunting, Santa,
  illustrations) stays where it is today.
- **Header:** title in `text-xl` / 600, aligned as today; the close control is a 40px ghost icon button in the
  page's top-right corner, as today.
- **Body:** `text-base`, 16px between paragraphs.
- **Footer:** the dismiss action (`secondary`) then the main action (`primary`, or `destructive` on a delete
  confirm), right-aligned with 8px between them; on phones they wrap, main action first and full width.
- **Backdrop:** `night` at 70%.
- **Tabs** (profile dialog): text tabs with a 2px underline in `teal-700` for the current one; `text-muted` for the
  others; full width as today.

## 8. Toasts

All API errors and confirmations appear here, so they must be readable on every surface and fit the longest message.

**Toasts follow the surface, with a coloured icon:**

- **On night** (dark pages): `zinc-900` fill, white text (17.7:1), a `red-200` icon for errors and a `green-200`
  icon for success, a hairline white-at-15% border so it holds its edge on the photo.
- **On paper** (the light party page): white fill, `zinc-900` text, a `border` hairline, a `red-700` icon for errors
  and a `green-700` icon for success.

Calm next to the festive artwork either way. (Considered: dark everywhere, which looked heavy on the light page;
coloured fills fixed for contrast, errors on `red-700` and success on green.)

Top centre, `max-width: min(560px, 100% - 32px)` so a 128-character email wraps instead of overflowing, 8px radius,
`text-base`, `shadow-md`, errors 5 s and success 10 s as today. Styled through the `Toaster` options in
`NotificationsContainer`.

## Decisions

| # | Decision | Chosen | Considered |
|---|---|---|---|
| 1 | Main-action colour | Brand red `#c62a30` on hero screens; the old turquoise, a touch lighter (`#33dac1`), with a `#04342c` label on content screens | Red everywhere (tried first) · evergreen `#1d6b45` · darker turquoise `#007a68` with white text |
| 2 | Destructive actions | Never filled until the final confirm (`#a8222a`, with a red focus ring) | Dark neutral fill, red text |
| 3 | Link colour | `teal-700` `#007a68`, underlined | `red-700` · blue `#3b5bdb` |
| 4 | Base text size | 18px | 16px |
| 5 | Corners | 8px controls, 16px cards | Pills and 24px · 6px and 12px |
| 6 | Toasts | Dark on night, light on paper, with a coloured icon | Dark everywhere · coloured fill |

Next: the UI kit page (Phase 2 step 4) shows every control in every state on night, paper and glass for a last look
before Phase 4.
