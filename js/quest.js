'use strict';
/* ---------- Cesta nauky: short drills that build fretboard + theory step by step ----------
   Every drill = one round of 8 small tasks (about 1–2 minutes). The microphone listens to what you
   play; without a mic you tap the note buttons. Stars unlock the next drill. A weekly check test
   shows real progress over weeks. */
let QST=store.get('pcz-quest',{}),QT=store.get('pcz-qtest',[]),Q=null;
const QN=8;
const sOf=s=>s+1; // string number (1 = thin e, index 0)
const strNm=s=>tr(`${sOf(s)}. struně (${nsh(OPENM[s])})`,`string ${sOf(s)} (${nsh(OPENM[s])})`);
const rnd2=a=>a[Math.floor(Math.random()*a.length)];
const COMMON=[0,2,4,5,7,9,11];
const scaleOf=(r,minor)=>(minor?[0,2,3,5,7,8,10]:[0,2,4,5,7,9,11]).map(i=>(r+i)%12);
const kname=(r,minor)=>withFlat(flatFor({t:r,minor}),()=>nn(r))+(minor?tr(' moll',' minor'):tr(' dur',' major'));
const pcName=(pc,r,minor)=>withFlat(flatFor({t:r,minor}),()=>nn(pc));

/* drills: id, group, title, what it teaches, task generator */
const QD=[
 {id:'f1',g:0,t:['Tóny na basových strunách','Notes on the bass strings'],w:['Kde je který tón na E a A struně. Na nich leží základy skoro všech akordů.','Where each note is on the E and A strings, the roots of almost every chord.'],gen:()=>qNote([5,4],true)},
 {id:'c4',g:1,t:['Z čeho je akord','What a chord is made of'],w:['Akord jsou tři tóny. Poznáš ho podle nich.','A chord is three notes. Recognise it by them.'],gen:qChordQuiz},
 {id:'p1',g:2,t:['Pentatonika: box 1','Pentatonic: box 1'],w:['První stupnice skoro každého kytaristy. Jeden tvar, který posuneš a máš novou tóninu. Ze 5 tónů je většina rockových a bluesových sól.','Almost every guitarist’s first scale. One shape: slide it and you’re in a new key. Most rock and blues solos come from these 5 notes.'],gen:qBox,n:3},
 {id:'f2',g:0,t:['Oktávy','Octaves'],w:['Stejný tón o patro výš: o 2 struny a 2 pražce dál. Tímhle trikem najdeš každý tón všude.','The same note one floor up: 2 strings over, 2 frets up. This trick finds any note anywhere.'],gen:()=>qOct(false)},
 {id:'c1',g:1,t:['Postav durový akord','Build a major chord'],w:['Dur = 1 + 3 + 5. Trojka je 4 pražce nad základem, pětka 7 pražců.','Major = 1 + 3 + 5. The 3 is 4 frets above the root, the 5 is 7 frets.'],gen:()=>qBuild('M')},
 {id:'c2',g:1,t:['Postav mollový akord','Build a minor chord'],w:['Moll = trojka o pražec níž (3 pražce). Ten jeden pražec dělá smutek.','Minor = the 3 one fret lower (3 frets). That one fret is the sadness.'],gen:()=>qBuild('m')},
 {id:'s4',g:2,t:['Pentatonika od kteréhokoli tónu','Pentatonic from any note'],w:['Stejných 5 tónů, ale teď je musíš najít sám. Tím se z tvaru stává znalost.','The same 5 notes, but now you find them yourself. That turns a shape into knowledge.'],gen:()=>qScale('pent')},
 {id:'s1',g:2,t:['Durová stupnice','The major scale'],w:['Celý–celý–půl–celý–celý–celý–půl. Z téhle řady jsou postavené skoro všechny písničky.','Whole–whole–half–whole–whole–whole–half. Almost every song is built from it.'],gen:()=>qScale('maj')},
 {id:'r1',g:2,t:['Paralelní moll','The relative minor'],w:['Každá durová stupnice má mollovou dvojče se stejnými tóny (C dur = A moll). Umíš jednu, umíš obě.','Every major scale has a minor twin with the same notes (C major = A minor). Know one, know both.'],gen:qRel},
 {id:'f3',g:0,t:['Tóny na všech strunách','Notes on every string'],w:['Celý hmatník do 12. pražce, jen tóny bez křížků.','The whole neck up to fret 12, natural notes.'],gen:()=>qNote([0,1,2,3,4,5],true)},
 {id:'s2',g:2,t:['Stupně v tónině','Degrees in a key'],w:['Kterému tónu říkáme pětka nebo čtyřka. Tak mluví muzikanti.','Which note is the five or the four. That’s how musicians talk.'],gen:qDeg},
 {id:'s3',g:2,t:['Akordy v tónině','Chords in a key'],w:['Každá tónina má 6 hlavních akordů. Když je znáš, odhadneš akordy písničky dopředu.','Every key has 6 main chords. Know them and you can guess a song’s chords ahead.'],gen:qKeyChords},
 {id:'i1',g:3,t:['Kvinta (power chord)','The fifth (power chord)'],w:['Pětka nad tónem: o strunu níž, o 2 pražce dál. Základ rocku.','Five above a note: one string over, 2 frets up. The base of rock.'],gen:()=>qInt([7])},
 {id:'f2b',g:0,t:['Oktávy po celém krku','Octaves all over'],w:['Oktávy i z D a G struny. Pozor, kvůli H struně je to o 3 pražce.','Octaves from the D and G strings too. Careful: because of the B string it’s 3 frets.'],gen:()=>qOct(true)},
 {id:'i2',g:3,t:['Velká a malá tercie','Major and minor thirds'],w:['Tercie rozhoduje, jestli je akord veselý (4 pražce) nebo smutný (3 pražce).','The third decides if a chord is happy (4 frets) or sad (3 frets).'],gen:()=>qInt([3,4])},
 {id:'c3',g:1,t:['Sedmičkové akordy','Seventh chords'],w:['K akordu přidáš sedmičku (o 2 pražce pod oktávou) a zní napjatě, bluesově.','Add the seven (2 frets below the octave) and it sounds tense and bluesy.'],gen:()=>qBuild('7')},
 {id:'f5',g:0,t:['Celý hmatník i s křížky','The whole neck, sharps too'],w:['Všech 12 tónů na všech strunách. Mistrovská disciplína.','All 12 notes on every string. The master level.'],gen:()=>qNote([0,1,2,3,4,5],false)}
];
const QG=[['Hmatník','Fretboard'],['Akordy','Chords'],['Stupnice a tóniny','Scales & keys'],['Intervaly','Intervals']];
const qStart=()=>{const id={beg:'f1',mid:'c1',adv:'s2'}[level||'beg'];return QD.findIndex(d=>d.id===id)};
const qStars=id=>(QST[id]&&QST[id].st)||0;
const qOpen=i=>i<=qStart()||qStars(QD[i-1].id)>=2||qStars(QD[i].id)>0;
function qCurrent(){const st=qStart();for(let i=st;i<QD.length;i++)if(qOpen(i)&&qStars(QD[i].id)<2)return i;for(let i=0;i<st;i++)if(qStars(QD[i].id)<2)return i;
 // everything has 2+ stars: review the one practised longest ago
 let b=0,bt=1e15;QD.forEach((d,i)=>{const t=(QST[d.id]&&QST[d.id].last)||0;if(t<bt){bt=t;b=i}});return b}

