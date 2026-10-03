import assert from "node:assert/strict";
import fs from "node:fs";

const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const classic=html.indexOf("window.__kkokkapickRuntimeError=show");
const moduleTag=html.indexOf('<script type="module">');

assert.ok(classic>=0,"runtime diagnostic bootstrap missing");
assert.ok(moduleTag>classic,"diagnostic bootstrap must execute before module imports");
assert.match(html,/addEventListener\('error'/);
assert.match(html,/addEventListener\('unhandledrejection'/);
assert.match(html,/BOOT_TIMEOUT/);
assert.match(html,/window\.__kkokkapickBooted=true/);
assert.match(html,/<script nomodule>/);
console.log("pages runtime diagnostic contract passed");
