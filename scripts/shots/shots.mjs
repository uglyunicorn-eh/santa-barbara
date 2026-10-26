// Screenshots of every screen, at phone and desktop widths, with normal and worst-case data, plus a report of
// anything that overflows the page. The API is faked from fixtures.mjs, so no backend or sign-in is needed.
//
//   npm run shots                         # everything, into .shots/<branch>/
//   npm run shots -- --only party,profile # screens whose name contains one of these
//   npm run shots -- --sets worst --widths 320
//   npm run shots -- --label before --no-build
//
// The site is built into .shots/build with a throwaway signing key (so sign-in links can be signed here) and an API
// address the browser never reaches: every request to it is answered by `answer()` below.

import { execFileSync, spawnSync } from "node:child_process";
import { createReadStream, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, resolve } from "node:path";
import { parseArgs } from "node:util";

import * as jose from "jose";
import { chromium } from "playwright";

import { CODES, SETS } from "./fixtures.mjs";

const ROOT = resolve(import.meta.dirname, "../..");
const API = "http://api.shots.test";
const ISSUER = "api.gnomik.me";

const { values: args } = parseArgs({
  options: {
    only: { type: "string" },
    sets: { type: "string", default: Object.keys(SETS).join(",") },
    widths: { type: "string", default: "320,375,1280" },
    label: { type: "string" },
    "no-build": { type: "boolean", default: false },
  },
});

const label = args.label ?? gitBranch();
const outDir = join(ROOT, ".shots", label.replace(/[^\w.-]+/g, "-"));
const buildDir = join(ROOT, ".shots", "build");
const widths = args.widths.split(",").map(Number);
const sets = args.sets.split(",");
const only = args.only?.split(",");

// ---------------------------------------------------------------------------------------------------------------
// Screens. `signedIn` puts a profile in localStorage; `path` may be a function of the signing helpers; `act` runs
// after the page settles (to open a state that needs a click); `api` overrides answers for this screen.

const SCREENS = [
  // Signed out
  { name: "login", path: "/" },
  { name: "login-email-form", path: "/enter/" },
  { name: "login-closed-again", path: "/", act: openAndCloseSignIn },
  { name: "enter-link-expired", path: async ({ token }) => `/enter/link#${await token({ email: "$email" }, -3600)}` },
  { name: "enter-link-invalid", path: "/enter/not-a-real-link" },
  { name: "party-signed-out", path: `/p/${CODES.guestOpen}/`, signedIn: false, api: { partyFor: CODES.notJoined } },
  { name: "link-delete", path: "/profile/delete#some-token" },
  { name: "link-delete-used", path: "/profile/delete#some-token", api: { fail: "/me/deletion/check" } },
  { name: "link-delete-ok", path: "/profile/delete#some-token", act: confirmDeletion },
  { name: "link-delete-failed", path: "/profile/delete/some-token", api: { fail: "/me/deletion/confirm" }, act: confirmDeletion },
  { name: "link-email-ok", path: "/profile/email#some-token" },
  { name: "link-email-failed", path: "/profile/email/some-token", api: { fail: "/me/email-change/confirm" } },
  { name: "link-email-cancel-ok", path: "/profile/email/cancel#some-token" },
  { name: "how-it-works", path: "/how-it-works/" },
  { name: "privacy", path: "/privacy/" },
  { name: "terms", path: "/terms/" },
  { name: "not-found-page", path: "/404.html" },

  // Signed in
  { name: "start", path: "/", signedIn: true },
  { name: "start-rolled", path: "/", signedIn: true, unrevealed: true },
  { name: "rolled-dialog", path: `/rolled/${CODES.closed}`, signedIn: true },
  { name: "new-party", path: "/new/", signedIn: true },
  { name: "new-party-created", path: "/new/", signedIn: true, act: submitForm },
  { name: "new-party-code-copied", path: "/new/", signedIn: true, act: copyNewCode },
  { name: "join-by-code", path: "/join/", signedIn: true },
  { name: "join-by-code-invalid", path: "/join/", signedIn: true, act: typeInvalidCode },
  { name: "party-host", path: `/p/${CODES.hostOpen}/`, signedIn: true },
  { name: "party-guest", path: `/p/${CODES.guestOpen}/`, signedIn: true },
  { name: "party-closed", path: `/p/${CODES.closed}/`, signedIn: true },
  { name: "party-rolled-letter", path: `/p/${CODES.closed}/rolled`, signedIn: true },
  { name: "party-profile-history", path: `/p/${CODES.closed}/profile/history/`, signedIn: true, unrevealed: true },
  { name: "party-closed-revealed", path: `/p/${CODES.closed}/`, signedIn: true, act: clickButton("Yes, please!") },
  { name: "party-deleted", path: `/p/${CODES.deleted}/`, signedIn: true },
  { name: "party-join", path: `/p/${CODES.notJoined}/`, signedIn: true },
  { name: "party-join-protected", path: `/p/${CODES.protectedNotJoined}/`, signedIn: true },
  { name: "party-not-found", path: `/p/${CODES.missing}/`, signedIn: true },
  { name: "party-loading", path: `/p/${CODES.slow}/`, signedIn: true, settle: 400 },
  { name: "dialog-close-party", path: `/p/${CODES.hostOpen}/confirm`, signedIn: true },
  { name: "dialog-invite", path: `/p/${CODES.hostOpen}/invite`, signedIn: true, act: typeEmails },
  { name: "dialog-delete-party", path: `/p/${CODES.hostOpen}/delete`, signedIn: true },
  { name: "dialog-leave-party", path: `/p/${CODES.guestOpen}/leave`, signedIn: true },
  { name: "profile", path: "/profile/", signedIn: true },
  { name: "profile-email-change", path: "/profile/", signedIn: true, act: clickButton("Change") },
  { name: "profile-history", path: "/profile/history/", signedIn: true },
  { name: "party-host-menu", path: `/p/${CODES.hostOpen}/`, signedIn: true, act: openMenu("More actions") },
  { name: "footer-menu", path: "/", act: openMenu("More links") },
];

