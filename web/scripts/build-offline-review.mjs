import { build } from "vite";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const app = fileURLToPath(new URL("../", import.meta.url));
const output = fileURLToPath(new URL("../../react-preview/", import.meta.url));
const bundle = await build({
  root: app,
  configFile: fileURLToPath(new URL("../vite.config.ts", import.meta.url)),
  define: {
    "import.meta.url": "window.location.href",
    "import.meta.hot": "undefined",
    "import.meta.resolve": "undefined",
  },
  build: {
    write: false,
    assetsInlineLimit: Infinity,
    cssCodeSplit: false,
    modulePreload: false,
    rollupOptions: {
      input: fileURLToPath(new URL("../src/main.tsx", import.meta.url)),
      output: { format: "iife", name: "KkokkapickReview" },
    },
  },
});
const result = Array.isArray(bundle) ? bundle[0] : bundle;
const js = result.output
  .filter((item) => item.type === "chunk")
  .map((item) => item.code)
  .join("\n");
const css = result.output
  .filter((item) => item.type === "asset" && item.fileName.endsWith(".css"))
  .map((item) => item.source)
  .join("\n");
if (!js || !css) throw new Error("Missing standalone app output");
const escapedJs = js.replace(/<\/script/gi, "<\\/script");
const escapedCss = css.replace(/<\/style/gi, "<\\/style");
const document = `<!doctype html>
<html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="robots" content="noindex"><title>꼬까픽 UI/UX · 오프라인 검토</title><style>${escapedCss}</style></head><body><div id="root"></div><script>${escapedJs}</script></body></html>`;
await mkdir(output, { recursive: true });
await writeFile(output + "offline.html", document);
console.log(
  "Standalone React review written to react-preview/offline.html. No supplier photos or test goods included.",
);
