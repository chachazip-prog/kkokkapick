import { AdpickProvider } from "../src/adpick-provider.js";
import fixture from "./fixtures/adpick-recommended.json" with { type: "json" };

const provider = new AdpickProvider({ apiUrl: "https://example.invalid" });
const [p] = provider.normalizeResponse(fixture);
console.assert(p.name === "테스트 유아 상하복");
console.assert(p.price === 29900);
console.assert(p.originalPrice === 39900);
console.assert(p.commissionRate === 3.5);
console.assert(p.priceStatus === "known");
console.log("ADPICK adapter fixture OK", p);
