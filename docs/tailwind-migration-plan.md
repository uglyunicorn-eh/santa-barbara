# Front-end plan: npm, size limits, and Bulma → Tailwind CSS v4 + shadcn/ui (Base UI)

Status: proposal · Owner: Pavel · Last updated: 2026-10-25 (facts checked against `main`
of both repos at fed0d99 / 061bacf)

## Where things stand

**Done:**
- Phase 0, npm: uglyunicorn-eh/santa-barbara#158.
- Phase 1.2, frontend limits (`src/limits.ts`, a max on every field and input): #159.
- Phase 1.3, at most 100 people per party: uglyunicorn-eh/santa-monica#39.
- Phase 1.4, layouts at the limits: recorded in `docs/layout-audit.md`. Six screens
  overflow with normal data on small phones (e.g. the 8-letter code in the "party
  created" dialog is cut off at 320px), and party, join and email-change screens break
  with the longest values. Each is fixed by the PR that rebuilds its screen.
- Phase 2 step 2, the screenshot script: `npm run shots` (`scripts/shots/`), with
  "before" screenshots taken on `main`.

- Phase 2 step 3, the design spec: `docs/design-spec.md`, settled (#162).
- Phase 3, Tailwind and shadcn (Base UI) beside Bulma, with the spec's tokens: no visible
  change (see Phase 3's "What it took").

- Phase 2 step 4, the UI kit page: `/ui-kit` in `npm run dev`.
- Phase 4.1, the Button: every button in the app uses `src/components/ui/button.tsx`.

Open as a stack, to merge in order: #162 (design spec, on its own) and #163 (Tailwind
setup) → #164 (UI kit) → #165 (Button).

**Next:** Phase 4.2 (form fields; Formik → React Hook Form, Yup → Valibot).

**Frontend (santa-barbara):** talks to the backend's plain JSON API (`src/api/client`);
hosted on Cloudflare Pages, with a Content-Security-Policy from `public/_headers` that
an integration in `astro.config.mjs` fills in at build time. Inline styles are allowed;
fonts may come from Google Fonts only. Forms still use Formik + Yup.

**Backend (santa-monica):** plain JSON API on Hono with Valibot (pinned `1.5.0`) for
every input and output, npm with `package-lock.json`. Every input is bounded
(`src/api/limits.ts`), and so is the number of people per party.

Nothing in this plan depends on the backend; its only links to it are the shared length
limits and using the same Valibot version.

## Goal

1. **npm** instead of Yarn 1 (Phase 0).
2. **Every input bounded, and every screen built for the bounds** (Phase 1): the same
   limits in the forms as in the API, a member cap per party, and layouts that hold up
   with the longest allowed names, emails and lists.
3. **Replace Bulma 0.9.4, `react-bulma-components` 4.1.0, `bulma-divider` and Sass with
   Tailwind CSS v4 and shadcn/ui on Base UI** (Phases 2–6), and use the move to make
   the controls cleaner and more consistent.

**Visual direction: same layout, exacting controls.**
- **The layout stays.** Every page keeps its structure: what sits where, the columns,
  where things stack on phones (same breakpoints as today), container widths, the hero
  screens with their photo backgrounds, the illustrations, the dialogs' header / body /
  footer arrangement, and each form's label placement. The app's identity (Cuprum, the
  artwork, the playful copy) stays too.
- **The controls get cleaner**, held to one small, strict system: one spacing scale, one
  type scale, a few control sizes, a few button variants, consistent inputs, errors,
  focus, disabled and loading states, and one look for every dialog.
- "Done" means a screen has the same layout as its "before" screenshot, and its controls
  and text follow the system exactly, at phone and desktop widths, with the longest
  allowed content.

Main wins:

- Drop the global `React.createElement` patch in `src/components/bulma.tsx`. It exists
  only because `react-bulma-components` relies on `defaultProps`, which React 19 ignores.
- Drop Sass `@import` (deprecated since Dart Sass 1.80, removed in 3.0) and a CSS
  framework stuck on 0.9.
- Accessible primitives (focus trapping in dialogs, keyboard tabs, visible focus) from Base UI.
- Component code lives in the repo (`src/components/ui/*`), so we own the styling.

We also replace Formik with React Hook Form and Yup with Valibot (Phase 4.2). shadcn
documents React Hook Form, TanStack Form and Formisch, not Formik, and we rewrite the
form wrappers then anyway. Valibot is the smallest option for our tiny schemas (required,
max length, email, one pattern, one custom check), infers form types from them, and is
what the backend validates with, so we pin the same version (`1.5.0`).

Non-goals: new features, rewording existing copy, replacing react-router,
framer-motion, react-feather or react-hot-toast. (Two new pieces of text are part of
the plan: the "party is full" message and the summary for long participant lists.)

## Why shadcn and not coss

Both copy Base UI-based components into the repo. We pick shadcn because it has the larger
ecosystem and an official Astro guide. We restyle everything to our own system anyway, so
coss's nicer defaults wouldn't help much. coss components install through the same
shadcn CLI, so we can still pull individual coss pieces later
(e.g. `npx shadcn add @coss/<component>`).

## Current footprint (audit of `main` at fed0d99, 2026-10-25)

| Bulma piece | Uses | Where | Replacement |
|---|---|---|---|
| `Hero` / `Hero.Body` / `Hero.Header` / `Hero.Footer` | 24 | AppSpinner, EnterContainer, JoinBox, LoginBox, PartyDetails, PartyNotFound, StartPage, 404.astro | Own `<FullPage>` layout component |
| `Columns` / `Columns.Column` | 24 | ConfirmPartyLeave, EnterContainer, PartyDetails, StartPage, KnowledgePageLayout | Tailwind `flex` / `grid` |
| `Content` | 15 | Most dialogs, PartyDetails, StartPage, GrinchBox, KnowledgePageLayout, PartyNotFound, 404.astro | `@tailwindcss/typography` (`prose`) |
| `Container` | 9 | 8 files | Own `<Container>` |
| `Button` (+ `a.button`) | 22 + 3 | Everywhere; the links are in PartyNotFound, 404.astro, KnowledgePageLayout | shadcn `Button` with our variants |
| `Footer` | 6 | Page footers | Plain `<footer>` |
| `Modal` / `Modal.Card.*` | 1 component, 6 users | `DialogBox` (NewParty, MyProfile, ConfirmPartyClose/Delete/Leave, JoinParty) | shadcn `Dialog` |
| `Form.Field/Label/Control/Help/Input` | 1 wrapper set + MyProfile | `components/forms/*`, MyProfile | shadcn `Field`, `Label`, `Input` |
| Formik (`Formik`, `useField`, `useFormikContext`) | 4 wrappers + DialogBox + MyProfile; 10 forms pass `validationSchema`/`onSubmit` | `components/forms/*`, DialogBox, MyProfile, LoginBox, JoinBox, JoinParty, NewParty, ConfirmPartyClose/Delete/Leave | React Hook Form + `valibotResolver` |
| Yup schemas | 10 (3 empty) | LoginBox, JoinBox ×2, JoinParty, NewParty, MyProfile ×2, ConfirmPartyClose/Delete/Leave | Valibot |
| `Tabs` | 1 | MyProfile + `Tab.tsx` (router links) | shadcn `Tabs` (links as tabs) or a styled `<nav>` |
| `Card` / `Card.Content` | 1 | GrinchBox | shadcn `Card` |
| `Message` / `Message.Body` | 1 | GnomeSays | Plain `<div>` (the look is all custom) |
| `Image` | 1 | EnterContainer | `<img>` |
| `Section` | 1 | KnowledgePageLayout | `<section>` |
| `bulma-divider` | 1 | `Divider.tsx` (StartPage) | shadcn `Separator` + own label |
| Helper classes (`is-size-7`, `has-text-*`, `is-hidden-*`, `is-rounded`…) | 28 kinds in JSX; about 20 are Bulma's, the rest our own state classes (`is-open`, `is-closed`, `is-deleted`, `is-host`, `is-guest`) | Mostly JSX | Tailwind utilities; state classes become `data-*` attributes |
| `react-bulma-components` types (`Color`, `Size`, `ElementProps`) | 3 files | `src/types.ts`, `forms/Input.tsx`, `forms/Submit.tsx` | Our own variant types from the shadcn components |
| SCSS | 15 files, 1,279 lines | `src/styles` | Tailwind classes, plus a small CSS file per feature for artwork |
| `@include mobile/tablet/desktop` | 39 | SCSS | Tailwind responsive variants |

30 files import from `src/components/bulma`.

Colours in use today: Bulma 0.9.4 defaults we never customised (primary turquoise
`hsl(171 100% 41%)`, link blue, danger, warning), plus hand-picked values in SCSS
(`#d92f33` ×4, `#eb4f5e` ×2, `#141414` ×5, `#111217` ×2, `#17181d`) and the browser
theme colour `#b3202c`. The turquoise primary was never a choice; Phase 2 picks the
palette on purpose.

---

## Phase 0: yarn → npm (½–1 hour, 1 PR)

Do this first and on its own, so later dependency changes land in one lockfile, and a
broken install can't be confused with a broken migration. Every command in this plan
uses npm.

Why: the backend already uses npm with `package-lock.json`, and this repo's README
already says `npm install` / `npm run`. Only the lockfile is still Yarn 1 (classic), which
is in maintenance mode. Yarn 1 also enforces every package's Node version strictly: on
Node 22.21 it refuses to build at all (Astro asks for 22.23.4+), while npm only warns.

Where yarn shows up today:

| Place | Change |
|---|---|
| `yarn.lock` (Yarn 1 lockfile) | Delete; commit `package-lock.json` |
| `package.json` `resolutions` (`@types/react`, `@types/react-dom` → `^19`) | Remove (npm ignores it). Every copy already resolves to 19.3.0, so no `overrides` are needed. If one ever is, write `"@types/react": "$@types/react"` (npm refuses a plain range that clashes with a direct dependency) |
| `.gitignore` (`yarn-debug.log*`, `yarn-error.log*`) | Remove those lines |
| Cloudflare Pages build | Pages picks the package manager from the lockfile, so with `package-lock.json` it installs with npm. In the Pages project settings, check the build command is `npm run build` (not `yarn build`); Node comes from `.node-version` (22.23.4) |
| `.github/dependabot.yml` | No change needed: `package-ecosystem: "npm"` covers both, and it will update `package-lock.json`. Optional: copy the backend's setup (7-day cooldown, grouped minor/patch updates) |
| README | No change: it already shows npm |

Steps:

1. `rm -rf node_modules yarn.lock`, remove `resolutions`, drop the two yarn lines from
   `.gitignore`, then `npm install`. Delete `yarn.lock` before running any npm command:
   while it exists, npm rewrites it in its own format (even `npm ci --dry-run` does).
2. `npm ls @types/react @types/react-dom` shows only 19.3.0.
3. Compare resolved versions with the old `yarn.lock`. Last time every direct dependency
   kept its version (`astro` 7.4.2, `react` 19.3.1, `react-router-dom` 7.18.4,
   `framer-motion` 14.6.0 …); only build tooling moved (`@parcel/watcher` 2.5 → 2.6 for
   Sass, the language-server packages behind `astro check`). `npm ls` lists
   `@img/sharp-wasm32` as extraneous; it's an optional fallback of `sharp` and harmless.
4. `npm ci && npm run build` (includes `astro check` and the CSP hook; check that
   `dist/_headers` has a filled-in policy), then click through the app with `npm run dev`
   (sign in, create, join, profile).
5. Check the Pages build command in the same deploy as the merge. A `yarn build` command
   would fail once `yarn.lock` is gone.
6. Optional: add `"packageManager": "npm@<version>"` and `"engines": { "node": ">=22.23.4" }`
   to `package.json`.

Done when: no `yarn.lock` and no `resolutions`; `npm ci && npm run build` passes on a
clean checkout; the Pages deploy builds with npm.

## Phase 1: Size limits and boundaries (1–1½ days, 2 PRs: one per repo)

Every value a person can enter or the API can return has a known maximum. Phase 1 makes
the forms enforce the same maximums as the API, adds the one missing bound (members per
party), and makes the screens hold up at those maximums. The redesign in Phases 4–5 is
then checked against the same worst cases.

### 1.1 The limits

| What | Max | Enforced by the API (`src/api/limits.ts`, `src/api/schemas.ts`) | Frontend today | Frontend after |
|---|---|---|---|---|
| Person name (join, profile) | 100 | ✓ trimmed, spaces collapsed | `.max(100)` hard-coded, no `maxLength` | `MAX_NAME_LENGTH` in schema + `maxLength` |
| Party name | 100 | ✓ | `.max(100)`, no `maxLength` | same as above |
| Secret phrase (create, join) | 100 | ✓ trimmed only | `.max(100)`, no `maxLength` | `MAX_PHRASE_LENGTH` |
| Email (sign-in ×2, change email) | 128 | ✓ trimmed, lowercased | `.max(128)` on two of three forms (JoinBox sign-in has none) | `MAX_EMAIL_LENGTH` on all three |
| Party code (join by code, hidden field) | 8 (old codes 5) | ✓ pattern | `maxLength={8}` + pattern on JoinParty only | `MAX_PARTY_CODE_LENGTH` on both |
| Tokens from links (`/enter/:token`, `/profile/email/…`, `/profile/delete/:token`) | 2048 | ✓ | not checked | leave to the API (it refuses them by name) |
| History page size | 1–100 | ✓ | `HISTORY_PAGE_SIZE = 5` | unchanged |
| Request body | 16 KB | ✓ | — | — |
| Members per party | — | **✗ no cap** | — | shows the API's "party is full" message |

### 1.2 Frontend PR

1. Add `src/limits.ts` with `MAX_NAME_LENGTH = 100`, `MAX_PHRASE_LENGTH = 100`,
   `MAX_EMAIL_LENGTH = 128`, `MAX_PARTY_CODE_LENGTH = 8`, with a comment that the API's
   `src/api/limits.ts` holds the same numbers.
2. Every Yup schema uses the constants (no number literals), and every `<Input>` gets a
   matching `maxLength`, so the browser stops typing at the limit. Includes the missing
   `.max` on JoinBox's sign-in email and on its hidden `party` field.
3. Joining a full party: API errors from party actions already appear as an error
   notification with the API's message (`partyAction` in `useAppClient`), so nothing new
   is needed; check the wording once 1.3 lands.
4. Check: `grep -rnE "\.max\([0-9]|maxLength=\{[0-9]" src` finds nothing; every
   `<Input` has a `maxLength`; `npm run build` passes.

### 1.3 Backend PR (santa-monica)

1. Add `MAX_PARTY_MEMBERS` (proposal: 100, host included) next to the other limits.
   **Decide the number:** a large office exchange could need more.
2. In `PartyDO.join`, after the closed check and the secret-phrase check, refuse when
   `memberCount() >= MAX_PARTY_MEMBERS`, the same way it refuses a closed party, with a
   message people can act on ("This party is full: it already has 100 people.").
3. Unit test: fill a party with stand-in membership rows straight in the Durable Object
   (no hundred real joins), then one join succeeds and the next is refused.
4. README: add the cap to the limits paragraph.

### 1.4 Layouts at the limits

Long values must never break a layout: wrap or truncate on purpose, never overflow.
Make these the standard test data, used in Phase 1 to find today's breakages and in every
Phase 4–5 PR to accept a screen:

- A 100-character party name with no spaces, and one with ordinary words.
- A 100-character person name; the same name for every participant.
- A 128-character email (in the profile, the sign-in confirmation, the email-change
  notice).
- A party with 100 participants (host view lists them all) and a long history list.
- A phone at 320px wide as well as 375px.

Rules (they fit inside the existing layout; nothing moves): names and emails in running
text use `overflow-wrap: anywhere`; single-line slots (history rows, headers, buttons)
use `truncate` with the full value in `title`; a list longer than a screen stays where it
is but is summarised (e.g. "Alice, Bob and 98 others" with a "show all" toggle) or
scrolls inside its section.

Done when: both PRs merged; no hard-coded lengths in the frontend; every screen in the
Phase 2 list has been checked with the worst-case data, and every overflow found is
written down with its screen. Fixing those overflows is part of the Phase 4–5 PR that
rebuilds that screen; Phase 6 confirms none are left.

## Phase 2: Baseline and design direction (1–1½ days)

1. **Screens to cover**, at 320px, 375px and 1280px wide, with normal and worst-case
   data (1.4):
   - `/` (start page; signed-in and signed-out)
   - `/enter/`, `/enter/:token`, `/join/`, `/new/` (form, then congratz state)
   - `/p/:code/` as host, as guest, closed, deleted, plus `confirm`, `delete`, `leave`
   - `/profile/` (settings, history, danger zone), `/profile/history/`,
     `/profile/email/:token`, `/profile/email/cancel/:token`, `/profile/delete/:token`
   - `/how-it-works`, `/privacy`, `/terms`, 404, the loading spinner
2. **Screenshot script (required).** About 25 screens × 3 widths × 2 data sets is
   around 150 screenshots per PR: too many to take by hand, and this repo has no CI
   (Cloudflare Pages previews are the only automatic check). Add a Playwright script
   (`npm run shots`, under `scripts/`) that:
   - fakes the API with `page.route()`, answering from JSON fixture files in
     `scripts/fixtures/` (normal and worst-case data from 1.4), so no backend, seeding
     or magic-link sign-in is needed. Signed-in screens only need a `profile` and a
     `userToken` in `localStorage` (nothing on screen checks the token); the sign-in link
     page does check its token's signature, so the build gets a throwaway key pair
     (`PUBLIC_JWT_PUBLIC_KEY`) and the script signs those links itself;
   - visits every screen in step 1 at every width and saves the shots to a folder
     named after the branch;
   - optionally diffs two folders (e.g. `main` vs. a branch) and lists what changed.

   The first run on `main` gives the **"before" screenshots**. They're the target for
   **layout** (arrangement, columns, stacking, widths); controls and type are judged
   against the spec instead.
3. **Design spec** (one short page in `docs/`) for controls and type, decided before
   Phase 4:
   - Palette: brand red from `#b3202c` / `#d92f33`, a neutral scale, and semantic roles
     (primary, destructive, muted, border, ring). Replaces Bulma's turquoise.
   - Type scale: 5–6 steps (e.g. `text-sm` … `text-4xl`) and weights 400/500/600 of
     Cuprum; one line-height per step.
   - Spacing: Tailwind's 4px scale only; no arbitrary values except in artwork CSS.
   - Controls: heights 32 / 40 / 48px (`sm` / `md` / `lg`), one radius for inputs and
     buttons, a pill shape only for the main call to action on hero screens, a visible
     focus ring on everything focusable, disabled and loading states.
   - Buttons: `primary`, `secondary` (outline), `ghost`, `destructive`, `link`. Today's
     extras (Bulma `black`, `warning`, `white` outlined, `text`) map onto these.
   - Forms: keep each form's label placement (the NewParty and JoinParty dialogs put
     labels beside inputs from tablet width up; the full-page forms put them above).
     Restyle only: label type, input height and border, help text and errors below the
     input, consistent gaps.
   - Dialogs: keep today's arrangement (title + close, body, footer with the dismiss
     action and the main action) and widths; restyle surfaces, spacing and buttons.
   - Notifications (react-hot-toast): every API error appears there, so they follow the
     spec too: colours, type, radius, and room for the longest message. Style them
     through the toaster's options in `NotificationsContainer`.
   - Layout tokens are taken from Bulma so nothing moves: breakpoints `tablet` 769px,
     `desktop` 1024px, `widescreen` 1216px, `fullhd` 1408px, and container widths 960 /
     1152 / 1344px.