/* --- task generators --- */
function qNote(strs,natural){
 const s=rnd2(strs);let f,pc;do{f=Math.floor(Math.random()*13);pc=(OPEN[s]+f)%12}while(natural&&!NAT.includes(pc));
 const m=OPENM[s]+f,want=[m];if(f===0)want.push(m+12);if(f===12)want.push(m-12);
 return {kind:'midi',want,pr:tr(`Zahraj <b>${nsh(pc)}</b> na ${strNm(s)}`,`Play <b>${nsh(pc)}</b> on ${strNm(s)}`),
  board:{marks:[]},show:{s,f,t:nsh(pc)},rec:[s,f],hint:tr(`Počítej od prázdné struny ${nsh(OPENM[s])}: mezi E–F a H–C je jen 1 pražec, jinde 2.`,`Count up from the open ${nsh(OPENM[s])}: E–F and B–C are 1 fret apart, everything else 2.`)}
}
function qOct(all){
 const ss=all?[5,4,3,2]:[5,4],s=rnd2(ss),f=Math.floor(Math.random()*(all?8:9))+ (all?1:0),m=OPENM[s]+f,pc=m%12,s2=s-2,f2=f+(s2<=1?3:2);
 return {kind:'midi',want:[m+12],pr:tr(`Tohle je <b>${nsh(pc)}</b>. Zahraj stejný tón <b>o oktávu výš</b>`,`This is <b>${nsh(pc)}</b>. Play the same note <b>one octave higher</b>`),
  board:{marks:[{s,f,k:'home',t:nsh(pc)}]},show:{s:s2,f:f2,t:nsh(pc)},hint:s2<=1?tr('O 2 struny níž a o 3 pražce dál (kvůli struně H).','Two strings over and 3 frets up (because of the B string).'):tr('O 2 struny níž a o 2 pražce dál.','Two strings over and 2 frets up.')}
}
function qInt(ivs){
 const iv=rnd2(ivs),s=rnd2([5,4,3]),f=Math.floor(Math.random()*8)+2,m=OPENM[s]+f,pc=m%12,tm=m+iv,s2=s-1,f2=tm-OPENM[s2];
 const nm={7:tr('kvintu (pětku)','the fifth'),4:tr('velkou tercii (veselou)','the major third (happy)'),3:tr('malou tercii (smutnou)','the minor third (sad)')}[iv];
 return {kind:'midi',want:[tm],pr:tr(`Od <b>${nsh(pc)}</b> zahraj ${nm} nahoru`,`From <b>${nsh(pc)}</b> play ${nm} up`),
  board:{marks:[{s,f,k:'home',t:nsh(pc)}]},show:{s:s2,f:f2,t:nsh(tm)},after:tr(`${nsh(pc)} + ${nsh(tm)}${iv===7?' = power chord '+nsh(pc)+'5':''}`,`${nsh(pc)} + ${nsh(tm)}${iv===7?' = power chord '+nsh(pc)+'5':''}`),
  hint:iv===7?tr('Na vedlejší tenčí struně o 2 pražce dál.','Next thinner string, 2 frets up.'):iv===4?tr('Na vedlejší tenčí struně o 1 pražec zpět.','Next thinner string, 1 fret back.'):tr('Na vedlejší tenčí struně o 2 pražce zpět.','Next thinner string, 2 frets back.'),
  ivPlay:[m,tm]}
}
function qBuild(q){
 const r=rnd2(q==='7'?[7,9,2,4,0]:COMMON),iv=q==='M'?[0,4,7]:q==='m'?[0,3,7]:[0,4,7,10],seq=iv.map(i=>(r+i)%12),lab=q==='7'?['1','3','5','♭7']:['1',q==='m'?'♭3':'3','5'];
 const nm=withFlat(flatFor({t:r,minor:q==='m'}),()=>nn(r))+(q==='m'?'m':q==='7'?'7':'');
 return {kind:'seq',seq,lab,names:seq.map(p=>withFlat(flatFor({t:r,minor:q==='m'}),()=>nn(p))),pr:tr(`Postav <b>${nm}</b>: zahraj po jednom tóny ${lab.join(' – ')}`,`Build <b>${nm}</b>: play its notes ${lab.join(' – ')} one by one`),
  hint:tr(`Začni na ${nn(r)}. ${q==='m'?'Malá tercie = +3 pražce':'Tercie = +4 pražce'}, kvinta = +7 pražců${q==='7'?', sedmička = +10 pražců (2 pod oktávou)':''}, vše na jedné struně.`,`Start on ${nn(r)}. ${q==='m'?'Minor third = +3 frets':'Third = +4 frets'}, fifth = +7 frets${q==='7'?', seventh = +10 frets (2 below the octave)':''}, all on one string.`),
  chord:C0(r,q==='7'?'M':q,q==='7'?'7':'')}
}
function qScale(kind){
 const r=kind==='pent'?rnd2([9,4,2,7,11]):rnd2([0,7,2,9,4,5]),seq=kind==='pent'?[0,3,5,7,10,12].map(i=>(r+i)%12):[0,2,4,5,7,9,11,12].map(i=>(r+i)%12),minor=kind==='pent';
 const names=seq.map(p=>pcName(p,r,minor)),lab=kind==='pent'?['1','♭3','4','5','♭7','1']:['1','2','3','4','5','6','7','1'];
 return {kind:'seq',seq,lab,names,pr:kind==='pent'?tr(`Zahraj <b>${pcName(r,r,true)} mollovou pentatoniku</b> nahoru, tón po tónu`,`Play the <b>${pcName(r,r,true)} minor pentatonic</b> up, note by note`):tr(`Zahraj stupnici <b>${kname(r,false)}</b> nahoru, tón po tónu`,`Play the <b>${kname(r,false)}</b> scale up, note by note`),
  hint:kind==='pent'?tr('Kroky: +3, +2, +2, +3, +2 pražce.','Steps: +3, +2, +2, +3, +2 frets.'):tr('Kroky v pražcích: 2 2 1 2 2 2 1.','Steps in frets: 2 2 1 2 2 2 1.'),scaleRoot:r,len:kind==='pent'?1:2}
}
function qDeg(){
 const r=rnd2([0,7,2,9,4,5]),d=rnd2(level==='beg'?[4,7]:[2,3,4,5,6,7]),sc=scaleOf(r,false),pc=sc[d-1];
 return {kind:'pc',want:[pc],pr:tr(`V tónině <b>${kname(r,false)}</b> zahraj <b>${d}. stupeň</b>`,`In <b>${kname(r,false)}</b> play degree <b>${d}</b>`),name:pcName(pc,r,false),
  hint:tr(`Stupnice ${kname(r,false)}: ${sc.map(p=>pcName(p,r,false)).join(' ')}. Počítej od 1.`,`${kname(r,false)} scale: ${sc.map(p=>pcName(p,r,false)).join(' ')}. Count from 1.`)}
}
function qKeyChords(){
 const r=rnd2([0,7,2,9,4,5]),deg=rnd2([1,2,3,4,5,6]),sc=scaleOf(r,false),q=[0,'M','m','m','M','M','m'][deg],ok=C0(sc[deg-1],q),RN=['','I','ii','iii','IV','V','vi'];
 const wrong=[C0(sc[deg-1],q==='M'?'m':'M'),C0((sc[deg-1]+1)%12,q),C0(sc[(deg+1)%7],q)];
 const nm=c=>withFlat(flatFor({t:r,minor:false}),()=>cname(c));
 const opts=[nm(ok)];for(const w of wrong){const n=nm(w);if(!opts.includes(n)&&opts.length<3)opts.push(n)}
 return {kind:'choice',opts,ok:0,pr:tr(`V tónině <b>${kname(r,false)}</b> je akord <b>${RN[deg]}</b> (${deg}. stupeň)…`,`In <b>${kname(r,false)}</b> the <b>${RN[deg]}</b> chord (degree ${deg}) is…`),
  why:tr(`Akordy ${kname(r,false)}: ${[1,2,3,4,5,6].map(i=>nm(C0(sc[i-1],[0,'M','m','m','M','M','m'][i]))).join(' ')}. Vzorec je vždy dur–moll–moll–dur–dur–moll.`,`Chords of ${kname(r,false)}: ${[1,2,3,4,5,6].map(i=>nm(C0(sc[i-1],[0,'M','m','m','M','M','m'][i]))).join(' ')}. The pattern is always major–minor–minor–major–major–minor.`),play:[ok]}
}
function qChordQuiz(){
 const r=rnd2(COMMON),q=rnd2(['M','m']),c=C0(r,q),tn=tones(c).map(t=>nsh(r+t));
 const nm=x=>withFlat(false,()=>cname(x));
 const opts=[nm(c),nm(C0(r,q==='M'?'m':'M')),nm(q==='M'?C0(r+4,'m'):C0(r+3,'M'))];
 return {kind:'choice',opts,ok:0,pr:tr(`Tóny <b>${tn.join(' – ')}</b> dohromady tvoří akord…`,`The notes <b>${tn.join(' – ')}</b> together make the chord…`),
  why:tr(`${nm(c)} = ${tn.join(' ')}. Základ ${tn[0]}, ${q==='m'?'malá tercie (3 pražce) = moll':'velká tercie (4 pražce) = dur'}.`,`${nm(c)} = ${tn.join(' ')}. Root ${tn[0]}, ${q==='m'?'minor third (3 frets) = minor':'major third (4 frets) = major'}.`),play:[c]}
}

