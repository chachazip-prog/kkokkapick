/* Local-only child profiles. No network, analytics or account upload. */
(function(root){
 const KEY='kkokkapickChildProfiles',ranges={months:[0,180],height:[30,190],weight:[1,100]};
 function createStore(storage){
  const read=key=>{try{return storage.getItem(key)}catch{return null}};
  function measurement(value,key){if(value===null||value===undefined||value==='')return '';const n=Number(value);return Number.isFinite(n)&&n>=ranges[key][0]&&n<=ranges[key][1]&&(key!=='months'||Number.isInteger(n))?String(n):''}
  let saved;try{saved=JSON.parse(read(KEY)||'null')}catch{saved=null}
  const seen=new Set();let children=Array.isArray(saved?.children)?saved.children.filter(c=>c&&typeof c.id==='string'&&c.id.length&&c.id.length<=100&&!seen.has(c.id)&&seen.add(c.id)).map(c=>({id:c.id,name:String(c.name||'우리 아이').slice(0,20),months:measurement(c.months,'months'),height:measurement(c.height,'height'),weight:measurement(c.weight,'weight')})):[];
  if(!saved&&Object.keys(ranges).some(k=>read(k)!==null))children=[{id:'child-legacy',name:'우리 아이',months:measurement(read('months'),'months'),height:measurement(read('height'),'height'),weight:measurement(read('weight'),'weight')}];
  let selectedId=children.some(c=>c.id===saved?.selectedId)?saved.selectedId:children[0]?.id||null;
  const current=()=>children.find(c=>c.id===selectedId)||null;
  function commit(next,id){storage.setItem(KEY,JSON.stringify({version:1,selectedId:id,children:next}));children=next;selectedId=id;const child=current();for(const k of Object.keys(ranges)){try{if(child)storage.setItem(k,child[k]);else storage.removeItem(k)}catch{/* Compatibility mirrors are secondary; primary storage already committed. */}}}
  return {
   all:()=>children.map(c=>({...c})),current:()=>current()?{...current()}:null,
   select(id){if(!children.some(c=>c.id===id))return false;commit(children,id);return true},
   save(input,id){for(const k of Object.keys(ranges)){if(measurement(input[k],k)==='')throw Error('월령·키·몸무게를 범위에 맞게 입력해 주세요.');}
    const exists=children.find(c=>c.id===id);const child={id:exists?.id||'child-'+(root.crypto?.randomUUID?.()||Date.now()+'-'+Math.random().toString(36).slice(2)),name:String(input.name||'').trim().slice(0,20)||'아이 '+(children.length+1),months:measurement(input.months,'months'),height:measurement(input.height,'height'),weight:measurement(input.weight,'weight')};
    commit(exists?children.map(c=>c.id===id?child:c):[...children,child],child.id);return {...child};
   },
   remove(id){if(!children.some(c=>c.id===id))return false;const next=children.filter(c=>c.id!==id);commit(next,selectedId===id?next[0]?.id||null:selectedId);return true}
  };
 }
 root.KkokkapickChildProfiles={createStore};
})(globalThis);
