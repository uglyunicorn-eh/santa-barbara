# Design spec: controls and type (proposal)

Status: **proposal**, needs decisions · Phase 2 step 3 of `docs/tailwind-migration-plan.md` · 2026-10-25

This spec covers what the migration restyles: colours, type, spacing, corners, shadows, buttons, form fields,
dialogs and toasts. **Page layouts stay as they are** (the plan's "same layout, exacting controls"). The artwork, the
photo backgrounds, the Cuprum font and the copy stay too.

Decisions are marked **▶ Decision N**. Each lists the options, recommendation first. The summary is at the end.

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

  Every option below passes AA for button and toast text.

- **Three kinds of surface** the controls sit on, which the spec has to work on:
  - *Night*: dark photo backgrounds (start page, sign-in, join, the backdrop behind most dialogs). `#111217` / `#141414`.
  - *Paper*: white cards (every dialog, the profile, the join box) and the light party page.
  - *Glass*: dark translucent panels on photos (the sign-in form card).

## 1. Colour

### ▶ Decision 1: the primary colour

The primary colour fills the one main action on each screen and marks focus and selection.

| Option | Primary (button fill, white text) | Why | Watch out |
|---|---|---|---|
| **A. Holiday red (recommended)** | `red-600` `#c62a30` (5.6:1) | The site's own red: the browser theme colour `#b3202c`, the logo's neon "HOHOHO", the sign-in screens already use red. One primary everywhere | Red also means "danger": destructive actions must look different (Decision 2) |
| B. Evergreen | `green-700` `#1d6b45` (6.5:1) | Christmas red + green: green for actions, red kept for brand accents and danger. No clash with destructive | Sign-in screens change from red to green; less "this site's" colour |
| C. Teal, darkened | `teal-700` `#0f7a6c` (5.2:1) | Closest to today's dialogs, just made readable | Keeps the accidental Bulma colour; sign-in screens still need changing |

Scales, with the contrast of white text on the fill where it matters (600 and up pass 4.5:1, except teal-600):

| Step | A. red | B. green | C. teal |
|---|---|---|---|
| 50 | `#fdf3f3` | `#eef8f2` | `#ebf9f6` |
| 100 | `#fbe3e3` | `#d5efdf` | `#cdf1ea` |
| 200 | `#f6c6c7` | `#acdcbf` | `#9ce2d4` |
| 500 | `#dc3a40` (4.4:1) | `#2e9663` (3.7:1) | `#14a691` (3.1:1) |
| 600 | `#c62a30` (5.6:1) | `#22804f` (4.9:1) | `#0d8f7d` (4.0:1, large text only) |
| 700 | `#a8222a` (7.2:1) | `#1d6b45` (6.5:1) | `#0f7a6c` (5.2:1) |
| 800 | `#8a1f25` | `#195638` | `#105f55` |

### ▶ Decision 2: destructive actions (only matters with option A)

With a red primary, "Delete this party" can't look like "Let's roll the dice!".

- **A. Destructive is never filled until the last step (recommended).** Delete buttons are `ghost` or `secondary` with
  red text and an icon (today's "💥 Delete this party" already has one). Only the final button in a confirm dialog
  ("Delete my account") is filled, in `red-800` `#8a1f25`, so it reads darker than the primary.
- B. Destructive uses a dark neutral fill (`zinc-900`) with red text. Clearly different, but a dark button on paper
  reads as "important" rather than "dangerous".

### Neutrals

One neutral scale replaces the dozen greys. Zinc fits the cool night backgrounds (`#111217` is a blue-tinted black):

| Token | Value | Use |
|---|---|---|
| `zinc-50` | `#fafafa` | subtle fills on paper (danger zone, history row hover) |
| `zinc-100` | `#f4f4f5` | |
| `zinc-200` | `#e4e4e7` | borders, dividers on paper |
| `zinc-300` | `#d4d4d8` | input borders; secondary text on night (12.7:1) |
| `zinc-400` | `#a1a1aa` | muted text on night (7.3:1); too light for text on paper (2.6:1) |
| `zinc-500` | `#71717a` | muted text on paper (4.8:1): help text, metadata, placeholders |
| `zinc-600` | `#52525b` | secondary text on paper (7.7:1) |
| `zinc-900` | `#18181b` | body text on paper |
| `night` | `#111217` | the page background behind photos (kept) |

### Festive accents (kept)

The speech bubbles and highlights keep their warmth, as named tokens instead of loose values:

| Token | Value | Today |
|---|---|---|
| `cream` | `#f7f7c6` | the gnome's speech bubble |
| `cream-50` | `#fff6d6` | the host star badge in history |
| `gold` | `#c99700` | the star icon |
| `success` | `#257942` on `#effaf3` | "Dice rolled" and similar positive states |

### ▶ Decision 3: link colour

- **A. Primary-700, underlined (recommended).** One accent colour; underline tells links apart from text. On night,
  links are `zinc-100`, underlined.
- B. Keep a blue (`#3b5bdb`, 5.7:1 on white). Familiar "link" signal, but a third colour next to red and the cream
  accents.

### Semantic tokens

Components use roles, not colours, so Decisions 1–3 only change the table below:

| Role | On paper | On night / glass |
|---|---|---|
| `primary` / `primary-foreground` | `primary-600` / white | `primary-600` / white |
| `primary-hover` | `primary-700` | `primary-600` |
| `destructive` (text, borders) | `red-700` | `red-200` |
| `destructive-strong` (final confirm fill) | `red-800` | `red-800` |
| `text` / `text-muted` | `zinc-900` / `zinc-500` | white / `zinc-400` |
| `border` / `input-border` | `zinc-200` / `zinc-300` | white at 20% / white at 30% |
| `ring` (focus) | `primary-600` | white |
| `link` | per Decision 3 | `zinc-100` |

Button contrast is between the label and the fill, so the same `primary-600` works on every surface.

## 2. Type

Cuprum stays, in weights 400, 500 and 600 (the single 700 today becomes 600). Cuprum is a narrow face, so it reads
smaller than its size; today's body text is mostly `1.2rem` (19px) for that reason.

### ▶ Decision 4: base size

- **A. 18px body (recommended).** Close to today's 19px reading size; seven steps cover everything:

  | Token | Size / line height | Use (today's sizes it replaces) |
  |---|---|---|
  | `text-xs` | 13 / 18 | footer credits, photo credits (0.8rem, 0.8em) |
  | `text-sm` | 15 / 22 | help text, labels, metadata, small buttons (0.85–0.95rem, 0.9em) |
  | `text-base` | 18 / 28 | body text, inputs, buttons (1rem–1.2rem, 1.1em, 1.2em) |
  | `text-lg` | 20 / 28 | lead paragraphs, large buttons (1.25rem, 1.3rem) |
  | `text-xl` | 24 / 32 | dialog titles (1.5rem, 1.5em) |
  | `text-2xl` | 30 / 36 | page headings (1.75rem, 1.8rem, 2rem) |
  | `text-3xl` | 40 / 44 | the start page's welcome, the party code (32px, 40px, 3rem) |

- B. 16px body: a standard web size, but body text gets visibly smaller than today across every screen.

Weights: 400 body, 500 buttons and labels, 600 headings and dialog titles. Text on photos keeps one shadow token
(`0 1px 2px rgb(0 0 0 / 0.35)`) instead of today's several.

Long values (from `docs/layout-audit.md`): names, party names, codes and emails in running text use
`overflow-wrap: anywhere`; one-line slots (history rows, dialog titles) use `truncate` with the full value in
`title`. The party code in "Congratz!" uses less letter spacing and `text-2xl` below 375px so 8 letters fit.

## 3. Spacing, corners, shadows

- **Spacing:** Tailwind's 4px scale only. In practice: 4, 8, 12, 16, 24, 32, 48. No arbitrary values outside
  artwork CSS.
- **Shadows:** three levels replace ten:
  - `shadow-sm` `0 1px 3px rgb(0 0 0 / 0.2)`: controls on photos
  - `shadow-md` `0 8px 20px rgb(0 0 0 / 0.25)`: speech bubbles, glass panels
  - `shadow-lg` `0 16px 40px rgb(0 0 0 / 0.45)`: dialogs

### ▶ Decision 5: corners

| Option | Controls (buttons, inputs) | Cards (dialogs, panels) | Feel |
|---|---|---|---|
| **A. Soft (recommended)** | 8px | 16px | Friendly and tidy; the main hero action may be a pill |
| B. Playful | pill for every button and input | 24px | Matches the hero buttons today, but tabs, inline fields and small buttons get awkward |
| C. Crisp | 6px | 12px | Closest to Bulma's 4px controls, a bit plainer than today's 20px dialogs |

## 4. Controls in general

- **Sizes:** `sm` 32px, `md` 40px (default), `lg` 48px tall; horizontal padding 12 / 16 / 20px; text `text-sm` /
  `text-base` / `text-lg`. On touch screens every control has at least a 40px tap target (small ones extend it with
  padding).
- **Focus:** a 2px ring in `ring` with a 2px offset in the surface colour, on keyboard focus only (`:focus-visible`).
- **Disabled:** 50% opacity and no pointer; never the only signal (e.g. Save also stays labelled).
- **Loading:** a spinner replaces the icon (or appears before the label); the label and width stay, so nothing jumps;
  `aria-busy` on the button.
- **Motion:** 150ms colour and shadow transitions. Dialog open animations respect `prefers-reduced-motion`.

## 5. Buttons

| Variant | On paper | On night / glass | Today's buttons that become it |
|---|---|---|---|
| `primary` | `primary` fill, white text, hover `primary-hover` | same | "Rock'n'Roll!", "Let's roll the dice!", "Yes, please!", "Send me a magic link!", "Can't wait any longer!", Save, Submit |
| `secondary` | white fill, `zinc-300` border, `zinc-900` text, hover `zinc-50` | transparent, white 40% border, white text, hover white 10% | "Nah, never mind", "Not ready yet…", "Okie Dokie!", "Show more parties", "Take me home…", the white outlined links on 404 / party not found |
| `ghost` | no fill, `zinc-700` text, hover `zinc-100` | white text, hover white 10% | "Change", "Cancel"; "💥 Delete this party" with destructive text |
| `destructive` | per Decision 2 | per Decision 2 | "Delete account", "Delete my account", the delete confirm |
| `link` | `link` colour, underline, no padding | white, underline | inline "Check out", text links in copy |

- Sizes: `md` by default; `sm` in the profile settings rows; `lg` for each hero screen's main action.
- `pill` (fully rounded) only for the main action on hero screens: sign-in, "send me a magic link", join.
- `fullWidth` on phones for the main action in dialogs and the sign-in card.
- Emoji stay where the copy has them; they sit in the icon slot so labels line up.

## 6. Form fields

- **Label placement stays per form:** beside the input from tablet width up in the NewParty and JoinParty dialogs
  (label column 150px, right-aligned, stacked below tablet); above the input everywhere else.
- **Input:** 40px tall (48px on hero forms), white fill, 1px `input-border`, `text-base`, control radius,
  placeholder `zinc-500` (4.8:1). Focus: border `primary-600` plus the focus ring. Disabled while submitting: `zinc-50` fill.
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
- **Card:** white, card radius (Decision 5), `shadow-lg`, padding 24px (16px on phones). The artwork (bunting,
  Santa, illustrations) stays where it is today.
- **Header:** title in `text-xl` / 600, aligned as today; the close control is a 40px ghost icon button in the
  page's top-right corner, as today.
- **Body:** `text-base`, 16px between paragraphs.
- **Footer:** the dismiss action (`secondary`) then the main action (`primary`, or destructive per Decision 2),
  right-aligned with 8px between them; on phones they wrap, main action first and full width.
- **Backdrop:** `night` at 70%.
- **Tabs** (profile dialog): text tabs with a 2px underline in `primary` for the current one; `text-muted` for the
  others; full width as today.

## 8. Toasts

All API errors and confirmations appear here, so they must be readable on every surface and fit the longest message.

### ▶ Decision 6: toast style

- **A. Dark toast, coloured icon (recommended).** `zinc-900` fill, white text (17:1), a red or green icon. Readable on
  photos and on paper alike, and calm next to the festive artwork.
- B. Coloured fill, fixed for contrast: errors on `red-700` (7.2:1), success on `green-700` (6.5:1). Closest to
  today's look.

Either way: top centre, `max-width: min(560px, 100% - 32px)` so a 128-character email wraps instead of overflowing,
control radius, `text-base`, `shadow-md`, errors 5 s and success 10 s as today. Styled through the `Toaster`
options in `NotificationsContainer`.

## Decisions summary

| # | Decision | Recommended | Alternatives |
|---|---|---|---|
| 1 | Primary colour | A. Holiday red `#c62a30` | B. Evergreen `#1d6b45` · C. Teal `#0f7a6c` |
| 2 | Destructive actions (with red) | A. Never filled until the final confirm (`#8a1f25`) | B. Dark neutral fill, red text |
| 3 | Link colour | A. Primary-700, underlined | B. Blue `#3b5bdb` |
| 4 | Base text size | A. 18px | B. 16px |
| 5 | Corners | A. 8px controls, 16px cards | B. Pills, 24px · C. 6px, 12px |
| 6 | Toasts | A. Dark with coloured icon | B. Coloured fill, red-700 / green-700 |

Once decided, the values go into `src/styles/tailwind.css` (Phase 3 step 5), and the UI kit page (Phase 2 step 4)
shows every control in every state on night, paper and glass for a last look before Phase 4.
