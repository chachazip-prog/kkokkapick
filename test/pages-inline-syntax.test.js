import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const scripts=[...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]).filter(Boolean);
assert.ok(scripts.length>=2,"expected inline scripts");
scripts.forEach((source,index)=>{
  assert.doesNotThrow(()=>new vm.Script(source,{filename:"index.inline."+index+".js"}),"inline script "+index+" must parse");
});
assert.ok(!html.includes('onclick="savePriceAlert('),"price alert must not embed quoted JS argument");
assert.match(html,/data-save-price-alert=/);
console.log("all inline Pages scripts parse");
