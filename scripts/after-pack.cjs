// afterPack hook: trim Chromium locale packs to fa + en-US
// (the app UI is web content; Chromium locales only affect browser chrome)
const fs = require("fs");
const path = require("path");

module.exports = async (context) => {
  const localesDir = path.join(context.appOutDir, "locales");
  if (!fs.existsSync(localesDir)) return;
  const keep = new Set(["en-US.pak", "fa.pak"]);
  let removed = 0;
  let bytes = 0;
  for (const f of fs.readdirSync(localesDir)) {
    if (f.endsWith(".pak") && !keep.has(f)) {
      const p = path.join(localesDir, f);
      bytes += fs.statSync(p).size;
      fs.rmSync(p);
      removed++;
    }
  }
  console.log(`afterPack: removed ${removed} locale packs (${(bytes / 1e6).toFixed(1)} MB)`);
};
