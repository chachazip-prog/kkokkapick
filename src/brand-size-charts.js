export const BRAND_SIZE_CHARTS = {
  "아가방": {
    source: "official_brand_size_guide",
    verified: true,
    verifiedAt: "2026-09-28",
    rows: [
      {size:"1M", months:[1,1], height:48, weight:5.1},
      {size:"3M", months:[3,3], height:54, weight:7.2},
      {size:"60", months:[3,6], height:60, weight:8.4},
      {size:"9M", months:[6,9], height:68, weight:9.5},
      {size:"75", months:[7,10], height:72, weight:10.3},
      {size:"80", months:[9,12], height:76, weight:null},
      {size:"90", months:[12,24], height:84, weight:12.8},
      {size:"100", months:[36,36], height:92, weight:13.7},
      {size:"110", months:[48,48], height:101, weight:15.7},
      {size:"120", months:[60,60], height:110, weight:19.7},
      {size:"130", months:[72,72], height:119, weight:23.6}
    ]
  }
};

export function detectBrand(name="") {
  if(/아가방/i.test(name)) return "아가방";
  return null;
}

export function getVerifiedChart(brand) {
  const c=BRAND_SIZE_CHARTS[brand];
  return c?.verified ? c : null;
}


export const BRAND_SIZE_CANDIDATES = Object.freeze({
  "밍크뮤": {
    status: "candidate",
    reason: "Consistent size chart found on multiple retailer product pages, but first-party brand source not yet verified."
  },
  "압소바": {
    status: "candidate",
    reason: "Detailed STANDARD SIZE chart found on retailer product pages, but first-party brand source not yet verified."
  },
  "모이몰른": {
    status: "unverified",
    reason: "No first-party size chart verified yet."
  },
  "에뜨와": {
    status: "unverified",
    reason: "No first-party size chart verified yet."
  }
});

export function getFitEvidence(brand) {
  if (!brand) return { status: "unverified", source: null };
  const verified = BRAND_SIZE_CHARTS[brand];
  if (verified?.verified) {
    return { status: "verified", source: verified.source, verifiedAt: verified.verifiedAt };
  }
  const candidate = BRAND_SIZE_CANDIDATES[brand];
  if (candidate) return { status: candidate.status, source: null };
  return { status: "unverified", source: null };
}
