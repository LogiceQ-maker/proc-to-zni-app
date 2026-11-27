'use strict';
/* ---------- basics & state ---------- */
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const store={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
let lang=store.get('pcz-lang',/^(cs|sk)/i.test(navigator.language||'cs')?'cs':'en');
let playLvl=store.get('pcz-play',null);const PL=()=>playLvl||'mid';
let cz=store.get('pcz-cz',lang==='cs'),level=store.get('pcz-level',null),mine=store.get('pcz-songs',[]),done=store.get('pcz-done2',[]);
let stats=store.get('pcz-stats',{}),plog=store.get('pcz-log',{}),stage=store.get('pcz-stage',1),lefty=store.get('pcz-lefty',false),tuningId=store.get('pcz-tuning','std');
let rep=store.get('pcz-rep',{}),cards=store.get('pcz-cards',{}),chRec=store.get('pcz-ch',{}),ytLoops=store.get('pcz-yt',{}),planDone=store.get('pcz-plan',{});
let cur=store.get('pcz-cur','l1'),shift=0,selIdx=0,mode='pent',lab='name',view='song',sub='play',sample=null,activeTrain=null;
const tr=(c,e)=>lang==='cs'?c:e;
const X=()=>S[lang];
const dkey=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const today=()=>dkey(new Date());
const addDays=n=>{const d=new Date();d.setDate(d.getDate()+n);return dkey(d)};
const fmt=s=>Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const uniq=a=>[...new Set(a)];

const FOLK=[
 {id:'l1',name:'Holka modrooká (lidová)',text:`G
Holka modrooká,
     D7
nesedávej u potoka,
G
holka modrooká,
D7         G
nesedávej tam.

G
V potoce je hastrmánek,
D7
zatahá tě za copánek,
G
holka modrooká,
D7         G
nesedávej tam.`},
 {id:'l2',name:'Skákal pes (lidová)',text:`C              G7
Skákal pes přes oves,
               C
přes zelenou louku,
C              G7
šel za ním myslivec,
               C
péro na klobouku.

F              C
Pejsku náš, co děláš,
G7            C
žes tak vesel stále?
F              C
Řek bych vám, nevím sám,
G7            C
hop a skákal dále.`},
 {id:'l3',name:'Pec nám spadla (lidová)',text:`C               G7
Pec nám spadla, pec nám spadla,
                 C
kdopak nám ji postaví?
C                 G7
Starý pecař není doma
                C
a mladý to neumí.`},
 {id:'l4',name:'Kočka leze dírou (lidová)',text:`D            A7
Kočka leze dírou,
             D
pes oknem, pes oknem,
D               A7
nebude-li pršet,
             D
nezmoknem, nezmoknem.`},
 {id:'l5',name:'Amazing Grace (traditional)',text:`G              C        G
Amazing grace! How sweet the sound
                     D
That saved a wretch like me!
G                C       G
I once was lost, but now am found,
    Em       D       G
Was blind, but now I see.`}];
const EXAMPLES=FOLK.concat([{id:'x1',name:'Sultans of Swing',text:'Dm C Bb A\nDm C Bb A\nF C Bb Dm'},{id:'x2',name:'Hit the Road Jack',text:'Am G F E'},{id:'x3',name:'Let It Be',text:'C G Am F\nC G F C'},{id:'x4',name:"Knockin' on Heaven's Door",text:'G D Am\nG D C'},{id:'x5',name:'Stand by Me',text:'A F#m D E A'}]);
function songs(){return EXAMPLES.concat(mine)}
function curSong(){return songs().find(s=>s.id===cur)||EXAMPLES[0]}

/* ---------- notes & chords ---------- */
const INT_S=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'],INT_F=['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'],CZ_S=['C','C#','D','D#','E','F','F#','G','G#','A','B','H'],CZ_F=['C','Db','D','Eb','E','F','Gb','G','Ab','A','B','H'];
let flat=false;
const nn=pc=>(cz?(flat?CZ_F:CZ_S):(flat?INT_F:INT_S))[((pc%12)+12)%12];
const nsh=pc=>{const f=flat;flat=false;const v=nn(pc);flat=f;return v};
const flatFor=k=>!!k&&[5,10,3,8,1].includes(k.minor?(k.t+3)%12:k.t);
function withFlat(f,fn){const o=flat;flat=f;try{return fn()}finally{flat=o}}
const BASE={C:0,D:2,E:4,F:5,G:7,A:9,B:11,H:11};
const RE=/^([A-H])(#|is|es|b|s)?(maj7|maj9|maj|mi|min|moll|m|dim|°|aug|\+)?((?:add9|add11|add2|sus2|sus4|sus|maj7|7|9|11|13|6|5|4|2)*)(?:\/([A-H])(#|is|es|b)?)?$/;
function rootOf(l,a){let v=BASE[l];if(cz&&l==='B')return 10;if(a==='#'||a==='is')v++;if(a==='b'||a==='es'||a==='s')v--;return (v+12)%12}
function chord(tok){
 const t=tok.replace(/^[\[({]+|[\])},.;:!?]+$/g,'');const m=RE.exec(t);if(!m)return null;
 if(m[2]==='s'&&m[1]!=='A'&&m[1]!=='E')return null;
 let q='M',ext=m[4]||'',qq=m[3]||'';
 if(qq.startsWith('maj'))ext=qq+ext;else if(/^(m|mi|min|moll)$/.test(qq))q='m';else if(qq==='dim'||qq==='°')q='d';else if(qq==='aug'||qq==='+')q='a';
 if(q==='M'&&/sus/.test(ext))q='s';if(q==='M'&&ext==='5')q='5';
 return {root:rootOf(m[1],m[2]),q,ext,bass:m[5]?rootOf(m[5],m[6]):null};
}
const JUNK=/^([|\-–—\/:.*x×\d()]+|R\d?:?|Ref\.?:?|Rec\.?:?|Refrén:?|Chorus:?|Verse:?|Sloka:?|Intro:?|Outro:?|Mezihra:?|Bridge:?|Solo:?)$/i;
function isChordLine(line){const toks=line.split(/\s+/).filter(t=>t&&!JUNK.test(t));if(!toks.length)return false;const n=toks.filter(t=>chord(t)).length;return n>0&&n/toks.length>=0.6}
function parse(text){
 const out=[];
 for(const line of text.split(/\r?\n/)){
  const br=[...line.matchAll(/\[([^\]]+)\]/g)].map(x=>chord(x[1])).filter(Boolean);
  if(br.length){out.push(...br);continue}
  if(isChordLine(line))out.push(...line.split(/\s+/).map(chord).filter(Boolean));
 }
 return out;
}
const tp=(c,d)=>({...c,root:(c.root+d+120)%12,bass:c.bass==null?null:(c.bass+d+120)%12});
const qm=(c,w)=>c.q===w?1:((c.q==='s'||c.q==='5')&&w!=='d'?0.8:0);
const T={maj:{0:[['M',1]],2:[['m',1],['M',.4]],4:[['m',1],['M',.4]],5:[['M',1],['m',.4]],7:[['M',1]],9:[['m',1]],10:[['M',.5]],11:[['d',1]]},
 min:{0:[['m',1]],2:[['d',1]],3:[['M',1]],5:[['m',1],['M',.3]],7:[['M',1],['m',1]],8:[['M',1]],10:[['M',1]]}};
function detect(cs){
 if(!cs.length)return null;let best=null;
 for(let t=0;t<12;t++)for(const md of ['maj','min']){
  let s=0;for(const c of cs){const L=T[md][(c.root-t+12)%12];if(L)s+=Math.max(...L.map(([w,v])=>v*qm(c,w)))}
  const tq=md==='maj'?'M':'m',f=cs[0],l=cs[cs.length-1];
  if(f.root===t&&qm(f,tq))s+=1.5;if(l.root===t&&qm(l,tq))s+=1.2;
  if(!best||s>best.s+1e-9)best={t,minor:md==='min',s};
 }
 return best;
}
const NUM_MAJ=['I','bII','II','bIII','III','IV','#IV','V','bVI','VI','bVII','VII'],NUM_MIN=['I','bII','II','III','#III','IV','#IV','V','VI','#VI','VII','#VII'];
function role(c,k){
 const iv=(c.root-k.t+12)%12,bq=c.q==='s'||c.q==='5'||c.q==='a'?'M':c.q;
 let num=(k.minor?NUM_MIN:NUM_MAJ)[iv];num=(bq==='m'||bq==='d')?num.toLowerCase():num;if(bq==='d')num+='°';
 const R=ROLE[lang],r=R[k.minor?'min':'maj'][iv+bq]||R.def;let tip=r[2];
 if(iv===7&&/7/.test(c.ext)&&!/maj7/.test(c.ext))tip+=R.sev;
 return {id:iv+bq,iv,bq,num,word:r[0],term:r[1],tip,home:iv===0};
}
const NATIDS={maj:['0M','2m','4m','5M','7M','9m','11d'],min:['0m','2d','3M','5m','7m','8M','10M']};
function pattern(cs,k){
 const seq=[];for(const c of cs){const id=role(c,k).id;if(!seq.length||seq[seq.length-1].id!==id)seq.push({id,c})}
 if(seq.length>1&&seq[0].id===seq[seq.length-1].id)seq.pop();
 const s2=seq.concat(seq),li=lang==='cs'?0:1;
 for(const p of PAT[k.minor?'min':'maj'])for(let i=0;i<seq.length;i++){if(p[1].every((id,j)=>s2[i+j]&&s2[i+j].id===id))return {num:p[0],name:p[2][li],term:p[3][li],tip:p[4][li],chords:s2.slice(i,i+p[1].length).map(x=>x.c)}}
 return null;
}
const EASY={'0M':1,'2M':1,'4M':1,'7M':1,'9M':1,'9m':1,'4m':1,'2m':1,'5M':.5,'11m':.4,'11M':.35};
function capos(us){const r=[];for(let k=0;k<=9;k++){let s=0;for(const c of us){const bq=c.q==='m'?'m':(c.q==='d'?'d':'M');s+=EASY[((c.root-k+12)%12)+bq]||0}r.push({k,s:s/us.length-k*.012})}return r.sort((a,b)=>b.s-a.s).slice(0,3)}
const QS={M:'',m:'m',d:'dim',a:'+',s:'','5':''};
const cname0=(c,d)=>nn(c.root-d)+QS[c.q]+c.ext+(c.bass!=null?'/'+nn(c.bass-d):'');
const cname=(c,d=0)=>d&&typeof A!=='undefined'&&A.k?withFlat(flatFor({t:((A.k.t-d)%12+12)%12,minor:A.k.minor}),()=>cname0(c,d)):cname0(c,d);
function tones(c){const t=[0];if(c.q==='m'||c.q==='d')t.push(3);else if(c.q==='M'||c.q==='a')t.push(4);else if(c.q==='s')t.push(/sus2/.test(c.ext)?2:5);t.push(c.q==='d'?6:c.q==='a'?8:7);if(/maj7/.test(c.ext))t.push(11);else if(/7/.test(c.ext))t.push(c.q==='d'?9:10);return t}
const DEG=['1','b2','2','b3','3','4','b5','5','b6','6','b7','7'];
const keyName=k=>nn(k.t)+' '+(k.minor?X().minor:X().major);
const C0=(root,q,ext='')=>({root:(root+120)%12,q,ext,bass:null});
function analyzeText(text,sh=0){
 const cs=parse(text||'').map(c=>tp(c,sh)),k=detect(cs);
 const seen=new Map();for(const c of cs){const key=c.root+c.q+c.ext+(c.bass??'');if(!seen.has(key))seen.set(key,c)}
 return {cs,us:[...seen.values()],k};
}
let A={cs:[],us:[],k:null};
function analyze(){A=analyzeText(curSong().text,shift);flat=flatFor(A.k);if(selIdx>=A.us.length)selIdx=0}
const seqOf=cs=>{const o=[];for(const c of cs)if(!o.length||cname(o[o.length-1])!==cname(c))o.push(c);return o};
const seq=()=>seqOf(A.cs).slice(0,16);

/* ---------- sound ---------- */
let ac=null,master=null,playT=[];const bufs={};
function aSess(t){try{if(navigator.audioSession&&navigator.audioSession.type!==t)navigator.audioSession.type=t}catch(e){}}
function actx(){if(!ac){aSess('playback');ac=new (window.AudioContext||window.webkitAudioContext)({latencyHint:'interactive'})}if(ac.state!=='running')try{ac.resume()}catch(e){}return ac}
/* iPhone: Web Audio is muted by the silent switch and starts suspended. Unlock on the first touch:
   - audioSession 'playback' (iOS 17+) ignores the silent switch
   - a short silent <audio> element does the same on older iOS
   - resume the AudioContext inside the gesture */
const SILENT='data:audio/wav;base64,UklGRmQGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YUAGAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA';
let silentEl=null;
/* iPhone silent switch: Web Audio follows the ringer unless an HTML <audio> element is *playing*.
   So a silent track loops quietly the whole time the app is open (paused when the app is hidden). */
function unlockAudio(){try{actx();if(!Mic.stream)aSess('playback');
 if(!silentEl){silentEl=new Audio(SILENT);silentEl.loop=true;silentEl.setAttribute('playsinline','');silentEl.setAttribute('x-webkit-airplay','deny');silentEl.preload='auto';silentEl.volume=.01}
 if(silentEl.paused){const pr=silentEl.play();if(pr&&pr.catch)pr.catch(()=>{})}
 if(ac.state!=='running')ac.resume()}catch(e){}}
document.addEventListener('visibilitychange',()=>{if(!silentEl)return;if(document.hidden)silentEl.pause()});
['touchend','click','keydown'].forEach(ev=>document.addEventListener(ev,unlockAudio,{capture:true,passive:true}));
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&ac&&ac.state!=='running')try{ac.resume()}catch(e){}});
function pluckBuf(m){if(bufs[m])return bufs[m];const f=440*2**((m-69)/12),sr=ac.sampleRate,len=Math.floor(sr*1.8),N=Math.max(2,Math.round(sr/f)),b=ac.createBuffer(1,len,sr),d=b.getChannelData(0);
 let p=0;for(let i=0;i<N;i++){const r=Math.random()*2-1;d[i]=(r+p)*.5;p=r}for(let i=N;i<len;i++)d[i]=.4985*(d[i-N]+d[i-N+1]);return bufs[m]=b}
