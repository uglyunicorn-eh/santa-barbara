// Renders the link preview card (og-image.html) into public/og-image.png: `node scripts/og/render.mjs`.
// It's saved as a palette PNG to stay small: WhatsApp tends to drop preview images over ~300 KB.

import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import sharp from "sharp";

const html = new URL("./og-image.html", import.meta.url);
const out = fileURLToPath(new URL("../../public/og-image.png", import.meta.url));

// Playwright's own Chromium, or the installed Chrome when that hasn't been downloaded (as in scripts/shots).
const browser = await chromium.launch().catch(() => chromium.launch({ channel: "chrome" }));
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto(html.href);
await page.evaluate(() => document.fonts.ready);
const shot = await page.screenshot({ type: "png" });
await browser.close();

const info = await sharp(shot).png({ palette: true, quality: 90, effort: 10, compressionLevel: 9 }).toFile(out);
console.log(`${out}: ${info.width}x${info.height}, ${Math.round(info.size / 1024)} KB`);
