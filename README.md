![grinch](https://github.com/uglyunicorn-eh/santa-barbara/assets/137888/89dacf13-f6f2-49ea-b609-31572e66c4e7)

# Anonymous Ded Morozes

A Secret Santa gift exchange for friends, families and offices (*Ded Moroz* is the Slavic Santa).
Live at **[gnomik.me](https://gnomik.me)**.

## How it works

1. **Sign in** with your email address. No passwords: we send you a magic link.
2. **Host a party** and share its code with friends, or **join** one with the code a friend gave you.
3. Everyone who joins shows up on the party page. Until the dice are rolled, people can still leave.
4. **The host rolls the dice.** Everyone gets one name: the person they give a gift to.
5. Nobody sees anyone else's name, so everyone stays an anonymous Ded Moroz.

No marketing emails, and no sharing your data with anyone.

## What's in here

This repository is the website. The API lives in [santa-monica](https://github.com/uglyunicorn-eh/santa-monica).

- **[Astro](https://astro.build)** builds a static site: the knowledge pages (how it works, privacy, terms) and a
  React app for everything else (React Router; forms on React Hook Form, validated with Valibot).
- **[Tailwind CSS](https://tailwindcss.com)** v4 and **[Base UI](https://base-ui.com)** components, in the
  [shadcn](https://ui.shadcn.com) style: buttons, inputs, dialogs and menus in `src/components/ui/`. The rules they
  follow (colours, which button where, focus, forms) are in [`docs/ui-kit.md`](docs/ui-kit.md).
- **The API client** (`src/api/client.ts`) talks to the API's JSON routes. Every write is safe to repeat: each action
  sends an `Idempotency-Key`, and failed requests are retried once.
- **Sign-in tokens** are JWTs signed by the API (ES256) and checked in the browser against the public key in
  `src/config.json`.
- **Hosting:** Cloudflare Pages, with a Content-Security-Policy in `public/_headers` that the build completes.

```text
src/
  components/   the app: pages, dialogs, forms (ui/ holds the shared controls)
  pages/        Astro routes and the knowledge pages (Markdown)
  styles/       Tailwind setup and each screen's own styles
  dev/          the UI kit page (dev only)
scripts/shots/  screenshots of every screen, for checking layout changes
```

## Development

Needs Node.js 22.23.4 or newer (see `.node-version`).

```bash
npm install
```

```bash
npm run dev
```

The app is at <http://localhost:4321>, and the UI kit (every control in every state) at
<http://localhost:4321/ui-kit>.

```bash
npm run build
```

Type-checks and builds the site into `dist/`.

```bash
npm run shots
```

Screenshots every screen at phone and desktop widths, with normal data and the longest values the API allows, and
reports anything that overflows. `npm run shots:compare -- <before> <after>` diffs two runs. See
[`scripts/shots/README.md`](scripts/shots/README.md).

### Against an API preview

Point the app at a preview of the API and give it that preview's public key (previews sign tokens with their own).
Emailed links then open `http://localhost:4321`:

```bash
PUBLIC_API_ENDPOINT=https://<preview>.workers.dev PUBLIC_JWT_PUBLIC_KEY="$(cat preview-public-key.pem)" npm run dev
```

## License

MIT, see [LICENSE](LICENSE).