function qBox(){
 // minor pentatonic box 1: root on the low E string at fret p
 const opts=[[9,5],[7,3],[0,8],[5,1],[11,7],[6,2],[4,0]],[r,p]=rnd2(opts),shape=[[5,0],[5,3],[4,0],[4,2],[3,0],[3,2],[2,0],[2,2],[1,0],[1,3],[0,0],[0,3]];
 const pos=shape.map(([s2,d])=>({s:s2,f:p+d})),mseq=pos.map(q=>OPENM[q.s]+q.f),lab=['1','♭3','4','5','♭7','1','♭3','4','5','♭7','1','♭3'];
 const nm=pcName(r,r,true);
 return {kind:'seq',midi:true,mseq,seq:mseq.map(m=>m%12),pos,lab,names:mseq.map(m=>pcName(m%12,r,true)),root:r,
  pr:tr(`<b>${nm} moll pentatonika</b> od ${p?p+'. pražce':'prázdných strun'}. Zahraj ji zdola nahoru, tón po tónu`,`<b>${nm} minor pentatonic</b> from ${p?'fret '+p:'the open strings'}. Play it low to high, note by note`),
  hint:tr('Na každé struně 2 tóny. Ukazováček drží spodní pražec, prsteníček nebo malíček horní.','Two notes per string. Index finger on the low fret, ring or pinky finger on the high one.'),after:tr(`Stejný tvar posunutý jinam = jiná tónina. Základ ${nm} je na 6. struně.`,`Same shape moved = a different key. The root ${nm} is on string 6.`)}
}
function qRel(){
 const r=rnd2([0,7,2,5,9,4]),rm=(r+9)%12;
 if(Math.random()<.5){const maj=Math.random()<.5;
  const nm=c=>withFlat(flatFor({t:r,minor:false}),()=>cname(c));
  const ok=maj?nm(C0(rm,'m')):nm(C0(r,'M')),w1=maj?nm(C0(r+4,'m')):nm(C0(rm+4,'M')),w2=maj?nm(C0(r+2,'m')):nm(C0(rm+2,'M'));
  return {kind:'choice',opts:[ok,w1,w2],ok:0,pr:maj?tr(`Paralelní moll k <b>${kname(r,false)}</b> je…`,`The relative minor of <b>${kname(r,false)}</b> is…`):tr(`Paralelní dur k <b>${kname(rm,true)}</b> je…`,`The relative major of <b>${kname(rm,true)}</b> is…`),
   why:tr(`Paralelní moll leží o 3 pražce níž (o malou tercii). ${kname(r,false)} a ${kname(rm,true)} mají stejné tóny: ${scaleOf(r,false).map(p=>pcName(p,r,false)).join(' ')}.`,`The relative minor is 3 frets lower (a minor third). ${kname(r,false)} and ${kname(rm,true)} share the same notes: ${scaleOf(r,false).map(p=>pcName(p,r,false)).join(' ')}.`),play:[C0(r,'M'),C0(rm,'m')]}}
 const seq=[0,2,3,5,7,8,10,12].map(i=>(rm+i)%12);
 return {kind:'seq',seq,lab:['1','2','♭3','4','5','♭6','♭7','1'],names:seq.map(p=>pcName(p,r,false)),pr:tr(`Zahraj stupnici <b>${kname(rm,true)}</b> nahoru, tón po tónu`,`Play the <b>${kname(rm,true)}</b> scale up, note by note`),
  hint:tr(`Má stejné tóny jako ${kname(r,false)}, jen začneš na ${pcName(rm,r,false)}.`,`Same notes as ${kname(r,false)}, you just start on ${pcName(rm,r,false)}.`)}
}
/* --- round engine --- */
function qBegin(i,test){
 stopAll();const d=QD[i];FV={scr:'quest',plan:FV.plan};activeTrain='quest';
 Q={i,test:!!test,n:test?10:(QD[i].n||QN),k:0,score:0,miss:0,t0:Date.now(),tt:Date.now(),task:null,heard:'',log:[]};
 if(test){const pool=QD.map((d2,j)=>j).filter(j=>qOpen(j)&&['f1','f3','f5','f2','s2','s3','c4','i1','i2','r1'].includes(QD[j].id));Q.pool=pool.length?pool:[0]}
 qNext();if(store.get('pcz-mic',null)!=='later'&&!Mic.on)micStart().then(ok=>{Q&&(Q.mic=ok);setMicCb();qRender()});else{Q.mic=Mic.on;setMicCb()}
}
function qNext(){const g=Q.test?QD[rnd2(Q.pool)].gen:QD[Q.i].gen;let t;let n=0;do{t=g();n++}while(Q.task&&n<6&&t.pr===Q.task.pr);Q.task=t;t.j=0;t.miss=0;t.done=false;t.rev=false;Q.heard='';Q.tt=Date.now();Q.gap=false;Q.lm=null;Q.st=0;qRender()}
function qHear(p){
 if(!Q||!Q.task||Q.task.done||Q.task.kind==='choice')return;
 if(!p||p.clar<0.8){Q.gap=true;Q.st=0;return}
 const m=Math.round(p.midi);if(p.onset)Q.gap=true;
 if(m===Q.lm)Q.st++;else{Q.lm=m;Q.st=1}
 if(Q.st!==3||!Q.gap)return;Q.gap=false;qAnswer(m,true);
}
function qAnswer(m,fromMic){
 const t=Q.task,pc=((m%12)+12)%12;if(!t||t.done)return;Q.heard=nsh(pc);
 let ok=false;
 if(t.kind==='midi')ok=t.want.includes(m)||(!fromMic&&t.want.some(w=>w%12===pc));
 else if(t.kind==='pc')ok=pc===t.want[0];
 else if(t.kind==='seq'){if(t.midi?(m===t.mseq[t.j]||(!fromMic&&pc===t.seq[t.j]&&false)):pc===t.seq[t.j]){t.j++;if(t.j>=t.seq.length)ok=true;else{qRender();return}}else{t.miss++;qFlash(false);qRender();return}}
 if(ok){t.done=true;const pts=t.rev?0:t.miss===0?1:t.miss===1?.6:.3;Q.score+=pts;Q.log.push({ok:pts>=.6,ms:Date.now()-Q.tt});if(t.rec&&typeof rec==='function')rec(t.rec[0],t.rec[1],t.miss===0&&!t.rev);
  if(!fromMic)pling(m);if(t.chord)setTimeout(()=>play([t.chord]),500);if(t.ivPlay)setTimeout(()=>play(t.ivPlay,null,.5,true),450);
  qFlash(true);qRender();clearTimeout(Q.to);Q.to=setTimeout(qAdvance,t.kind==='seq'?1800:1100)}
 else{t.miss++;if(t.rec&&t.miss===1&&typeof rec==='function')rec(t.rec[0],t.rec[1],false);qFlash(false);qRender()}
}
function qChoice(k){const t=Q.task;if(t.done)return;if(k===t.ok){t.done=true;const pts=t.miss?(t.miss===1?.5:.2):1;Q.score+=pts;Q.log.push({ok:!t.miss,ms:Date.now()-Q.tt});if(t.play)play(t.play)}else{t.miss++;t.bad=(t.bad||[]).concat(k)}qRender()}
function qReveal(){const t=Q.task;t.rev=true;if(t.kind==='seq'){}qRender()}
function qSkip(){const t=Q.task;if(!t.done){Q.log.push({ok:false,ms:Date.now()-Q.tt});t.done=true}qAdvance()}
function qAdvance(){if(!Q)return;clearTimeout(Q.to);Q.k++;if(Q.k>=Q.n)return qFinish();qNext()}
function qFlash(ok){const el=document.querySelector('.qcard');if(!el)return;el.classList.remove('good','bad');void el.offsetWidth;el.classList.add(ok?'good':'bad')}
function qFinish(){
 const acc=Q.score/Q.n,secs=Math.round((Date.now()-Q.t0)/1000),avg=Q.log.length?Q.log.reduce((a,b)=>a+b.ms,0)/Q.log.length/1000:0;
 const st=acc>=.95&&avg<=8?3:acc>=.8?2:acc>=.6?1:0;Q.res={acc,secs,st,avg};
 if(Q.test){QT.push({d:today(),sc:Math.round(acc*100),avg:Math.round(avg*10)/10});QT=QT.slice(-40);store.set('pcz-qtest',QT)}
 else{const id=QD[Q.i].id,o=QST[id]||{st:0,best:0,n:0};const was=o.st;o.st=Math.max(o.st,st);o.best=Math.max(o.best,Math.round(acc*100));o.n++;o.last=Date.now();QST[id]=o;store.set('pcz-quest',QST);Q.newOpen=was<2&&st>=2&&Q.i+1<QD.length;if(FV.plan)markPlan('notes')}
 Q.done=true;qRender();
}
function qRender(){
 const el=$('fiveC');if(!el||FV.scr!=='quest'||!Q)return;const x=X();
 if(Q.done){const r=Q.res,d=QD[Q.i];
  el.innerHTML=head(Q.test?x.qTest:tr(d.t[0],d.t[1]))+`<div class="qres"><div class="qstars">${Q.test?`<b class="big">${Math.round(r.acc*100)}</b><small>/ 100</small>`:[1,2,3].map(i=>`<i class="${i<=r.st?'on':''}">★</i>`).join('')}</div>
  <p class="body">${Q.test?x.qTestRes(Math.round(r.acc*100),r.avg.toFixed(1),qTestPrev()):r.st>=2?x.qGood:r.st===1?x.qOk:x.qTry}</p>
  <p class="t">${x.qStat(Math.round(r.acc*100),r.secs)}</p>${Q.newOpen?`<p class="qnew">🔓 ${x.qUnlocked(tr(QD[Q.i+1].t[0],QD[Q.i+1].t[1]))}</p>`:''}</div>
  <div class="lbar static">${FV.plan?nextBtn():`<button data-q="path">${x.qPath}</button>`}<button class="${FV.plan?'':'fire'}" data-q="again">${x.again}</button>${!FV.plan&&Q.newOpen?`<button class="fire" data-q="next">${x.qNextDrill}</button>`:''}</div>`;
  bindHead();qBind();return}
 const t=Q.task,d=QD[Q.i];
 const marks=(t.board&&t.board.marks||[]).slice();
 if((t.done||t.rev)&&t.show)marks.push({s:t.show.s,f:t.show.f,k:'good',t:t.show.t});
 let body='';
 if(t.kind==='seq'&&!t.midi)body=`<div class="qseq">${t.seq.map((p,i)=>`<span class="${i<t.j?'dn':i===t.j?'on':''}"><small>${t.lab[i]}</small><b>${i<t.j||t.rev||t.done?esc(t.names[i]):'?'}</b></span>`).join('')}</div>`;
 if(t.kind==='choice')body=`<div class="opts qopts">${t.opts.map((o,i)=>`<button data-qc="${i}" class="${t.done&&i===t.ok?'ok':(t.bad||[]).includes(i)?'no':''}">${esc(o)}</button>`).join('')}</div>${t.done?`<p class="qfb">${x.right} ${t.why}</p>`:''}`;
 const showBoard=t.kind==='midi'||(t.kind==='seq'&&t.midi);
 if(t.kind==='seq'&&t.midi){const showAll=Q.k===0||t.rev||t.miss>=2;t.pos.forEach((q,i)=>{if(i<t.j)marks.push({s:q.s,f:q.f,k:'good',t:t.names[i]});else if(i===t.j&&(showAll||t.seq[i]===t.root))marks.push({s:q.s,f:q.f,k:'home',t:t.lab[i]});else if(showAll||t.seq[i]===t.root)marks.push({s:q.s,f:q.f,k:t.seq[i]===t.root?'home':'note',t:t.lab[i]})})}
 el.innerHTML=head(Q.test?x.qTest:tr(d.t[0],d.t[1]))+`<div class="qprog" style="grid-template-columns:repeat(${Q.n},1fr)">${Array.from({length:Q.n},(_,i)=>`<i class="${i<Q.k?'dn':i===Q.k?'on':''}"></i>`).join('')}</div>
 <div class="qcard"><p class="qpr">${t.pr}</p>${body}
 ${showBoard?`<div class="fbwrap"><div class="fb" id="qfb"><svg></svg></div></div>`:''}
 ${t.kind!=='choice'?`<div class="qheard">${showBoard&&!Q.mic&&!t.done?(Q.heard?x.qTapWas(Q.heard):x.qTap):Q.mic?`<span class="dotm on"></span> ${t.done?'✓ '+(t.after||x.right):Q.heard?x.heard(Q.heard)+(t.miss?' · '+x.qNotYet:''):x.qListen}`:t.done?'✓ '+(t.after||x.right):''}</div>`:''}
 ${(t.rev||t.miss>=2)&&!t.done&&t.hint?`<p class="qhint">💡 ${t.hint}</p>`:''}</div>
 ${!Q.mic&&(t.kind==='pc'||(t.kind==='seq'&&!t.midi))&&!t.done?`<div class="qkeys">${[...Array(12).keys()].map(p=>`<button data-qk="${p}">${nsh(p)}</button>`).join('')}</div>`:''}
 <div class="lbar static">${t.kind!=='choice'&&!t.done?`<button data-q="hint">${x.qHintB}</button>`:''}${t.done&&t.kind==='choice'?`<button class="fire" data-q="adv">${x.cont}</button>`:`<button data-q="skip">${t.done?x.cont:x.qSkip}</button>`}</div>`;
 bindHead();qBind();
 if(showBoard)setBoard($('qfb'),{frets:12,marks,box:[],lefty,horiz:true,tap:t.done?null:(s2,f)=>qAnswer(OPENM[s2]+f,true)});
}
function qBind(){
 const el=$('fiveC');
 el.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>{const a=b.dataset.q;
  if(a==='hint'){if(Q.task.miss<2)Q.task.miss=Math.max(Q.task.miss,0);qReveal()}else if(a==='skip')qSkip();else if(a==='adv')qAdvance();
  else if(a==='again')qBegin(Q.i,Q.test);else if(a==='next')qBegin(Q.i+1);else if(a==='path'){Q=null;fiveGo('path')}});
 el.querySelectorAll('[data-qc]').forEach(b=>b.onclick=()=>qChoice(+b.dataset.qc));
 el.querySelectorAll('[data-qk]').forEach(b=>b.onclick=()=>{const pc=+b.dataset.qk,t=Q.task;let m=pc+60;if(t.kind==='midi'){const w=t.want.find(w=>w%12===pc);m=w!=null?w:pc+48}qAnswer(m,false)});
}
function qTestPrev(){const p=QT.slice(0,-1);return p.length?p[p.length-1].sc:null}

