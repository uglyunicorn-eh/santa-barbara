import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'astro/config';

import react from "@astrojs/react";

// The API the app calls: production by default, or a backend preview for local work (PUBLIC_API_ENDPOINT).
const { apiEndpoint } = JSON.parse(readFileSync(new URL('./src/config.json', import.meta.url), 'utf8'));
const apiOrigin = new URL(process.env.PUBLIC_API_ENDPOINT || apiEndpoint).origin;

const htmlFiles = dir => readdirSync(dir, { withFileTypes: true, recursive: true })
  .filter(entry => entry.isFile() && entry.name.endsWith('.html'))
  .map(entry => join(entry.parentPath, entry.name));

/**
 * Writes the Content-Security-Policy into the built `_headers` (from public/_headers, where `{{CSP}}` stands for it).
 * Scripts may only come from this site, plus the inline scripts Astro puts in the pages, allowed by their hashes,
 * which are taken from the built pages on every build, and Cloudflare Web Analytics, which Pages adds to every page. Inline styles are allowed: the toast library writes its
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
        `connect-src 'self' ${apiOrigin} https://cloudflareinsights.com`,
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

// https://astro.build/config
export default defineConfig({
  site: "https://gnomik.me",
  integrations: [
    react(),
    contentSecurityPolicy,
  ],
  devToolbar: {
    enabled: false,
  },
});