function note(m,t,g,dest,dur){const s=ac.createBufferSource(),v=ac.createGain();s.buffer=pluckBuf(m);v.gain.setValueAtTime(g,t);if(dur){v.gain.setValueAtTime(g,t+dur);v.gain.exponentialRampToValueAtTime(.0001,t+dur+.08)}s.connect(v).connect(dest||master);s.start(t);if(dur)s.stop(t+dur+.1)}
function voicing(c){if(c.midis)return c.midis;const b=40+(((c.bass??c.root)-4+12)%12),ms=[b];for(const t of tones(c))ms.push(52+((c.root+t-4+12)%12));ms.push(64+((c.root-4+12)%12));return uniq(ms).sort((a,b)=>a-b)}
function strum(c,t,dir,g,dest,dur){let ms=voicing(c);if(dir==='U')ms=ms.slice().reverse().slice(0,4);ms.forEach((m,j)=>note(m,t+j*(dir==='U'?.012:.02),g,dest,dur))}
function stopPlay(){playT.forEach(clearTimeout);playT=[];if(master){try{master.disconnect()}catch(e){}master=null}document.querySelectorAll('.lit').forEach(e=>e.classList.remove('lit'));document.querySelectorAll('[data-pl].playing').forEach(b=>{b.classList.remove('playing');b.textContent=b.dataset.lbl})}
function play(items,btn,step=1.15,notes=false){
 if(!Mic.on&&Mic.stream&&typeof micRelease==='function')micRelease(); // a held mic would route sound to the quiet earpiece on iPhone
 const was=btn&&btn.classList.contains('playing');stopPlay();if(was)return;
 try{actx()}catch(e){return}master=ac.createGain();master.gain.value=.7;master.connect(ac.destination);
 const t0=ac.currentTime+.06;
 items.forEach((it,i)=>{const t=t0+i*step;
  if(notes)note(it,t,.5);else strum(it,t,'D',.22);
  playT.push(setTimeout(()=>{document.querySelectorAll('.lit').forEach(e=>e.classList.remove('lit'));if(!notes&&!it.midis){const n=cname(it);document.querySelectorAll(`[data-cn="${CSS.escape(n)}"]`).forEach(e=>e.classList.add('lit'))}},(t-ac.currentTime)*1000))});
 if(btn){btn.dataset.lbl=btn.dataset.lbl||btn.textContent;btn.classList.add('playing');btn.textContent=X().stopP}
 playT.push(setTimeout(()=>{if(btn){btn.classList.remove('playing');btn.textContent=btn.dataset.lbl}document.querySelectorAll('.lit').forEach(e=>e.classList.remove('lit'))},(t0-ac.currentTime+items.length*step+.4)*1000));
}
function pling(m){try{actx();const g=ac.createGain();g.gain.value=.6;g.connect(ac.destination);note(m,ac.currentTime+.02,.6,g)}catch(e){}}
function click(t,acc,dest){const o=ac.createOscillator(),g=ac.createGain();o.frequency.value=acc?1600:1000;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(acc?.5:.3,t+.002);g.gain.exponentialRampToValueAtTime(.0001,t+.05);o.connect(g).connect(dest||ac.destination);o.start(t);o.stop(t+.06)}
const reg={};let regN=0;
const pbtn=(lbl0,items,o={})=>{const lbl=String(lbl0).replace(/▶(?!\uFE0E)/g,'▶\uFE0E');const id='p'+(regN++);reg[id]={items,...o};return `<button class="${o.cls||''}" data-pl="${id}" data-lbl="${esc(lbl)}">${esc(lbl)}</button>`};
document.addEventListener('click',e=>{const b=e.target.closest('[data-pl]');if(!b)return;const r=reg[b.dataset.pl];if(!r)return;if(r.act)return r.act();play(r.items,b,r.step||1.15,r.notes)});