4. **UI kit page** for review: one page that shows every control in every state on the
   real backgrounds. It must not ship: the site is built as static pages, so a page in
   `src/pages/` is always emitted, even if it renders a 404. Keep the page outside
   `src/pages/` (e.g. `src/dev/ui-kit.astro`) and add its route from a small integration
   in `astro.config.mjs` only in dev:
   `'astro:config:setup': ({ command, injectRoute }) => { if (command === 'dev')
   injectRoute({ pattern: '/ui-kit', entrypoint: './src/dev/ui-kit.astro' }); }`.

   **Done:** `src/dev/ui-kit.astro`, open `http://localhost:4321/ui-kit` while
   `npm run dev` runs (or start a second server with `npx astro dev --port 4400
   --ignore-lock` when another one already runs in the folder). It shows the tokens
   (colours, roles, type, corners, shadows), then on night, paper and glass every button
   variant in every state (resting, hovered, keyboard focus, disabled, busy, and a live
   one to try), the sizes and pill, form fields in each state, the label-beside and inline
   layouts, two dialogs, the profile tabs, toasts on night and paper, and the longest
   values. Hover and focus are shown forced, so they can be compared without a mouse.
   - The controls are prototypes: class recipes in `src/dev/recipes.ts`, written from the
     spec. Phase 4 builds the real components from them (4.1 takes the button recipe as
     its variants), and the kit then renders those components instead.
   - The kit has its own stylesheet (`src/dev/ui-kit.css`: `tailwind.css` plus
     `@source "./"`), so its classes never reach the production CSS.