/** Opens the ☰ menu with this label, when it's on screen (the footer's shows on phones only). */
function openMenu(label) {
  return async (page) => {
    const trigger = page.getByRole("button", { name: label });
    if (await trigger.isVisible()) {
      await trigger.click();
      await page.waitForTimeout(400);
    }
  };
}

/** Creates the party, then clicks its code sticker (which copies the party's link, with a toast). */
async function copyNewCode(page) {
  await submitForm(page);
  await page.locator(".code-sticker").click();
  await page.waitForTimeout(500);
}

/** Types a code that can't be one and leaves the field, so its error shows (in place of the help text). */
async function typeInvalidCode(page) {
  const input = page.locator("form input").first();
  await input.fill("AFGSDFG");
  await input.blur();
  await page.waitForTimeout(300);
}

/** Opens the sign-in dialog from the front door and closes it again: the button must be ready, not spinning. */
async function openAndCloseSignIn(page) {
  await page.getByRole("button", { name: "Enter with your email address" }).click();
  await page.waitForTimeout(1200);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(600);
}

/** Clicks the button whose name contains this text, and waits for what it opens. */
function clickButton(label) {
  return async (page) => {
    await page.getByRole("button", { name: label }).first().click();
    await page.waitForTimeout(600);
  };
}

/** Types a few addresses (one of them wrong) into the invite dialog's email tags. */
async function typeEmails(page) {
  const input = page.locator('input[type="email"]');
  await input.fill("bob@example.com, carol@example.com not-an-email dave.with.a.long.address@example.com");
  await input.press("Enter");
  await page.waitForTimeout(300);
}

/** Types "delete" and confirms, on the account deletion page. */
async function confirmDeletion(page) {
  await page.locator("form input").fill("delete");
  await page.getByRole("button", { name: "Delete my account" }).click();
  await page.waitForTimeout(1200);
}

async function submitForm(page) {
  await page.locator('form [type="submit"]').first().click();
  await page.waitForTimeout(1200);
}

// ---------------------------------------------------------------------------------------------------------------
// The fake API.

