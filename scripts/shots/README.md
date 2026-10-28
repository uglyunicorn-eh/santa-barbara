# Screenshots (`npm run shots`)

Takes a screenshot of every screen in the app at 320, 375 and 1280px wide, once with normal data and once with the
longest values the API allows, and writes a report of anything that overflows. It's how a styling change
checks that layouts don't move.

```bash
npm run shots                                   # all screens, into .shots/<branch>/
npm run shots -- --only party,profile           # screens whose name contains one of these
npm run shots -- --sets worst --widths 320
npm run shots -- --label before --no-build      # reuse the last build
```

Each run writes to `.shots/<label>/` (git-ignored):

- `normal/` and `worst/`: one PNG per screen and width, e.g. `party-host-375.png`.
- `index.html`: every screenshot on one page, side by side per screen.
- `overflow.md` (and `overflow.json`): screens where something reaches past the page edge or text spills out of its
  box. Only things a person sees are listed (text, images, controls), each by its outermost element.

To compare a branch with `main`, take both runs and diff them:

```bash
npm run shots -- --label main        # on main (or in a worktree of main, then copy its .shots/main here)
npm run shots -- --label my-branch   # on the branch
npm run shots:compare -- main my-branch
npm run shots:compare -- main my-branch --only party,profile
```

`shots:compare` lists every screenshot that changed (changed pixels, or a different page size) in
`.shots/compare-main-vs-my-branch/report.md`, with a diff image per changed screen: changed pixels in red over a
faded copy. It exits with 1 when anything changed.

## How it works

- **No backend.** The site is built into `.shots/build` with `PUBLIC_API_ENDPOINT` pointing at an address that
  doesn't exist; Playwright answers every request to it from `fixtures.mjs` (`answer()` in `shots.mjs`).
- **Signed in without signing in.** Signed-in screens get a `profile` and a `userToken` in `localStorage`, and a
  session key in IndexedDB where the app keeps it (`src/api/dpop.ts`), so their requests carry proofs instead of
  signing out for a lost key. The fake API checks neither. Sign-in links are opaque to the app, so their screens just
  set what `POST /auth/session` answers (`api: { fail, status, code }`).
- **Served like Cloudflare Pages:** a file, a folder's `index.html`, or else the app's `index.html`.
- **Browser:** Playwright's own Chromium if it's installed (`npx playwright install chromium`), otherwise the
  installed Google Chrome.

## Adding a screen or a case

- A screen: add an entry to `SCREENS` in `shots.mjs` (`name`, `path`, `signedIn`, and optionally `act` to click into
  a state, or `api` to change one answer).
- Data: change `fixtures.mjs`. The `worst` set must stay at the API's limits (`src/limits.ts`).
