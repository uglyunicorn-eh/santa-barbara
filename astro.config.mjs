import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'astro/config';

import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// The API the app calls: production by default, or a backend preview for local work (PUBLIC_API_ENDPOINT).
const { apiEndpoint } = JSON.parse(readFileSync(new URL('./src/config.json', import.meta.url), 'utf8'));
const apiOrigin = new URL(process.env.PUBLIC_API_ENDPOINT || apiEndpoint).origin;
// Live updates are WebSockets to the same host (wss://, or ws:// for a local http preview).
const liveOrigin = apiOrigin.replace(/^http/, 'ws');

const htmlFiles = dir => readdirSync(dir, { withFileTypes: true, recursive: true })
  .filter(entry => entry.isFile() && entry.name.endsWith('.html'))
  .map(entry => join(entry.parentPath, entry.name));

/**
 * Writes the Content-Security-Policy into the built `_headers` (from public/_headers, where `{{CSP}}` stands for it).
 * Scripts may only come from this site, plus the inline scripts Astro puts in the pages, allowed by their hashes,
 * which are taken from the built pages on every build, and Cloudflare Web Analytics, which Pages adds to every page. Live updates connect to the API's host over wss. Inline styles are allowed: the toast library writes its
 * styles at runtime, which can't be hashed ahead of time.
 */
const contentSecurityPolicy = {
  name: 'content-security-policy',
  hooks: {
    'astro:build:done': ({ dir }) => {
      const out = fileURLToPath(dir);
      const hashes = new Set();
      for (const file of htmlFiles(out)) {
        for (const [, code] of readFileSync(file, 'utf8').matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)) {
          hashes.add(`'sha256-${createHash('sha256').update(code).digest('base64')}'`);
        }
      }
      const policy = [
        "default-src 'self'",
        `script-src 'self' https://static.cloudflareinsights.com ${[...hashes].sort().join(' ')}`,
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data:",
        `connect-src 'self' ${apiOrigin} ${liveOrigin} https://cloudflareinsights.com`,
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "object-src 'none'",
      ].join('; ');
      const headers = join(out, '_headers');
      writeFileSync(headers, readFileSync(headers, 'utf8').replace('{{CSP}}', policy));
    },
  },
};

/**
 * The UI kit (docs/ui-kit.md): every control in every state on the app's surfaces,
 * at /ui-kit. Only in `npm run dev`: the page lives outside src/pages/, so a production build never emits it.
 */
const uiKit = {
  name: 'ui-kit',
  hooks: {
    'astro:config:setup': ({ command, injectRoute }) => {
      if (command === 'dev') {
        injectRoute({ pattern: '/ui-kit', entrypoint: './src/dev/ui-kit.astro' });
      }
    },
  },
};

/**
 * The rules in public/_redirects, in `npm run dev` too: Cloudflare Pages follows them in production, the dev server
 * doesn't know them, so /enter/, /profile/ and the other app paths would be a 404 there. A 200 serves the target and
 * keeps the address; any other status redirects. As on Pages, `*` matches anything, nothing included, and `:name`
 * one path segment.
 */
const devRedirects = {
  name: 'dev-redirects',
  hooks: {
    'astro:server:setup': ({ server }) => {
      const rules = readFileSync(new URL('./public/_redirects', import.meta.url), 'utf8')
        .split('\n')
        .map(line => line.replace(/#.*/, '').trim())
        .filter(Boolean)
        .map(line => {
          const [from, to, status = '302'] = line.split(/\s+/);
          const pattern = from
            .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
            .replace(/\*/g, '.*')
            .replace(/:\w+/g, '[^/]+');
          return { from: new RegExp(`^${pattern}$`), to, status: Number(status) };
        });

      server.middlewares.use((req, res, next) => {
        const url = new URL(req.url ?? '/', 'http://localhost');
        const rule = rules.find(({ from }) => from.test(url.pathname));
        if (!rule) {
          return next();
        }
        if (rule.status === 200) {
          req.url = rule.to + url.search;
          return next();
        }
        res.writeHead(rule.status, { Location: rule.to + url.search }).end();
      });
    },
  },
};

// https://astro.build/config
export default defineConfig({
  site: "https://gnomik.me",
  integrations: [
    react(),
    contentSecurityPolicy,
    uiKit,
    devRedirects,
  ],
  devToolbar: {
    enabled: false,
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
