// Keyword-based discovery avoids wasteful full-catalog crawling.
// Run server-side only; never expose ADPICK_API_KEY to the mobile/web client.
import { AdpickProvider } from "../src/adpick-provider.js";

const DEFAULT_KEYWORDS = [
  "신생아 바디수트","아기 내복","아기 상하복","아기 원피스","아기 가디건",
  "유아 상하복","유아 티셔츠","유아 바지","유아 원피스","유아 아우터",
  "키즈 상하복","키즈 티셔츠","키즈 바지","키즈 원피스","키즈 아우터"
];

export async function discoverAdpickProducts({ apiKey, keywords = DEFAULT_KEYWORDS, onBatch }) {
  const provider = new AdpickProvider({ apiKey });
  for (const keyword of keywords) {
    const items = await provider.search(keyword, { limit: 20, trackingId: "catalog_discovery" });
    await onBatch(keyword, items);
    // API guide: search rate limit is 10/min. Keep a conservative interval.
    await new Promise(resolve => setTimeout(resolve, 6500));
  }
}
