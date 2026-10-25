![grinch](https://github.com/uglyunicorn-eh/santa-barbara/assets/137888/89dacf13-f6f2-49ea-b609-31572e66c4e7)

# Anonymous Ded Morozes

A web app for organising a **Secret Santa** gift exchange (*Ded Moroz* is the Slavic Santa). Live at [gnomik.me](https://gnomik.me).

## How it works

1. **Sign in** with just your email address: no passwords, the app sends you a magic link.
2. **Host a party** and share its secret code with friends, or **join** a friend's party with the code they gave you.
3. Everyone who joined shows up in the party's participant list. Until the host starts the draw, people can still leave.
4. The host rolls the dice. Every participant is randomly assigned another participant to give a gift to, and nobody can join after that.
5. Each person sees only who *they* give a gift to, so everyone stays an anonymous Ded Moroz.

The app promises no marketing emails and no sharing of personal data with third parties.

## Tech

This repository is the front end ("Front Yard"): an [Astro](https://astro.build) site with a React single-page app (React Router, Formik, Bulma via `react-bulma-components`) that talks to the API's JSON routes (`/v1/...`) through a small `fetch` client, `src/api/client.ts`. Auth tokens are JWTs signed by the API (ES256) and verified in the browser against the public key in `src/config.json`. The API lives in the "Backyard" repository.

Every write is safe to repeat: the client sends an `Idempotency-Key` for each user action (the same one when it retries, and the same one when an emailed-link page is reloaded in its tab), and retries once after a network error or a server error.

Components from `react-bulma-components` are imported through `src/components/bulma.tsx`, which restores the default props React 19 no longer applies.

## Development

Requires Node.js 22.23.4 or newer (see `.node-version`).

```bash
npm install
npm run dev     # local dev server
npm run build   # type-check and production build
```

To run against a backend preview instead of production, point the client at it and give it the preview's public key (the preview signs tokens with its own key). Its emailed links open `http://localhost:4321`:

```bash
PUBLIC_API_ENDPOINT=https://<preview>.workers.dev \
PUBLIC_JWT_PUBLIC_KEY="$(cat preview-public-key.pem)" \
npm run dev
```

## Links

* [Front Yard](https://github.com/uglyunicorn-eh/santa-barbara)
* [Backyard](https://github.com/uglyunicorn-eh/santa-monica)