function answer(set, screen, method, url, body) {
  const path = url.pathname.replace(/^\/v1/, "");
  const ok = (data, status = 200) => ({ status, body: data });
  const failure = (status, code, message, field) => ({ status, body: { error: { code, message, ...(field ? { field } : {}) } } });

  if (screen.api?.fail === path) {
    return failure(409, "link_used", "This link has already been used. Please ask for a new one.");
  }
  const session = { user: set.user, userToken: "shots-session-token" };

  switch (`${method} ${path}`) {
    case "GET /me":
    case "PATCH /me":
      return ok(set.user);
    case "GET /parties": {
      const code = screen.api?.partyFor ?? url.searchParams.get("code");
      if (code === CODES.slow) {
        return null; // never answers: the loading spinner stays up
      }
      const party = set.parties[code];
      return party ? ok(party) : failure(404, "not_found", "Party does not exist.");
    }
    case "GET /me/parties": {
      const first = Number(url.searchParams.get("first") ?? 10);
      const after = Number(url.searchParams.get("after") ?? 0);
      const items = set.history.slice(after, after + first);
      const next = after + items.length;
      return ok({ items, hasMore: next < set.history.length, endCursor: items.length ? String(next) : null });
    }
    case "POST /parties":
      return ok({ ...set.parties[CODES.hostOpen], name: body?.name ?? set.parties[CODES.hostOpen].name, participantCount: 1, participants: [set.user.name] }, 201);
    case "POST /parties/join":
    case "POST /parties/leave":
    case "POST /parties/draw":
    case "POST /parties/delete":
    case "POST /parties/restore":
      return ok(set.parties[body?.code] ?? set.parties[CODES.guestOpen]);
    case "POST /parties/invite":
      return ok({ invited: body?.emails ?? [], alreadyInvited: [], alreadyJoined: [], invitesLeft: 40 });
    case "POST /auth/magic-link":
    case "POST /me/deletion":
    case "POST /me/email-change":
    case "GET /me/parties/unrevealed":
      return ok({ items: screen.unrevealed ? [{ code: CODES.closed, name: set.closedName ?? "Office Secret Santa 2026", closedAt: new Date().toISOString() }] : [] });
    case "POST /me/parties/revealed":
      return ok({ ok: true });
    case "POST /live/ticket":
      return ok({ ticket: "shots-live-ticket" });
    case "POST /me/deletion/check":
      return ok({ email: set.user.email });
    case "POST /me/deletion/confirm":
    case "POST /me/email-change/cancel":
      return ok({});
    case "POST /auth/session":
    case "POST /me/email-change/confirm":
      return ok(session);
    default:
      return failure(404, "not_found", `The fake API has no answer for ${method} ${path}.`);
  }
}

// ---------------------------------------------------------------------------------------------------------------
// Overflow check, run in the page: anything wider than the viewport, and text that spills out of its own box.

function findOverflow() {
  const vw = document.documentElement.clientWidth;
  const describe = (el) => {
    const cls = typeof el.className === "string" && el.className.trim() ? `.${el.className.trim().split(/\s+/).join(".")}` : "";
    const text = (el.innerText || el.value || "").replace(/\s+/g, " ").trim().slice(0, 40);
    return `${el.tagName.toLowerCase()}${cls}${text ? ` "${text}"` : ""}`;
  };
  // Something a person sees: its own text, or an image or control. Layout boxes (Bulma's columns stick out by their
  // negative margins on purpose) only count through what they contain.
  const content = (el) => ["img", "input", "button", "textarea", "select", "video"].includes(el.tagName.toLowerCase())
    || [...el.childNodes].some(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
  const visible = (el) => {
    const style = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return style.visibility !== "hidden" && style.display !== "none" && r.width > 0 && r.height > 0;
  };
  const clipped = (el) => {
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const { overflowX } = getComputedStyle(p);
      if (overflowX !== "visible") {
        const pr = p.getBoundingClientRect();
        if (pr.right <= vw + 1) return true;
      }
    }
    return false;
  };
  const found = [];
  const flagged = new Set();
  const insideFlagged = (el) => { for (let p = el.parentElement; p; p = p.parentElement) if (flagged.has(p)) return true; return false; };
  for (const el of document.body.querySelectorAll("*")) {
    if (!visible(el) || ["svg", "path", "canvas"].includes(el.tagName.toLowerCase())) continue;
    const r = el.getBoundingClientRect();
    const past = Math.round(r.right - vw);
    // Elements come in document order, so a flagged parent is always seen first: list only the outermost offender.
    if (insideFlagged(el)) continue;
    if (past > 1 && content(el) && getComputedStyle(el).position !== "fixed" && !clipped(el)) {
      flagged.add(el);
      found.push({ kind: "past the page edge", by: past, element: describe(el) });
      continue;
    }
    const spill = el.scrollWidth - el.clientWidth;
    if (spill > 1 && el.children.length === 0 && getComputedStyle(el).overflowX === "visible") {
      flagged.add(el);
      found.push({ kind: "text spills out of its box", by: spill, element: describe(el) });
    }
  }
  return found.sort((a, b) => b.by - a.by).slice(0, 8);
}

