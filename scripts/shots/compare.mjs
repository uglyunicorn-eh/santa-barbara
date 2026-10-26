// Compares two screenshot runs pixel by pixel and lists every screen that changed.
//
//   npm run shots:compare -- before after        # labels of two runs in .shots/
//   npm run shots:compare -- main my-branch --threshold 0.2
//   npm run shots:compare -- main my-branch --only party,profile   # screens whose name contains one of these
//
// Writes .shots/compare-<a>-vs-<b>/ with a diff image per changed screen (changed pixels in red over a faded copy)
// and a report, report.md. Screens whose sizes differ are listed as changed too: the page grew or shrank.

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { parseArgs } from "node:util";

import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

const ROOT = resolve(import.meta.dirname, "../..");
const { positionals: [a, b], values: args } = parseArgs({
  allowPositionals: true,
  options: { threshold: { type: "string", default: "0.1" }, only: { type: "string" } },
});
const only = args.only?.split(",");
if (!a || !b) {
  console.error("Usage: npm run shots:compare -- <label-a> <label-b>");
  process.exit(2);
}

const dirA = join(ROOT, ".shots", a);
const dirB = join(ROOT, ".shots", b);
const out = join(ROOT, ".shots", `compare-${a}-vs-${b}`);
for (const dir of [dirA, dirB]) {
  if (!existsSync(dir)) throw new Error(`No screenshots in ${dir}: run npm run shots -- --label ${dir === dirA ? a : b}`);
}

const rows = [];
let same = 0;
for (const set of readdirSync(dirA).filter(n => existsSync(join(dirB, n)) && !n.includes("."))) {
  mkdirSync(join(out, set), { recursive: true });
  for (const file of readdirSync(join(dirA, set)).filter(n => n.endsWith(".png") && (!only || only.some(o => n.includes(o))))) {
    const pathB = join(dirB, set, file);
    if (!existsSync(pathB)) {
      rows.push({ set, file, change: `only in ${a}` });
      continue;
    }
    const imgA = PNG.sync.read(readFileSync(join(dirA, set, file)));
    const imgB = PNG.sync.read(readFileSync(pathB));
    if (imgA.width !== imgB.width || imgA.height !== imgB.height) {
      rows.push({ set, file, change: `size ${imgA.width}×${imgA.height} → ${imgB.width}×${imgB.height}` });
      continue;
    }
    const diff = new PNG({ width: imgA.width, height: imgA.height });
    const changed = pixelmatch(imgA.data, imgB.data, diff.data, imgA.width, imgA.height, { threshold: Number(args.threshold) });
    if (changed === 0) {
      same++;
      continue;
    }
    writeFileSync(join(out, set, file), PNG.sync.write(diff));
    const share = (100 * changed) / (imgA.width * imgA.height);
    rows.push({ set, file, change: `${changed} px (${share < 0.01 ? "<0.01" : share.toFixed(2)}%)`, diff: `${set}/${file}` });
  }
}

const lines = [`# Screenshots: ${a} vs ${b}`, "", `${same} unchanged, ${rows.length} changed.`, ""];
if (rows.length) {
  lines.push("| Set | Screen | Change |", "|---|---|---|");
  for (const r of rows) lines.push(`| ${r.set} | ${r.file.replace(/\.png$/, "")} | ${r.diff ? `[${r.change}](${r.diff})` : r.change} |`);
}
writeFileSync(join(out, "report.md"), lines.join("\n") + "\n");
console.log(lines.join("\n"));
console.log(`\nDiff images: ${out}`);
process.exit(rows.length ? 1 : 0);