/* ---------- fretboard ---------- */
const OPEN=[4,11,7,2,9,4],OPENM=[64,59,55,50,45,40];
const KC={home:['var(--fire)','#fff'],note:['var(--pearl)','#3a2318'],good:['#2e9e6b','#fff'],bad:['#e5484d','#fff'],h3:['#2e9e6b','#fff'],h2:['#e8b031','#3a2318'],h1:['#e5484d','#fff'],h0:['#ffffff3a','#f5efe2'],ghost:['none','#efe8da']};
const bro=new ResizeObserver(es=>es.forEach(e=>drawBoard(e.target)));
function setBoard(el,o){if(!el)return;el._o=o;if(!el._init){el._init=1;bro.observe(el);el.addEventListener('click',boardTap)}el.classList.toggle('tap',!!o.tap);drawBoard(el)}
function geo(W,H,NF,vert){
 if(!vert){const L=70,R=14,T=26,B=40,gap=(H-T-B)/5,fw=(W-L-R)/NF;
  return {vert,W,H,P:(s,f)=>[f===0?L-26:L+(f-.5)*fw,T+s*gap],FL:f=>[L+f*fw,T-14,L+f*fw,T+5*gap+14],SL:s=>[L-6,T+s*gap,W-R,T+s*gap],RC:[L,T-14,W-L-R,5*gap+28],LB:s=>[12,T+s*gap+5],FN:f=>[L+(f-.5)*fw,H-8],IN:(f,k)=>[L+(f-.5)*fw,T+(k===0?2.5:k===1?1.5:3.5)*gap],BX:f0=>[L+Math.max(0,f0-1)*fw,T-14,(f0?4:3.5)*fw,5*gap+28],HL:s=>[4,T+s*gap-gap*.45,W-8,gap*.9],
   r:Math.min(14,fw*.38,gap*.42),inv:(x,y)=>({s:Math.max(0,Math.min(5,Math.round((y-T)/gap))),f:x<L?0:Math.min(NF,Math.floor((x-L)/fw)+1)})}}
 const L=44,R=18,lY=16,oY=40,y0=60,B=14,fh=(H-y0-B)/NF,cw=(W-L-R)/5,col=s=>L+(5-s)*cw;
 return {vert,W,H,P:(s,f)=>[col(s),f===0?oY:y0+(f-.5)*fh],FL:f=>[L-14,y0+f*fh,W-R+14,y0+f*fh],SL:s=>[col(s),y0-6,col(s),H-B],RC:[L-14,y0,W-R-L+28,NF*fh],LB:s=>[col(s),lY],FN:f=>[18,y0+(f-.5)*fh+5],IN:(f,k)=>[L+(k===0?2.5:k===1?1.5:3.5)*cw,y0+(f-.5)*fh],BX:f0=>[L-14,y0+Math.max(0,f0-1)*fh,W-R-L+28,(f0?4:3.5)*fh],HL:s=>[col(s)-cw*.45,oY-20,cw*.9,H-B-oY+20],
  r:Math.min(14,cw*.36,fh*.42),inv:(x,y)=>({s:Math.max(0,Math.min(5,5-Math.round((x-L)/cw))),f:y<y0?0:Math.min(NF,Math.floor((y-y0)/fh)+1)})};
}
function drawBoard(el){
 const o=el._o,svg=el.querySelector('svg');if(!o||!svg)return;const W=el.clientWidth;if(!W)return;
 const NF=o.frets||12,vert=!o.horiz&&W<560,H=vert?Math.round(74+NF*Math.max(34,Math.min(44,W/9))):Math.round(Math.max(W<560?150:220,Math.min(270,W*.3)));
 if(el._h!==H){el._h=H;el.style.height=H+'px'}
 const g=geo(W,H,NF,vert),lf=!!o.lefty,X_=x=>lf?W-x:x,RX=(x,w)=>lf?W-x-w:x;el._g={g,lf};
 let h=`<rect x="${RX(g.RC[0],g.RC[2])}" y="${g.RC[1]}" width="${g.RC[2]}" height="${g.RC[3]}" rx="4" fill="var(--wood)"/>`;
 if(o.hl!=null){const r=g.HL(o.hl);h+=`<rect x="${RX(r[0],r[2])}" y="${r[1]}" width="${r[2]}" height="${r[3]}" rx="8" fill="var(--fire)" opacity=".22"/>`}
 for(const b of o.box||[]){const r=g.BX(b);h+=`<rect x="${RX(r[0],r[2])}" y="${r[1]}" width="${r[2]}" height="${r[3]}" fill="var(--fire)" opacity=".22"/>`}
 for(let f=0;f<=NF;f++){const l=g.FL(f);h+=`<line x1="${X_(l[0])}" y1="${l[1]}" x2="${X_(l[2])}" y2="${l[3]}" stroke="${f?'#b9b3a8':'#efe8da'}" stroke-width="${f?2:6}"/>`}
 for(const f of [3,5,7,9,15])if(f<=NF){const c=g.IN(f,0);h+=`<circle cx="${X_(c[0])}" cy="${c[1]}" r="6" fill="#d9cdb6" opacity=".55"/>`}
 if(NF>=12)for(const k of [1,2]){const c=g.IN(12,k);h+=`<circle cx="${X_(c[0])}" cy="${c[1]}" r="6" fill="#d9cdb6" opacity=".55"/>`}
 for(let s=0;s<6;s++){const l=g.SL(s),lb=g.LB(s);h+=`<line x1="${X_(l[0])}" y1="${l[1]}" x2="${X_(l[2])}" y2="${l[3]}" stroke="#e7dfcf" stroke-width="${1+s*.45}"/><text x="${X_(lb[0])}" y="${lb[1]}" text-anchor="middle" font-size="13" fill="var(--mut)" font-weight="700">${nn(OPEN[s])}</text>`}
 for(let f=1;f<=NF;f++){const p=g.FN(f);h+=`<text x="${X_(p[0])}" y="${p[1]}" text-anchor="middle" font-size="13" fill="var(--mut)" font-weight="${[3,5,7,9,12,15].includes(f)?700:400}">${f}</text>`}
 for(const m of o.marks||[]){const p=g.P(m.s,m.f),c=KC[m.k]||KC.note,x=X_(p[0]);
  if(m.k==='target'){h+=`<circle class="pulse" cx="${x}" cy="${p[1]}" r="${g.r}" fill="var(--pearl)" stroke="var(--fire)" stroke-width="4"/>`;continue}
  h+=`<circle cx="${x}" cy="${p[1]}" r="${g.r}" fill="${c[0]}" stroke="${m.k==='ghost'?'#efe8da':'#00000033'}" ${m.k==='ghost'||m.k==='h0'?'stroke-dasharray="3 3"':''}/>`;
  if(m.t)h+=`<text x="${x}" y="${p[1]+4.5}" text-anchor="middle" font-size="${g.r<12?11:13}" font-weight="700" fill="${c[1]}">${esc(m.t)}</text>`}
 svg.innerHTML=h;
}
function boardTap(e){const el=e.currentTarget,o=el._o;if(!o||!o.tap||!el._g)return;const r=el.getBoundingClientRect(),{g,lf}=el._g;let x=e.clientX-r.left;if(lf)x=g.W-x;const p=g.inv(x,e.clientY-r.top);o.tap(p.s,p.f)}

