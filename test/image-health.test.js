import { probeImageUrl, validateProductImages } from "../src/image-health.js";

function response(status, contentType) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: name => name.toLowerCase() === "content-type" ? contentType : null },
    body: { cancel: async () => {} },
  };
}

const good = await probeImageUrl("https://cdn.example.com/a.jpg", {
  fetchImpl: async () => response(200, "image/jpeg"),
});
console.assert(good.ok === true);

const dead = await probeImageUrl("https://cdn.example.com/missing.jpg", {
  fetchImpl: async () => response(404, "text/html; charset=utf-8"),
});
console.assert(dead.ok === false && dead.status === 404);

const nonImage = await probeImageUrl("https://cdn.example.com/a.jpg", {
  fetchImpl: async () => response(200, "text/html"),
});
console.assert(nonImage.ok === false && nonImage.reason === "non_image");

const products = await validateProductImages([
  { name: "good", imageUrl: "https://cdn.example.com/good.jpg" },
  { name: "dead", imageUrl: "https://cdn.example.com/dead.jpg" },
], {
  concurrency: 2,
  fetchImpl: async url => String(url).includes("good")
    ? response(200, "image/webp")
    : response(404, "text/html"),
});
console.assert(products[0].imageUrl?.includes("good"));
console.assert(products[0].imageHealth.ok === true);
console.assert(products[1].imageUrl === null);
console.assert(products[1].imageHealth.status === 404);
console.log("image health normalization PASS");
