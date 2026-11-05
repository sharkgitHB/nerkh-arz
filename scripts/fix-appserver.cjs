// electron-builder's extraResources copier skips node_modules directories.
// The Next.js standalone server NEEDS its node_modules, so this script
// copies it into the packaged win-unpacked before the NSIS step.
const fs = require("fs");
const path = require("path");

const root = process.cwd();
const src = path.join(root, ".next", "standalone-flat", "node_modules");
const dst = path.join(root, "dist-out8", "win-unpacked", "resources", "app-server", "node_modules");

if (!fs.existsSync(src)) {
  console.error("source node_modules not found:", src);
  process.exit(1);
}
fs.rmSync(dst, { recursive: true, force: true });
fs.cpSync(src, dst, { recursive: true });
console.log("app-server node_modules fixed:", dst);