/* ---------- microphone & pitch ---------- */
const Mic={on:false,cb:null,minHz:60,rms:0};
function micMsg(t){document.querySelectorAll('.micmsg').forEach(e=>e.textContent=t||'')}
function micUI(){document.querySelectorAll('[data-mic]').forEach(b=>{const tun=b.closest('#v-tuner');b.textContent=Mic.on?(tun?X().tuneStop:X().micOff):(tun?X().tuneStart:X().micOn)});document.querySelectorAll('.dotm').forEach(d=>d.classList.toggle('on',Mic.on))}
let micKeep=0;
async function getMicStream(){
 if(Mic.stream&&Mic.stream.getTracks().some(t=>t.readyState==='live'))return Mic.stream;
 aSess('play-and-record');
 const st=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});
 Mic.stream=st;store.set('pcz-mic','ok');return st;
}
async function micStart(){
 if(Mic.on)return true;micMsg('');try{actx()}catch(e){}
 if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){micMsg(X().micNA);return false}
 try{clearTimeout(micKeep);const st=await getMicStream();
  actx();if(ac.state!=='running')try{await ac.resume()}catch(e){}
  Mic.src=ac.createMediaStreamSource(st);Mic.an=ac.createAnalyser();Mic.an.fftSize=8192;Mic.src.connect(Mic.an);Mic.an2=ac.createAnalyser();Mic.an2.fftSize=4096;Mic.an2.smoothingTimeConstant=0;Mic.src.connect(Mic.an2);Mic.buf=new Float32Array(Mic.an.fftSize);Mic.on=true;Mic.t=setInterval(micTick,40);micUI();return true}
 catch(e){micMsg(e&&(e.name==='NotAllowedError'||e.name==='SecurityError')?X().micDenied:X().micNA);return false}
}
function micRelease(){try{if(Mic.stream)Mic.stream.getTracks().forEach(t=>t.stop())}catch(e){}Mic.stream=null;aSess('playback')}
function micStop(){if(!Mic.on)return;clearInterval(Mic.t);try{Mic.src.disconnect()}catch(e){}Mic.on=false;micUI();clearTimeout(micKeep);micKeep=setTimeout(()=>{if(!Mic.on)micRelease()},90000)}
document.addEventListener('visibilitychange',()=>{if(document.hidden&&!Mic.on)micRelease()});
function micTick(){Mic.an.getFloatTimeDomainData(Mic.buf);
 if(Mic.ccb){let r=0;const b=Mic.buf;for(let i=b.length-2048;i<b.length;i++)r+=b[i]*b[i];r=Math.sqrt(r/2048);const pr=Mic.crms||0;Mic.crms=r;Mic.ccb(chroma(Mic.fast?Mic.an2:Mic.an),r,r>pr*1.6&&r>0.004);return}
 const p=pitch(Mic.buf,ac.sampleRate,Mic.minHz);if(Mic.cb)Mic.cb(p)}