5. Check that `npm run build` passes and nothing is broken before starting.

## Phase 3: Tooling, run both side by side (½–1 day, 1 PR)

Nothing should look different after this phase; it only makes Tailwind available. The
screenshot script (Phase 2) checks that, including after the reset in step 5.

1. Install: `npm install tailwindcss @tailwindcss/vite tw-animate-css`
   and `npm install class-variance-authority clsx tailwind-merge @base-ui/react`.
   The old package name `@base-ui-components/react` stopped at `1.0.0-rc.0`; Base UI
   ships as `@base-ui/react` (1.9.0 today). `@tailwindcss/typography` waits for Phase 5,
   where `prose` is first used: it pins `postcss-selector-parser` 6.0.10, which has a
   moderate advisory fixed only in 7.1.6, so check for a fixed release then.
2. `astro.config.mjs`: add `vite: { plugins: [tailwindcss()] }`, next to the existing
   `react()` and `contentSecurityPolicy` integrations (keep both).
3. `tsconfig.json`: add `"paths": { "@/*": ["./src/*"] }`. Keep the existing
   `src/...` imports working; `baseUrl` is deprecated in TS 6, so plan to switch every
   import to `@/` later (one mechanical commit).
4. Create `src/styles/tailwind.css` with just `@import "tailwindcss";` (init looks for
   it), then run `npx shadcn@latest init --base base --preset nova --yes --no-monorepo
   --no-rtl --pointer` (the flag is `--base base`). It writes `components.json`
   (aliases `@/components/ui`, `@/lib/utils`) and rewrites `tailwind.css`. Then undo
   what we don't want from it:
   - It adds the whole `shadcn` CLI package (~270 packages) as a dependency, only for
     `@import "shadcn/tailwind.css"`. Uninstall it and copy that file's `data-*` state
     variants (MIT) into `tailwind.css`; run the CLI with `npx` to add components.
   - It makes `cn()` re-export a new `cn` package (pre-1.0). Uninstall it; `cn()` in
     `src/lib/utils.ts` is the usual `twMerge(clsx(…))`.
   - It adds the Geist font and `lucide-react`. Uninstall both: the font stays Cuprum,
     and `npx shadcn add` installs `lucide-react` again when a component needs it.
