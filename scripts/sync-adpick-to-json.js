import fs from "node:fs/promises";
import { AdpickProvider } from "../src/adpick-provider.js";

const apiUrl = process.env.ADPICK_API_URL;
if (!apiUrl) throw new Error("Missing GitHub Actions secret: ADPICK_API_URL");

const provider = new AdpickProvider({ apiUrl });
const products = await provider.fetchRecommended();

const usable = products.filter(p =>
  p.name &&
  p.imageUrl &&
  p.affiliateUrl
);

const catalog = {
  source: "adpick",
  syncedAt: new Date().toISOString(),
  count: usable.length,
  products: usable
};

await fs.mkdir("data", { recursive: true });
await fs.writeFile("data/adpick-products.json", JSON.stringify(catalog, null, 2) + "\n");
console.log(`Saved ${usable.length} ADPICK products`);