/* --- the path screen --- */
function renderPath(){
 const x=X(),el=$('fiveC'),cur=qCurrent(),tot=QD.reduce((a,d)=>a+qStars(d.id),0);
 const last=QT[QT.length-1],first=QT[0];
 el.innerHTML=head(x.qPathT)+`<p class="muted">${x.qPathSub}</p>
 <button class="fire big" id="qGo">${x.qGo(tr(QD[cur].t[0],QD[cur].t[1]))}</button>
 <div class="qtest"><div><b>${x.qTest}</b><small>${last?x.qTestLast(last.sc,first&&QT.length>1?last.sc-first.sc:null):x.qTestNone}</small></div><button id="qTestGo">${x.qTestBtn}</button></div>
 ${QT.length>1?`<div class="qchart">${QT.slice(-12).map(r=>`<i style="height:${Math.max(4,r.sc)}%" title="${r.d}: ${r.sc}"></i>`).join('')}</div>`:''}
 <div class="lbl" style="margin-top:14px">${x.qStarsT(tot,QD.length*3)}</div>
 <div class="qpath">${QD.map((d,i)=>{const op=qOpen(i),s=qStars(d.id);return `<button class="qn${i===cur?' cur':''}${op?'':' lock'}" data-qi="${i}" ${op?'':'disabled'}><span class="qi">${op?i+1:'🔒'}</span><span class="qt"><b>${tr(d.t[0],d.t[1])}</b><small>${tr(QG[d.g][0],QG[d.g][1])} · ${tr(d.w[0],d.w[1])}</small></span><span class="qs">${[1,2,3].map(k=>`<i class="${k<=s?'on':''}">★</i>`).join('')}</span></button>`}).join('')}</div>`;
 bindHead();
 $('qGo').onclick=()=>qBegin(cur);$('qTestGo').onclick=()=>qBegin(cur,true);
 el.querySelectorAll('[data-qi]').forEach(b=>b.onclick=()=>qBegin(+b.dataset.qi));
}
