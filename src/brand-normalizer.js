const BRAND_RULES = [
  ["콩제슬래드", /콩제슬래드/i],
  ["밀크베이비", /밀크베이비/i],
  ["베이비맥스", /베이비맥스/i],
  ["삠뽀요", /삠뽀요/i],
  ["쇼콜라", /쇼콜라/i],
  ["휠라키즈", /(?:휠라.*키즈|FILA\s*KIDS)/i],
  ["아디다스키즈", /(?:아디다스키즈|ADIDAS\s*KIDS)/i],
  ["노스페이스키즈", /(?:노스페이스\s*키즈|THE\s*NORTH\s*FACE\s*KIDS)/i],
  ["캉골키즈", /(?:캉골\s*키즈|KANGOL\s*KIDS)/i],
  ["모스키노키즈", /(?:모스키노키즈|MOSCHINO\s*KIDS)/i],
  ["보보쇼즈", /(?:보보쇼즈|BOBO\s*CHOSES)/i],
  ["MLB키즈", /MLB\s*키즈/i],
  ["프렌치캣", /프렌치캣/i],
  ["스톤아일랜드키즈", /(?:스톤아일랜드키즈|STONE\s*ISLAND\s*KIDS)/i],
  ["블루독베이비", /(?:블루독베이비|BLUEDOG\s*BABY)/i],

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