/* ---------- chord hearing: which of the 12 notes are sounding ---------- */
function chroma(an){
 an=an||Mic.an;if(!Mic.fb||Mic.fb.length!==an.frequencyBinCount)Mic.fb=new Float32Array(an.frequencyBinCount);
 const fb=Mic.fb;an.getFloatFrequencyData(fb);const bin=ac.sampleRate/an.fftSize,ch=new Float32Array(12);
 const lo=Math.ceil(72/bin),hi=Math.min(fb.length-2,Math.floor(1300/bin));let mx=-200;for(let i=lo;i<=hi;i++)if(fb[i]>mx)mx=fb[i];
 const pk=[];
 for(let i=lo;i<=hi;i++){const v=fb[i];if(v<mx-45||v<fb[i-1]||v<fb[i+1])continue;
  const a=fb[i-1],c=fb[i+1],d=(a-c)/(2*(a-2*v+c)||1),f=(i+d)*bin,m=69+12*Math.log2(f/440);pk.push({f,m,amp:Math.pow(10,(v-mx)/20)})}
 // overtones (3rd, 5th, 7th harmonic) of a lower note would add notes that aren't played, e.g. A + its 5th harmonic C# turns Am into A
 for(const q of pk){for(const lo2 of pk){if(lo2.f>=q.f)break;const h=q.f/lo2.f,hr=Math.round(h);if(hr>=3&&hr<=7&&hr!==4&&Math.abs(1200*Math.log2(h/hr))<25&&lo2.amp>q.amp*.3){q.amp*=hr===3||hr===6?.5:.12;break}}}
 for(const q of pk){const r=Math.round(q.m);if(Math.abs(q.m-r)>.4)continue;ch[((r%12)+12)%12]+=q.amp*q.amp*(q.m<64?1:q.m<76?.7:.45)}
 let t=0;for(const v of ch)t+=v;if(t>0)for(let i=0;i<12;i++)ch[i]/=t;return ch}
