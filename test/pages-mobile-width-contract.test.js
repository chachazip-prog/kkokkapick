import assert from "node:assert/strict";
import fs from "node:fs";
const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const css=(html.match(/<style>([\s\S]*?)<\/style>/)||[])[1]||"";
for(const rule of [
  "html,body{width:100%;max-width:100%;overflow-x:hidden}",
  ".app{width:100%;max-width:480px;overflow-x:hidden",
  ".search input{border:0;background:transparent;outline:0;width:100%;min-width:0",
  ".chips{display:flex;width:100%;max-width:100%;overflow-x:auto",
  "grid-template-columns:minmax(0,1fr) minmax(0,1fr)",
  ".card{position:relative;min-width:0}",
  ".panel{width:100%;max-width:480px;min-width:0",
  "grid-template-columns:repeat(3,minmax(0,1fr))",
  ".profile input{width:100%;min-width:0"
]) assert.ok(css.includes(rule),"missing mobile containment rule: "+rule);
assert.ok(!css.includes(".profile input{width:30%"),"legacy profile width must not remain");
console.log("mobile width containment contract passed for 320-430px layouts");