// ---------------------------------------------------------------------------------------------------------------

async function main() {
  const { publicKey, privateKey } = await jose.generateKeyPair("ES256", { extractable: true });
  const publicPem = await jose.exportSPKI(publicKey);

  if (!args["no-build"]) {
    console.log("Building the site with a test signing key…");
    rmSync(buildDir, { recursive: true, force: true });
    const built = spawnSync("npx", ["astro", "build", "--outDir", buildDir], {
      cwd: ROOT,
      encoding: "utf8",
      env: { ...process.env, PUBLIC_API_ENDPOINT: API, PUBLIC_JWT_PUBLIC_KEY: publicPem },
    });
    if (built.status !== 0) {
      console.error(built.stdout, built.stderr);
      throw new Error("astro build failed");
    }
    writeFileSync(join(buildDir, ".key.json"), JSON.stringify(await jose.exportJWK(privateKey)));
  } else if (!existsSync(join(buildDir, ".key.json"))) {
    throw new Error("--no-build needs an earlier build in .shots/build");
  }
  const signingKey = await jose.importJWK(JSON.parse(readFileSync(join(buildDir, ".key.json"), "utf8")), "ES256");

  const server = await serve(buildDir);
  const site = `http://127.0.0.1:${server.address().port}`;
  const browser = await launch();
  const report = [];
  mkdirSync(outDir, { recursive: true });

  try {
    for (const setName of sets) {
      const set = SETS[setName];
      if (!set) throw new Error(`Unknown set "${setName}"`);
      // A sign-in link token as the API would sign it; "$email" stands for this set's address.
      const token = (payload, expiresIn = 3600) => {
        const now = Math.floor(Date.now() / 1000);
        const claims = Object.fromEntries(Object.entries(payload).map(([k, v]) => [k, v === "$email" ? set.user.email : v]));
        return new jose.SignJWT(claims).setProtectedHeader({ alg: "ES256", typ: "JWT", t: "EnterRequest" }).setIssuer(ISSUER)
          .setIssuedAt(now - 7200).setExpirationTime(now + expiresIn).sign(signingKey);
      };

      for (const screen of SCREENS) {
        if (only && !only.some(o => screen.name.includes(o))) continue;
        const path = typeof screen.path === "function" ? await screen.path({ token }) : screen.path;

        for (const width of widths) {
          const context = await browser.newContext({ viewport: { width, height: width < 768 ? 740 : 900 }, deviceScaleFactor: 1 });
          if (screen.signedIn) {
            await context.addInitScript(([profile]) => {
              localStorage.setItem("profile", JSON.stringify(profile));
              localStorage.setItem("userToken", JSON.stringify("shots-session-token"));
            }, [set.user]);
          }
          await context.route(`${API}/**`, async (route) => {
            const request = route.request();
            const cors = { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "*" };
            if (request.method() === "OPTIONS") {
              await route.fulfill({ status: 204, headers: cors });
              return;
            }
            let body;
            try { body = request.postDataJSON(); } catch { body = undefined; }
            const reply = answer(set, screen, request.method(), new URL(request.url()), body);
            if (reply === null) return; // leave it hanging
            await route.fulfill({ status: reply.status, contentType: "application/json", headers: cors, body: JSON.stringify(reply.body) });
          });

          // Live-updates sockets connect and stay quiet, unless the screen plays a server (`live`).
          await context.routeWebSocket(/\/v1\/(parties|me)\/live/, ws => screen.live?.(ws));

          const page = await context.newPage();
          await page.goto(site + path, { waitUntil: screen.settle ? "domcontentloaded" : "networkidle" });
          await page.waitForTimeout(screen.settle ?? 1300); // garage door and dialog animations
          if (screen.act) await screen.act(page);

          const file = join(outDir, setName, `${screen.name}-${width}.png`);
          mkdirSync(join(outDir, setName), { recursive: true });
          await page.screenshot({ path: file, fullPage: true });
          const overflow = await page.evaluate(findOverflow);
          if (overflow.length) report.push({ set: setName, screen: screen.name, width, overflow });
          await context.close();
        }
        process.stdout.write(".");
      }
    }
  } finally {
    await browser.close();
    server.close();
  }

  writeReport(report);
  console.log(`\nScreenshots and report: ${outDir}`);
}