5. Edit `src/styles/tailwind.css`: the design tokens from the Phase 2 spec go in
   `@theme`, mapped onto shadcn's semantic variables (`--primary`, `--destructive`,
   `--ring`, `--radius`, …), plus Bulma's breakpoints so layouts don't move:
   `--breakpoint-tablet: 769px; --breakpoint-desktop: 1024px;
   --breakpoint-widescreen: 1216px; --breakpoint-fullhd: 1408px;`. Use these names, never
   Tailwind's `md:` / `lg:` (768px is 1px off Bulma's edge).

   **Cascade layers.** Bulma's rules aren't in a layer, and unlayered CSS beats every
   layered rule whatever its specificity, so Tailwind utilities would lose to rules like
   `.content h1`, `button` or `.input`. Put Bulma and all of our existing SCSS into a
   `bulma` layer below Tailwind's utilities:
   ```css
   /* tailwind.css */
   @layer theme, base, bulma, components, utilities;
   @import "tailwindcss/theme.css" layer(theme);
   @import "tailwindcss/preflight.css" layer(base);   /* see "The reset" below */
   @import "tailwindcss/utilities.css" layer(utilities);
   @import "tw-animate-css";
   ```
   ```scss
   // global.scss: repeat the order first (whichever file the browser sees first sets it)
   @layer theme, base, bulma, components, utilities;
   @import "bulma/sass/utilities/_all";   // mixins and variables only: stays at the top
   @layer bulma {
     @import "bulma/sass/base/_all";
     /* …the other Bulma imports and our own partials… */
   }
   ```
   Four stylesheets are imported on their own, not through `global.scss`:
   `garage.scss` (GarageDoor), `divider.scss` (Divider), `404.scss` (404.astro) and
   `knowledge-page.scss` (KnowledgePageLayout). Wrap each file's contents in
   `@layer bulma { … }` too. Left unlayered, they'd start beating Bulma everywhere
   they overlap, and the pages would change.

   **The reset (preflight).** shadcn's components assume Tailwind's reset; without it they
   get the browser's default button and input styles. Load it in the `base` layer,
   *below* `bulma` (as above): where Bulma's own reset and preflight both style
   something, Bulma wins, so today's pages should barely change. Preflight also sets a
   few things Bulma doesn't (`img { display: block }`, `* { border: 0 solid }`), so
   compare the screenshots. If anything moves that can't be fixed in a line or two, drop
   the preflight import for now and build Phase 4 on the UI kit page with preflight
   switched on there only; Phase 6 then turns it on for everything.

   Import `tailwind.css` in `BaseLayout.astro` after `global.scss`.
