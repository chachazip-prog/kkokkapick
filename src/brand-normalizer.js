const BRAND_RULES = [
  ["아가방", /(?:아가방|AGABANG)/i],
  ["밍크뮤", /(?:밍크뮤|MINKMUI)/i],
  ["모이몰른", /(?:모이몰른|MOIMOLN)/i],
  ["에뜨와", /(?:에뜨와(?:HB)?|ETTOI)/i],
  ["압소바", /(?:압소바|ABSORBA)/i],
  ["블루독베이비", /(?:블루독베이비|BLUEDOG\s*BABY)/i],
  ["빈폴키즈", /(?:빈폴\s*키즈|빈폴키즈|BEANPOLE\s*KIDS)/i],
  ["해피프린스", /(?:해피프린스|HAPPY\s*PRINCE)/i],
  ["페리미츠", /(?:페리미츠|PERIMITZ)/i],
  ["헤지스키즈", /(?:헤지스\s*키즈|헤지스키즈|HAZZYS\s*KIDS)/i],
  ["베네통키즈", /(?:베네통\s*키즈|베네통키즈|BENETTON\s*KIDS)/i],
  ["디스커버리키즈", /(?:디스커버리키즈|DISCOVERY\s*KIDS)/i],
  ["몽클레르키즈", /(?:몽클레르|몽클레어|MONCLER)\s*(?:KIDS|키즈)?/i],
  ["나이키키즈", /(?:나이키\s*키즈|NIKE\s*KIDS)/i],
  ["NBA키즈", /(?:NBA\s*KIDS|NBA\s*키즈)/i]
];

export function normalizeBrand(name="") {
  for(const [brand,re] of BRAND_RULES) if(re.test(name)) return brand;
  return null;
}
