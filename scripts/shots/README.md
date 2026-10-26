# Screenshots (`npm run shots`)

Takes a screenshot of every screen in the app at 320, 375 and 1280px wide, once with normal data and once with the
longest values the API allows, and writes a report of anything that overflows. It's how the Bulma → Tailwind
migration checks that layouts don't move (see `docs/tailwind-migration-plan.md`, Phase 2).

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

To compare a branch with `main`, run it on both (`--label main`, then on the branch) and open the two `index.html`
files side by side.

## How it works

- **No backend.** The site is built into `.shots/build` with `PUBLIC_API_ENDPOINT` pointing at an address that
  doesn't exist; Playwright answers every request to it from `fixtures.mjs` (`answer()` in `shots.mjs`).
- **Signed in without signing in.** Signed-in screens get a `profile` and a `userToken` in `localStorage`; nothing on
  screen checks the token. The sign-in link page (`/enter/:token`) does check its token's signature, so the build
  gets a throwaway key pair (`PUBLIC_JWT_PUBLIC_KEY`) and the script signs those links itself.
- **Served like Cloudflare Pages:** a file, a folder's `index.html`, or else the app's `index.html`.
- **Browser:** Playwright's own Chromium if it's installed (`npx playwright install chromium`), otherwise the
  installed Google Chrome.

## Adding a screen or a case

- A screen: add an entry to `SCREENS` in `shots.mjs` (`name`, `path`, `signedIn`, and optionally `act` to click into
  a state, or `api` to change one answer).
- Data: change `fixtures.mjs`. The `worst` set must stay at the API's limits (`src/limits.ts`).
