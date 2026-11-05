// Stages the Next.js standalone output into a flat bundle for Electron packaging.
// Next 16 nests the standalone output under the project path
// (.next/standalone/<project-path>/server.js), so we flatten it into
// .next/standalone-flat/ with this layout:
//   server.js, node_modules/, .next/ (server + static), public/
const fs = require("fs");
const path = require("path");

const root = process.cwd();
const standaloneDir = path.join(root, ".next", "standalone");
const outDir = path.join(root, ".next", "standalone-flat");

// Find the nested project dir that contains server.js
function findServerEntry(dir, depth = 0) {
  if (depth > 6) return null;
  if (fs.existsSync(path.join(dir, "server.js"))) return dir;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const found = findServerEntry(path.join(dir, entry.name), depth + 1);
    if (found) return found;
  }
  return null;
}

const nested = findServerEntry(standaloneDir);
if (!nested) {
  console.error("standalone server.js not found under .next/standalone");
  process.exit(1);
}

fs.rmSync(outDir, { recursive: true, force: true });
fs.cpSync(nested, outDir, { recursive: true });

// Client-side static assets and public files
fs.cpSync(path.join(root, ".next", "static"), path.join(outDir, ".next", "static"), {
  recursive: true,
});
fs.cpSync(path.join(root, "public"), path.join(outDir, "public"), { recursive: true });

console.log(`standalone-flat ready: ${outDir}`);