6. Bulma's colours: leave them for now (this phase changes nothing visible). Phase 4.1
   points them at the new palette.
7. Checks: build passes, `dist/_headers` still has a filled-in CSP, no CSP errors in the
   browser console, and the screens match the Phase 2 "before" screenshots.

**What it took** (done: `build/tailwind-setup`). The screenshot comparison against
`main` (`npm run shots:compare`) found four ways the setup changed pages, each fixed:

- **Tailwind scanned the whole repo**, including the class examples in `docs/`, and
  generated real utilities for them. `container` hit Bulma's `<Container>`
  (`class="container"`) with different max-widths. Fix: `source(none)` on the utilities
  import, `@source` for `src/components`, `src/layouts`, `src/pages` only, and
  `@source not inline("container")`.
- **Bulma's `@extend`ed rules escaped the layer.** `utilities/_all` defines placeholders
  (`%control`, …); Sass writes extended rules where the placeholder is defined, so with
  that import outside `@layer bulma`, `.button`'s 1rem came out unlayered and beat
  `.button.is-medium`. Fix: import it inside the layer too.
- **A partial with its own layer wrapper became a nested layer.** `404.scss` is both a
  partial of `global.scss` and was imported by `404.astro`; wrapped in `@layer bulma`, its
  copy inside `global.scss` became `bulma.bulma`, which loses to rules directly in
  `bulma`. Fix: it's a plain partial again, and `404.astro` relies on `global.scss`.
  Only files that aren't partials get their own wrapper.
- **The reset made media blocks**, removing the baseline gap under inline images (7px on
  the sign-in card). Fix: `display` and `vertical-align` revert to the browser's for
  media, inside the `bulma` layer (Bulma's own `.image img` still wins).

Result: 154 of 186 screenshots identical; the other 32 differ by at most 0.1%, and a
second run of the same code differs on the same 32 (snow, confetti, the spinner).
Checked structurally too: nothing is outside a layer but the font import, Tailwind's
`@property` rules and `:root` variables, and no layer is nested.

Also: `@theme static`, so every token is a CSS variable from the start;
`npm run shots:compare` (pixel diff of two runs) added to the screenshot script.

## Phase 4: Shared components (4–5 days, 4–5 PRs)

Goal: no file imports `react-bulma-components` except layout code. Each step can ship on
its own, and each is built to the Phase 2 spec and shown on the UI kit page first.

### 4.1 Button
- `npx shadcn add button`; set its `cva` variants to the spec: `primary`, `secondary`,
  `ghost`, `destructive`, `link`; sizes `sm` / `md` / `lg`; props `pill`, `fullWidth`,
  `loading` (spinner, disabled, keeps its width).
- Map today's uses (22 `<Button>`, plus the `a.button` links in
  `KnowledgePageLayout.astro`, `PartyNotFound.tsx` and `404.astro`, via
  `buttonVariants()` on the `<a>`):
  - `color="primary"` → `primary`; `color="danger"` → `destructive` (outlined →
    `secondary` with destructive text); `color="warning"` (NewParty "go to party") and
    `color="black"` (GuestContent) → `primary` or `secondary`, chosen in review.
  - `outlined text rounded` combinations and `is-white is-outlined` → `secondary`.
  - `className="is-rounded is-link"` (JoinBox ×3, LoginBox, EnterContainer) →
    `primary pill` (they're each screen's main action).
  - `className="is-ghost has-text-danger"` (DeletePartyLink) → `ghost` with destructive text.
  - Plain text buttons, `size="small" text` (MyProfile: "Change", "Cancel" ×2) → `ghost`
    (or `link` where it reads as a link).
  - The default button with no colour (DialogBox's reset-type "Nah, never mind" dismiss)
    and the plain outlined ones ("Show more parties" in history, …) → `secondary`.
- **Same PR: point Bulma's colours at the new palette.** Set Bulma's Sass variables
  (`$primary`, `$link`, `$danger`, `$warning`, …) to the spec's values before importing
  Bulma in `global.scss`. Until each area is rebuilt, Bulma still styles input focus
  rings, tabs and links; without this they'd stay turquoise and blue next to the new
  red buttons.
- `forms/Submit.tsx` and `src/types.ts`: drop the `react-bulma-components` `Color`/`Size`
  types and reuse `ButtonProps`. `Submit` keeps reading `isSubmitting` from Formik until 4.2.

**Done** (`ui/button`). `src/components/ui/button.tsx` is shadcn's Base UI button with the
spec's variants: `brand`, `primary`, `secondary`, `ghost`, `ghost-destructive`,
`destructive`, `link`; sizes `sm` / `md` / `lg`; `surface` (`light` | `dark`, for night and glass);
`pill`, `fullWidth`, `loading`. Every `<Button>`, `Submit` and `a.button` uses it, and
`bulma.tsx` no longer exports `Button`. What came up:
- `npx shadcn add` re-installs the `cn` package and imports it; uninstall it and point
  the import at `@/lib/utils` after every `add`.
- Buttons wrap instead of overflowing: sizes are minimum heights (one line is exactly
  32 / 40 / 48px, borders included), and long labels on phones take a second line.
  This fixed four of the audit's 320px overflows; see `docs/layout-audit.md`.
- A busy button is disabled (no double submit) but keeps its colour; only disabled
  fades.
- Surfaces per screen: dark on sign-in, join, the account-link pages and the two "not
  found" pages; light everywhere else, including the sign-in link page (its photo is
  light) and every dialog.
- One rule for shape and size, so the same kind of button looks the same everywhere
  (also in the comment at the top of `button.tsx`): on hero screens (sign-in, join, the
  sign-in link page, account links, party not found, 404) the main action is `brand`
  `lg` `pill` and going home or back is `secondary` `pill` (md); on content screens
  (party pages, dialogs, the profile, knowledge pages) the main action is `primary`, no
  pill and `md`, with `sm` only in the profile's setting rows.
- Two main-action colours, decided after seeing the red everywhere: `brand` is the red
  (`#c62a30`) for hero screens; `primary` is the app's old turquoise (`#00d1b2`) with a
  dark teal label (`#04342c`, 7:1) for content screens, so "go" and "delete" never share
  a colour there. Links and focus rings on light backgrounds are teal-700 (`#007a68`,
  5.3:1), and Bulma's `$primary` / `$link` follow. Red on a content screen now means
  danger only.
- SCSS that styled `.button` (sizes, colours, `.login-button`) no longer applies; the
  dialog footer gets its own `gap` (Bulma spaced footer buttons with a margin on `.button`).
- The UI kit renders the real Button now.

