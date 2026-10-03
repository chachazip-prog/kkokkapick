import assert from "node:assert/strict";
import fs from "node:fs";
const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const css=(html.match(/<style>([\s\S]*?)<\/style>/)||[])[1]||"";
assert.ok(css.includes("@media (max-width:480px){input,select,textarea{font-size:16px!important}}"),"mobile controls must stay >=16px to prevent iOS focus auto-zoom");
assert.ok(css.includes(".search input{border:0;background:transparent;outline:0;width:100%;min-width:0;font-size:16px}"),"search input must be 16px");
assert.ok(css.includes(".profile input{width:100%;min-width:0;padding:9px;font-size:16px;"),"profile inputs must be 16px");
assert.ok(!css.includes(".search input{border:0;background:transparent;outline:0;width:100%;min-width:0;font-size:15px}"),"15px search input regression");
console.log("iOS form auto-zoom prevention contract passed");
