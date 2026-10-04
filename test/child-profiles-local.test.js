const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context=vm.createContext({});vm.runInContext(fs.readFileSync('src/child-profiles.js','utf8'),context);
function storage(initial={}){const data=new Map(Object.entries(initial));return{data,getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)}}
const make=s=>context.KkokkapickChildProfiles.createStore(s),s=storage({months:'0',height:'50',weight:'4'}),store=make(s);
assert.equal(store.current().months,'0');assert.equal(store.all().length,1);
const older=store.save({name:'둘째',months:'36',height:'92',weight:'14'});assert.equal(store.all().length,2);assert.equal(store.current().id,older.id);assert.equal(make(s).current().name,'둘째');store.select('child-legacy');assert.equal(store.current().months,'0');assert.equal(s.getItem('months'),'0');
const blocked=storage();blocked.setItem=()=>{throw Error('quota')};const denied=make(blocked);assert.throws(()=>denied.save({months:'0',height:'50',weight:'4'}));assert.equal(denied.all().length,0);
const selectedBefore=store.current().id;s.setItem=()=>{throw Error('quota')};assert.throws(()=>store.select(older.id));assert.equal(store.current().id,selectedBefore);
const mirror=storage();const set=mirror.setItem;mirror.setItem=(k,v)=>{if(k==='months')throw Error('mirror');set(k,v)};const mirrored=make(mirror);const saved=mirrored.save({name:'첫째',months:'12',height:'76',weight:'10'});assert.equal(mirrored.all().length,1);mirrored.save({name:'첫째',months:'12',height:'77',weight:'10'},saved.id);assert.equal(mirrored.all().length,1);assert.equal(make(mirror).current().height,'77');
const noRead=make({getItem(){throw Error('denied')},setItem(){throw Error('denied')},removeItem(){}});assert.equal(noRead.all().length,0);
const malformed=make(storage({kkokkapickChildProfiles:JSON.stringify({selectedId:'missing',children:[{id:'same',name:'<img>',months:'0',height:'50',weight:'4'},{id:'same',months:'12'},{id:'other',months:'-1',height:'Infinity',weight:'bad'}]})}));assert.equal(malformed.all().length,2);assert.equal(malformed.current().id,'same');assert.equal(malformed.all()[1].months,'');assert.equal(malformed.all()[1].height,'');
mirrored.remove(saved.id);assert.equal(mirrored.all().length,0);assert.equal(make(mirror).all().length,0);assert.equal(mirror.getItem('height'),null);
assert.throws(()=>store.save({months:'1.5',height:'50',weight:'4'}));
console.log('Local child profiles: migration, selection, atomic writes, secondary mirrors, sanitization, deletion PASS');
