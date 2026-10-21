import fs from "node:fs";
import path from "node:path";
import { gzipSync } from "node:zlib";

const root = "dist";
const manifest = JSON.parse(
  fs.readFileSync(path.join(root, ".vite/manifest.json"), "utf8"),
);
const info = (key) => {
  const row = manifest[key];
  const bytes = fs.readFileSync(path.join(root, row.file));
  return {
    source: key,
    file: row.file,
    bytes: bytes.length,
    gzipBytes: gzipSync(bytes).length,
    imports: row.imports || [],
    dynamicImports: row.dynamicImports || [],
    isEntry: !!row.isEntry,
    isDynamicEntry: !!row.isDynamicEntry,
  };
};
const chunks = Object.keys(manifest)
  .filter((key) => manifest[key].file.endsWith(".js"))
  .map(info);
const entry = chunks.find((item) => item.isEntry);
if (!entry) throw new Error("Build manifest has no JavaScript entry");
function staticGraph(key, seen = new Set()) {
  if (seen.has(key)) return seen;
  seen.add(key);
  for (const dependency of manifest[key].imports || [])
    staticGraph(dependency, seen);
  return seen;
}
const startupKeys = new Set([
  ...staticGraph(entry.source),
  ...staticGraph("src/features/tours/pages/HomePage.tsx"),
]);
const startup = chunks.filter((chunk) => startupKeys.has(chunk.source));
const report = {
  generatedAt: new Date().toISOString(),
  viteVersion: JSON.parse(
    fs.readFileSync("node_modules/vite/package.json", "utf8"),
  ).version,
  method:
    "Vite manifest; sum unique static dependencies for entry + home. gzip is calculated per file, not a network measurement.",
  baseline: {
    mainJsBytes: 314260,
    gzipBytes: 98040,
    source:
      "Previous modularization build log, rounded to 0.01 kB; no route splitting",
  },
  initialHome: {
    bytes: startup.reduce((sum, item) => sum + item.bytes, 0),
    gzipBytes: startup.reduce((sum, item) => sum + item.gzipBytes, 0),
    files: startup.map((item) => item.file),
  },
  routeChunkCount: chunks.filter((item) => item.isDynamicEntry).length,
  chunks,
};
fs.mkdirSync("docs/evidence", { recursive: true });
fs.writeFileSync(
  "docs/evidence/bundle-report.json",
  JSON.stringify(report, null, 2),
);
console.log(
  JSON.stringify(
    {
      routeChunkCount: report.routeChunkCount,
      initialHome: report.initialHome,
      baseline: report.baseline,
    },
    null,
    2,
  ),
);