### 4.2 Form fields + Formik → React Hook Form + Yup → Valibot (one PR)

The wrappers, `DialogBox` and `MyProfile` all read the same form context, so the library
switch can't be split up: everything below lands together.

**Packages:** `npm install react-hook-form @hookform/resolvers valibot@1.5.0` (the
backend's version); `npx shadcn add input label field`.

**Keep the wrapper API.** Pages keep using `<Form>`, `<FormField name>`, `<Input>`,
`<Submit>`. Only `Form`'s props change from Formik's to ours:

```tsx
type FormProps<V extends FieldValues> = {
  defaultValues: V;              // was initialValues
  schema?: v.GenericSchema<V>;   // was validationSchema (Valibot)
  onSubmit: (values: V) => unknown | Promise<unknown>;
  mode?: "onTouched" | "onSubmit"; // default "onTouched" ≈ Formik's blur/change + touched
  values?: V;                    // replaces enableReinitialize (MyProfile)
  children: React.ReactNode;
};
// Inside: useForm({ defaultValues, values, mode, resolver: schema && valibotResolver(schema) })
// <FormProvider {...methods}><form method="POST" noValidate onSubmit={methods.handleSubmit(onSubmit)}>…
```

No `onSubmit` in the app uses Formik's second `helpers` argument, so every handler
moves over unchanged.

**Wrapper by wrapper:**
- `forms/Form.tsx`: `useForm` + `FormProvider` as above.
- `forms/FormField.tsx`: rebuild on shadcn `Field` / `Label` / `FieldDescription` /
  `FieldError`. Keep the `horizontal` prop and both layouts (beside: label column 150px,
  right-aligned, stacked below tablet width; above), written as Tailwind classes, so
  `forms.scss` can go. `useField(name)` meta →
  `useFormContext().getFieldState(name, formState)` (or `useController`). Show the error
  when `fieldState.error` is set; with `mode: "onTouched"` RHF already holds errors back
  until blur or submit, like Formik's `touched` check.
- `forms/Input.tsx`: wrap the shadcn `Input` with `register(name)`. Merge RHF's `ref`
  with the local ref used for `autofocus` focus/select (small `mergeRefs` helper, or use
  `setFocus(name)` + `select()` from the form context). Read `formState.isSubmitting`
  for `disabled`. Keep `maxLength` from Phase 1. Drop `domRef` and the
  `react-bulma-components/src/components` types.
- `forms/Submit.tsx`: `useFormContext().formState.isSubmitting` → `loading`.
- `DialogBox.tsx`: `form` prop becomes our `FormProps`. When there's no `form`,
  wrap in an empty `<Form defaultValues={{}} onSubmit={noop}>` (today's empty `<Formik>`)
  so `DismissButton`'s `isSubmitting` still works.
- `MyProfile.tsx` (512 lines):
  - name form: `initialValues` + `enableReinitialize` → `values={{ name: profile?.name ?? "" }}`.
  - `InlineField` (input + button on one line): `useField(name)` meta → `getFieldState`;
    `BulmaForm.Help` → `FieldError`.
  - `SaveButton`: `useFormikContext().dirty` → `formState.isDirty`.
  - Both forms (name and email) set `validateOnBlur={false}` → `mode="onSubmit"` (check
    the old timing first; Formik still validated on change there).
  - The email schema is built from the current address
    (`emailValidationSchema(currentEmail)`, with a `.test()` that refuses it with "That's
    already your email."). Build the Valibot schema in a `useMemo` keyed on the email.
- The 10 forms: `initialValues` → `defaultValues`, `validationSchema` → `schema`.
  Confirm dialogs with `initialValues = {}` keep an empty object and drop the schema
  (today's `Yup.object()` checks nothing).
- **Every schema declares every field its form submits.** Formik passed the raw values
  to `onSubmit`, so fields missing from a Yup schema still arrived. React Hook Form
  passes the resolver's *output*, and Valibot's `v.object` drops keys it doesn't know.
  Today one form depends on that: JoinBox's join form submits `party` (the party code,
  set in `initialValues`), but `joinValidationSchema` only has `name` and `password`.
  Without `party: v.pipe(v.string(), v.nonEmpty(), v.maxLength(MAX_PARTY_CODE_LENGTH))`
  in its schema, `joinParty` would get no code and every join would fail.
- Delete `forms.scss`; `npm uninstall formik yup`.

**Yup → Valibot.** Today's error messages come from Yup's default wording plus
`.label()`. Valibot has no labels, so each rule carries its message explicitly. Keep
today's wording (it can be polished later, separately). Put the message builders in
`src/components/forms/messages.ts`:

```ts
import * as v from "valibot";
import { MAX_NAME_LENGTH, MAX_PHRASE_LENGTH } from "src/limits"; // Phase 1; never hard-code lengths

export const required = (label: string) => `${label} is a required field`;
export const maxLen = (label: string, n: number) => `${label} must be at most ${n} characters`;
export const validEmail = (label: string) => `${label} must be a valid email`;

// Example: NewParty
export const newPartySchema = v.object({
  name: v.pipe(v.string(), v.nonEmpty(required("Party name")), v.maxLength(MAX_NAME_LENGTH, maxLen("Party name", MAX_NAME_LENGTH))),
  password: v.pipe(v.string(), v.maxLength(MAX_PHRASE_LENGTH, maxLen("Secret phrase", MAX_PHRASE_LENGTH))),
});
export type NewPartyValues = v.InferOutput<typeof newPartySchema>;
```

| Yup | Valibot |
|---|---|
| `.string()` | `v.string()` |
| `.trim()` | `v.trim()` (first in the pipe, so later checks see the trimmed value, as in Yup) |
| `.required()` | `v.nonEmpty(msg)` (after `v.trim()` where the Yup schema trims) |
| `.max(n)` | `v.maxLength(n, msg)` |
| `.email()` | `v.email(msg)` |
| `.matches(re, msg)` | `v.regex(re, msg)` (JoinParty party code) |
| `.test(name, msg, fn)` | `v.check(fn, msg)` (MyProfile: not the current email) |
| `.ensure()` | Drop it: RHF-registered inputs are always strings. If a default can be `undefined`, use `v.optional(v.string(), "")` |
| `.label("X")` | Put the label into each message |

Schemas per form: LoginBox (email), JoinBox (join: name, password; sign-in: email,
party — `party` has no label, so its message reads "party is a required field"),
JoinParty (code), NewParty (name, password), MyProfile (name, new email). Only the two
MyProfile schemas trim.

Formik validated the trimmed value but passed the *raw* input to `onSubmit`, which is
why MyProfile's handlers call `.trim()` themselves. The React Hook Form resolver passes
the *transformed* (trimmed) values instead. That's harmless, and the handlers can keep
their own `.trim()`. Use `v.InferOutput<typeof schema>` in place of the
hand-written `FormValues` / `*Input` types where they match.

**Behaviour to check per form** (LoginBox, JoinBox ×2, JoinParty, NewParty,
ConfirmPartyClose/Delete/Leave, MyProfile name + email):
- Each message reads exactly as before; spaces alone fail "required" where the old
  schema trimmed (MyProfile) and pass where it didn't (NewParty, JoinBox); a trailing
  space in an email is trimmed, not rejected, in MyProfile.
- When the error first appears (blur vs. submit) and when it clears while typing.
- Submit button spinner and disabled inputs while the request runs.
- Double submit still blocked (NewParty also has its own `submitting` ref and request id).
- Typing stops at each `maxLength`; the longest values (1.4) fit the field and its error.
- `onSubmit` receives every field the form had before (log the values once per form and
  compare with today's; JoinBox's join form must still send `party`).
- Autofocus + select-all on open.
- MyProfile name field refreshes after save; Save is disabled until something changes.
- Enter key submits; native browser validation stays off (`noValidate`).

### 4.3 DialogBox (the riskiest step)
- `npx shadcn add dialog`, laid out as in the spec.
- Keep the same public API (`title`, `dismissLocation`, `dismissLabel`, `noDismiss`,
  `action`, `form`, `cardStyle`, `noHeader`, `className`) so the 6 dialogs don't change.
  Every dialog passes only a width through `cardStyle` (600px: NewParty, JoinParty,
  ConfirmPartyDelete; 700px: ConfirmPartyClose, ConfirmPartyLeave; 800px: MyProfile).
  Keep those widths (layout stays); replace `cardStyle` with a `size="sm" | "md" | "lg"`
  prop for them.
- Behaviour to keep:
  - Always open (route-driven). `Dialog.Root open` with Esc and outside-click
    dismissal **off**, as today (`closeOnEsc={false} closeOnBlur={false}`).
  - framer-motion scale/fade on open. Either:
    a) use Base UI's `data-starting-style` / `data-ending-style` CSS transitions and
       drop framer-motion from this component (simplest), or
    b) render `motion.div` through Base UI's `render` prop on Backdrop/Popup.
    Recommendation: (a). The exit animation never plays today anyway, because the
    route unmounts the dialog.
  - Header with title and the close link; body; footer with the dismiss button and `action`.
  - Wraps content in our React Hook Form `<Form>` (from 4.2): the `form` prop, or an
    empty form.
- Gains: focus trap, `aria-labelledby`, scroll lock.
- Replace `dialog.scss` (207 lines) **in this PR, including the per-dialog styles**
  (`.party-box`, `.confirm-party-*`, `.congratz-box`, `.profile-box`). They target
  Bulma's dialog markup (`.party-box .modal-card .modal-card-head` in `dialog.scss`,
  `.modal-card-body` in `profile.scss`), so they stop matching the moment the new dialog
  lands. Keep only what the artwork needs, in `src/styles/components/*.css`.