function writeReport(report) {
  const lines = [`# Overflow report: ${label}`, "", `Screens with anything wider than the page, or text spilling out of its box.`, ""];
  if (!report.length) lines.push("Nothing overflows.");
  for (const { set, screen, width, overflow } of report) {
    lines.push(`## ${screen} · ${set} · ${width}px`, "");
    for (const o of overflow) lines.push(`- ${o.kind} by ${o.by}px: \`${o.element}\``);
    lines.push("");
  }
  writeFileSync(join(outDir, "overflow.md"), lines.join("\n"));
  writeFileSync(join(outDir, "overflow.json"), JSON.stringify(report, null, 2));

  const gallery = [`<!doctype html><meta charset="utf-8"><title>Shots: ${label}</title>`,
    `<style>body{font:14px system-ui;margin:16px;background:#f4f4f5}h2{margin:24px 0 8px}div{display:flex;gap:12px;align-items:flex-start;overflow-x:auto}figure{margin:0}img{border:1px solid #ccc;background:#fff;max-height:600px}</style>`];
  for (const setName of sets) {
    gallery.push(`<h1>${setName}</h1>`);
    for (const screen of SCREENS) {
      if (only && !only.some(o => screen.name.includes(o))) continue;
      gallery.push(`<h2>${screen.name}</h2><div>`);
      for (const width of widths) gallery.push(`<figure><img src="${setName}/${screen.name}-${width}.png" loading="lazy"><figcaption>${width}px</figcaption></figure>`);
      gallery.push("</div>");
    }
  }
  writeFileSync(join(outDir, "index.html"), gallery.join("\n"));
}

function serve(dir) {
  const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".json": "application/json", ".woff2": "font/woff2" };
  const file = (p) => existsSync(p) && statSync(p).isFile() ? p : null;
  const server = createServer((req, res) => {
    const url = new URL(req.url, "http://x");
    const p = join(dir, decodeURIComponent(url.pathname));
    // Like Cloudflare Pages: a file, a folder's index.html, or else the app's index.html (client-side routes).
    const found = file(p) ?? file(join(p, "index.html")) ?? file(`${p}.html`) ?? join(dir, "index.html");
    res.writeHead(200, { "content-type": types[extname(found)] ?? "application/octet-stream" });
    createReadStream(found).pipe(res);
  });
  return new Promise((ok) => server.listen(0, "127.0.0.1", () => ok(server)));
}

async function launch() {
  try {
    return await chromium.launch();
  } catch {
    // Playwright's own Chromium isn't installed (`npx playwright install chromium`); use the installed Chrome.
    return await chromium.launch({ channel: "chrome" });
  }
}

function gitBranch() {
  try {
    return execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], { cwd: ROOT, encoding: "utf8" }).trim();
  } catch {
    return "local";
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
