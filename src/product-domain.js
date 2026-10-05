(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.KkokkapickProductDomain=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 const CHILD=/(신생아|아기|영아|유아|키즈|아동|어린이|베이비|baby|toddler|kids)/i;
 const EXCLUDE=/(반려|애완|강아지용|고양이용|견용|성인|어른|수집용|피규어|레진|DIY|원단|단추|인형\s*옷|완구\s*의류|장식|인테리어|프로젝터|야간\s*조명|수납|가구|다운로드|전자책|구독|랜덤|미스터리|식품|간식|젖병|기저귀|치발기|세척제|세정제|세탁용품|보관함)/i;
 const CANDIDATE=/(딸랑이|장난감|완구|보드북|그림책|촉감책|헝겊책|퍼즐|교구|쌓기놀이|역할놀이|숫자놀이|모양맞추기|놀이\s*블록|유아\s*블록|아기\s*블록)/i;
 function isNonApparelCandidate(name){return CANDIDATE.test(String(name||''));}
 function nonApparelDomain(name){const s=String(name||'');if(!CHILD.test(s)||EXCLUDE.test(s))return null;if(/(보드북|그림책|촉감책|헝겊책|퍼즐|교구|숫자놀이|모양맞추기)/i.test(s))return'learning';if(/(딸랑이|장난감|완구|쌓기놀이|역할놀이|놀이\s*블록|유아\s*블록|아기\s*블록)/i.test(s))return'toy';return null;}
 function ageEvidence(name,raw){const explicit=raw&&raw.recommended_age;const text=typeof explicit==='string'?explicit:String(name||'');const source=typeof explicit==='string'?'provider':'product_title';if(/사용\s*금지|권장하지|사용하지|세\s*미만/.test(text))return null;let m=text.match(/(\d{1,3})\s*[–~\-]\s*(\d{1,3})\s*(개월|세)/);if(m){const unit=m[3]==='세'?12:1;const min=+m[1]*unit,max=+m[2]*unit;if(min<=max&&max<=216)return{minMonths:min,maxMonths:max,source,sourceField:source==='provider'?'recommended_age':'title',rawText:m[0]};}
 m=text.match(/(\d{1,3})\s*(개월|세)\s*이상/);if(m){const min=+m[1]*(m[2]==='세'?12:1);if(min<=216)return{minMonths:min,maxMonths:null,source,sourceField:source==='provider'?'recommended_age':'title',rawText:m[0]};}return null;}
 function isApparel(p){return!p?.domain||p.domain==='apparel';}
 function matchesMonths(p,months){const e=p&&p.ageEvidence,m=months===null||months===undefined||months===''?NaN:Number(months);return!!e&&Number.isFinite(m)&&Number.isFinite(e.minMonths)&&m>=e.minMonths&&(e.maxMonths===null||Number.isFinite(e.maxMonths)&&m<=e.maxMonths);}
 function category(domain,name){if(domain==='learning')return /책|북/.test(name)?'그림책·보드북':/퍼즐|맞추기/.test(name)?'퍼즐·맞추기':'기초 교구';return /블록|쌓기/.test(name)?'블록·쌓기':/역할/.test(name)?'역할놀이':'감각놀이';}
 return{isNonApparelCandidate,nonApparelDomain,ageEvidence,isApparel,matchesMonths,category};
});