const pcsOf=c=>uniq(tones(c).map(t=>((c.root+t)%12+12)%12));
function chordFit(ch,c){const P=pcsOf(c);let inn=0,mn=1;for(const p of P){inn+=ch[p];mn=Math.min(mn,ch[p])}return inn+Math.min(mn,.12)*1.5-(1-inn)*.5}

function pitch(b,sr,minHz){
 const n=b.length>>1,c=new Float32Array(n);let rms=0,mean=0;for(let i=0;i<n;i++){const v=(b[2*i]+b[2*i+1])*.5;c[i]=v;mean+=v}mean/=n;for(let i=0;i<n;i++){c[i]-=mean;rms+=c[i]*c[i]}rms=Math.sqrt(rms/n);
 const prev=Mic.rms;Mic.rms=rms;if(rms<0.0018)return null;
 const s2=sr/2,tmin=Math.max(2,Math.floor(s2/1400)),tmax=Math.min(Math.floor(s2/(minHz*.85)),n-256),W=Math.min(2048,n-tmax);if(W<256)return null;
 const d=new Float32Array(tmax+2),raw=new Float32Array(tmax+2);let run=0;
 for(let t=1;t<=tmax+1;t++){let s=0;for(let j=0;j<W;j++){const x=c[j]-c[j+t];s+=x*x}raw[t]=s;run+=s;d[t]=run?s*t/run:1}
 // all local minima
 const mins=[];let gmin=1,gt=-1;for(let t=tmin;t<=tmax;t++){if(d[t]<=d[t-1]&&d[t]<=d[t+1]){mins.push(t);if(d[t]<gmin){gmin=d[t];gt=t}}}
 if(gt<0||gmin>0.35)return null;
 // first dip that is nearly as good as the best one -> avoids picking a sub-octave (e.g. high E read as A)
 let best=gt;const lim=Math.max(0.15,gmin+0.12);for(const t of mins){if(d[t]<lim){best=t;break}}
 // octave guard: if half / third of the period is also a clear dip, the real pitch is higher
 for(const k of [3,2]){const tk=Math.round(best/k);if(tk<tmin)continue;let bt=tk;for(let t=Math.max(tmin,tk-2);t<=Math.min(tmax,tk+2);t++)if(d[t]<d[bt])bt=t;if(d[bt]<Math.max(0.2,d[best]+0.08)&&d[bt]<=d[bt-1]&&d[bt]<=d[bt+1]){best=bt;break}}
 const x0=raw[best-1],x1=raw[best],x2=raw[best+1],den=2*(2*x1-x2-x0),sh=den?Math.max(-1,Math.min(1,(x2-x0)/den)):0,f=s2/(best+sh);
 return {f,midi:69+12*Math.log2(f/440),rms,clar:1-d[best],onset:rms>prev*1.7}
}
document.addEventListener('click',async e=>{const b=e.target.closest('[data-mic]');if(!b)return;if(Mic.on){micStop();return}await micStart();setMicCb()});

/* ---------- practice time ---------- */
function streak(){let n=0;const d=new Date();if((plog[today()]||0)<300)d.setDate(d.getDate()-1);for(;;){if((plog[dkey(d)]||0)>=300){n++;d.setDate(d.getDate()-1)}else break}return n}
setInterval(()=>{if(activeTrain&&view==='five'&&!document.hidden){const k=today();plog[k]=(plog[k]||0)+1;if(plog[k]%5===0)store.set('pcz-log',plog);if(typeof updToday==='function')updToday()}},1000);
document.addEventListener('gesturestart',e=>e.preventDefault(),{passive:false});document.addEventListener('dblclick',e=>{if(!e.target.closest('input,textarea'))e.preventDefault()},{passive:false});