- Test each dialog (NewParty form then congratz, JoinParty, ConfirmPartyClose / Delete /
  Leave, MyProfile) at all three widths, with keyboard only, and with worst-case data.

### 4.4 Tabs (MyProfile)
- These tabs are router links, not panels, so they're navigation: a styled `<nav>` with
  `<Link>`s and `aria-current="page"` on the active one. (A Base UI `Tabs` list of links
  would announce tab panels that don't exist.) Style it like the spec's tabs.
- Rewrite `Tab.tsx` on that (it already computes `active` from the route).

### 4.5 Small pieces
- `Divider.tsx` → shadcn `Separator` plus a label in the middle (horizontal and vertical,
  with an `inverted` variant). Remove `bulma-divider` and `divider.scss`.
- `GnomeSays.tsx` → plain `<div>`; move `.message-body` rules from `gnome.scss`.
- `GrinchBox.tsx` → shadcn `Card` + `prose`.

Checks after Phase 4: no imports of `Button`, `Form`, `Modal`, `Tabs`, `Card` or
`Message` from `src/components/bulma`; no imports from `formik` or `yup`; every control
on the UI kit page follows the spec; every form passes the 4.2 checks.

## Phase 5: Layout and page styles (4–6 days, one PR per area)

Add two small layout components first:

- `src/components/layout/FullPage.tsx`: replaces `Hero size="fullheight"`.
  `min-h-dvh flex flex-col` with `header` / `main (flex-1 flex items-center)` / `footer`
  slots. `dvh` also replaces the mobile-viewport hack in `global.scss`
  (`-webkit-fill-available`). This is a deliberate change: Bulma's hero uses `100vh`,
  which on phones counts the area behind the browser's address bar, so full-height
  screens get slightly shorter on phones (and stop hiding their footers).
- `src/components/layout/Container.tsx`: Bulma's container widths
  (`mx-auto w-full desktop:max-w-[960px] widescreen:max-w-[1152px] fullhd:max-w-[1344px]`).

Then go one area at a time. Each PR keeps the area's layout as in its "before"
screenshot, restyles its controls and text to the spec, keeps artwork (backgrounds,
illustrations, keyframes) in a small `.css` file, and deletes its SCSS:

| PR | Files | SCSS to remove |
|---|---|---|
| 5a Start page | StartPage, Divider | `welcome.scss` (60) |
| 5b Enter / login / join | EnterContainer, LoginBox, JoinBox | `enter.scss` (78), `login.scss` (91) |
| 5c Party | PartyDetails, HostContent, GuestContent, DeletedPartyContent, PartyIsClosedContent, ConfirmParty*, GarageDoor | `party-details.scss` (112), `garage.scss` (8) |
| 5d Profile | MyProfile (512 lines: settings, history, danger zone) | `profile.scss` (282) |
| 5e Misc | AppSpinner, PartyNotFound, 404.astro, GrinchBox, GnomeSays, Footer, AstroFooter, UnsplashCredit | `404.scss`, `grinch-box.scss`, `gnome.scss`, `footer.scss` |
| 5f Knowledge pages | KnowledgePageLayout.astro + 3 markdown pages | `knowledge-page.scss` (70) |

Mapping cheatsheet (keeps the layout; respect each `breakpoint=` prop on `Columns`):

| Bulma | Tailwind |
|---|---|
| `Columns` | `flex flex-col tablet:flex-row gap-6` (Bulma's column gap is 0.75rem per side, so `gap-6`); `breakpoint="desktop"` (PartyDetails) → `desktop:flex-row` |
| `Columns.Column` (no size) | `flex-1 min-w-0`: Bulma columns share the row equally by default |
| `Column size={1}` / `"one-third"` | `basis-1/12` / `basis-1/3 shrink-0` |
| `Column mobile={{ size: … }}` | base class for phones, then `tablet:` override |
| `Content` | `prose prose-invert` (tuned once in `tailwind.css`) |
| `has-text-centered-touch` | `text-center desktop:text-left` |
| `has-text-right-tablet` | `tablet:text-right` |
| `has-text-centered-mobile` | `max-tablet:text-center` |
| `is-hidden-mobile` / `is-hidden-tablet` | `max-tablet:hidden` / `tablet:hidden` |
| `is-size-7` | `text-xs` |
| `has-text-danger` | `text-destructive` |
| `@include mobile { … }` | `max-tablet:…` |

Markdown pages: Astro passes headings, lists and tables to `<slot />` inside `prose`, so
`Content` → `<article class="prose …">` covers them. Check tables and long links on
phones.

Each PR runs the screenshot script on `main` and on the branch and puts the differences
in its description (320, 375 and 1280px, normal and worst-case data). The layout must
match; control and type changes must follow the spec. Anything else is a bug.

## Phase 6: Cleanup (½ day, 1 PR)

1. Delete `src/components/bulma.tsx` (removing the `React.createElement` patch).
2. `npm uninstall bulma bulma-divider react-bulma-components sass prop-types`
   (nothing in `src/` imports `prop-types`).
3. Switch `tailwind.css` to a plain `@import "tailwindcss";` and drop the `bulma`
   layer. If preflight was left out in Phase 3, it turns on here: fix whatever it
   changes (headings, lists, button cursor, `img` display: block) and re-check the UI
   kit page.
4. Delete `global.scss` and move what's left (body font, `.index-page` background) into
   `tailwind.css` `@layer base`. Load Cuprum with `<link rel="preconnect">` + `<link>` in
   `BaseLayout.astro` (the CSP already allows `fonts.googleapis.com` and
   `fonts.gstatic.com`), or self-host it, which lets the CSP drop both hosts.
5. Rename `.scss` → `.css` for any files left, or inline them.
6. Switch imports to `@/` and remove `baseUrl`.
7. Final pass over every Phase 2 screen at all widths with worst-case data, Lighthouse
   check (CSS size should drop: Bulma ~200 KB unminified vs. Tailwind output for what
   we use), no CSP errors.

## Risks and how we handle them

| Risk | Handling |
|---|---|
| Bulma and Tailwind resets clash while both are loaded | Bulma and every existing stylesheet (including the four imported on their own) go in a `bulma` layer above Tailwind's reset and below its utilities, so utilities always win and Bulma beats preflight (Phase 3 step 5). Use `!` utilities only as a last resort |
| Valibot drops fields a schema doesn't declare | Every schema declares every submitted field (JoinBox's `party`); 4.2 checks each form's `onSubmit` values |
| Layout moves by accident while controls are restyled | "Before" screenshots are the layout target; Bulma's breakpoints and container widths are kept as tokens; every PR runs the screenshot script against `main` |
| Old and new colours side by side during the move | Bulma's Sass colour variables point at the new palette from 4.1 |
| Control styling drifts screen by screen | One written spec (Phase 2) and a UI kit page; no arbitrary spacing or colour values outside artwork CSS |
| Breakpoint off-by-one (Bulma 769px vs. Tailwind `md` 768px) | Custom `tablet` / `desktop` breakpoints; never `md:` / `lg:` |
| Long names, emails or lists break a layout | Worst-case test data from Phase 1.4 on every PR; wrap/truncate rules in the spec |
| Frontend and API limits drift apart | One `src/limits.ts` per repo, each pointing at the other; no number literals in schemas |
| Dialog behaviour changes (focus, scroll lock, Esc) | Explicitly disable Esc/outside-click; test keyboard flow on each of the 6 dialogs |
| framer-motion vs. Base UI mounting | Use CSS transitions via Base UI data attributes (Phase 4.3 option a) |
| Form behaviour changes after leaving Formik (when errors show, reinitialising, submit state) | Default `mode: "onTouched"`; `values` instead of `enableReinitialize`; checklist per form in 4.2 |
| Error messages change wording after leaving Yup | Shared message builders that copy Yup's default wording; compare each message by hand |
| Content-Security-Policy blocks something new | Scripts must come from the site or be inline scripts Astro emits (hashed automatically at build); styles may be inline. Tailwind, shadcn and Base UI need nothing else. Check the console for CSP errors on every PR's preview |
| `client:only` React islands and Tailwind class scanning | Tailwind v4 scans `src/` automatically; confirm classes in `.tsx` and `.astro` are picked up in the production build |
| Another session resets the working tree mid-change | Commit each phase on its own branch as soon as it's verified; don't leave work uncommitted in the shared checkout |
| Old `src/...` imports plus new `@/` alias | Both work during migration; one mechanical switch in Phase 6 |

## Estimate

About 12–16 working days in 16–17 PRs:

| Phase | Time | PRs |
|---|---|---|
| 0 npm | ½–1 hour | 1 |
| 1 Size limits and boundaries | 1–1½ days | 2 (frontend, backend) |
| 2 Baseline, screenshot script and design spec | 1½–2 days | 1 (script, fixtures, spec, UI kit page) |
| 3 Tooling | ½–1 day | 1 |
| 4 Shared components | 4–5 days | 4–5 (4.4 and 4.5 can share one) |
| 5 Layout and pages | 4–6 days | 6 |
| 6 Cleanup | ½ day | 1 |

Phases 0–1 are independent of the rest and worth landing first. Phases 3–4 give most of
the technical benefit (no React patch, no Formik, accessible controls); Phase 5 can then
go one area at a time.

## Done when

- No `yarn.lock`; `npm ci && npm run build` passes; Pages builds with npm.
- Every form field and input is bounded by `src/limits.ts`, matching the API; the API caps
  members per party.
- No `bulma`, `react-bulma-components`, `bulma-divider`, `sass`, `formik` or `yup` in
  `package.json`, and no `.scss` files in `src/`.
- `src/components/bulma.tsx` is gone, along with the `React.createElement` patch.
- Every Phase 2 screen keeps its "before" layout and its controls and text follow the
  design spec, at 320, 375 and 1280px, with normal and worst-case data, with no overflow
  and a visible focus state on every control.
- `npm run build` (including `astro check`) passes, and the deployed pages log no CSP errors.
