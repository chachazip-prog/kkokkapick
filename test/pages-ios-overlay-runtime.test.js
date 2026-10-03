import assert from "node:assert/strict";import fs from "node:fs";
const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
assert.ok(html.includes("overscroll-behavior:contain;-webkit-overflow-scrolling:touch"),"modal panel must contain scrolling");
assert.ok(html.includes("function lockPageScroll()"),"overlay must lock page scroll");
assert.ok(html.includes("document.body.style.position='fixed'"),"iOS body scroll lock must use fixed body");
assert.ok(html.includes("window.scrollTo(0,overlayScrollY)"),"closing overlay must restore scroll position");
assert.ok(html.includes("if(opaque)return;"),"opaque Safari Script error must not render user diagnostic");
assert.ok(html.includes("if(e.target===sheet)e.preventDefault()"),"backdrop touchmove must not chain to page");
console.log("iOS overlay scroll/runtime diagnostic contract passed");