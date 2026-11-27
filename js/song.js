'use strict';
/* ---------- song view: Hraj · Rozbor · Sólo ---------- */
let pcapo=store.get('pcz-capo',{}),fsz=store.get('pcz-fs',18),scrSpd=store.get('pcz-scroll2',3),scrOn=false,scrRaf=0,wake=null,playCh=[],adjOpen=false,camp=false;
let simpOn=store.get('pcz-simp',{});
const simp=c=>({root:c.root,q:c.q==='m'||c.q==='d'?'m':'M',ext:'',bass:null});
const isSimp=()=>!!simpOn[cur];
let opened=store.get('pcz-opened',{}),ssort=store.get('pcz-ssort','recent');
const gq=t=>`<button class="q" data-g="${t}" aria-label="?">?</button>`;
const REPS=()=>[X().rep0,X().rep1,X().rep2,X().rep3];
function repChip(id){const r=rep[id]||0;return `<button class="rep r${r}" data-rep="${esc(id)}">${REPS()[r]}</button>`}
function stepper(id,label,val){return `<div class="stp"><span class="muted">${label}</span><div class="row"><button class="sq" data-st="${id}" data-d="-1" aria-label="-">−</button><output data-o="${id}">${val}</output><button class="sq" data-st="${id}" data-d="1" aria-label="+">+</button></div></div>`}
function renderSong(){
 stopPlay();regN=0;analyze();
 $('pickN').textContent=curSong().name||'—';
 if(sub==='why')sub='chords';
 document.querySelectorAll('#sub button').forEach(b=>b.classList.toggle('on',b.dataset.s===sub));
 ['play','chords','solo'].forEach(p=>$('p-'+p).hidden=p!==sub);
 if(sub==='play')renderPlay();else stopScroll();
 renderChords();renderWhy();drawSolo();wakeSync();
}
/* --- Hraj (songbook) --- */
function chipFor(c0){const c=isSimp()?simp(c0):c0,t=tp(c,shift),cp=pcapo[cur]||0,i=playCh.length;playCh.push(tp(t,-cp));return {html:`<button class="ch" data-chi="${i}">${esc(cname(t,cp))}</button>`,len:cname(t,cp).length}}
function songBody(text){
 return (text||'').split(/\r?\n/).map(line=>{
  if(/\[[^\]]+\]/.test(line))return '<div class="ln">'+line.split(/(\[[^\]]+\])/).map(seg=>{const m=/^\[([^\]]+)\]$/.exec(seg);if(m){const c=chord(m[1]);return c?chipFor(c).html:esc(seg)}return esc(seg)}).join('')+'</div>';
  if(isChordLine(line)){let debt=0;return '<div class="ln cl">'+line.split(/(\s+)/).map(tok=>{if(!tok)return '';if(/^\s+$/.test(tok)){const n=Math.max(1,tok.length-debt);debt=Math.max(0,debt-(tok.length-1));return ' '.repeat(n)}const c=chord(tok);if(!c)return esc(tok);const ch=chipFor(c),d=ch.len-tok.length;if(d<0)return ch.html+' '.repeat(-d);debt+=d;return ch.html}).join('')+'</div>'}
  return `<div class="ln">${esc(line)||'&nbsp;'}</div>`;
 }).join('');
}
const diffS=c=>vFor(c).l;
const ckey2=c=>c.root+'|'+c.q+'|'+c.ext;
function renderPlay(){
 const x=X(),cp=pcapo[cur]||0,best=capos(A.us)[0];playCh=[];
 const body=songBody(curSong().text);
 const shapes=uniq(playCh.map(c=>ckey2(c))).map(k=>playCh.find(c=>ckey2(c)===k));
 const welcome=!mine.length?`<div class="welcome"><div class="wrow"><b>${x.welcomeT}</b><button class="fire" id="wAdd">${x.welcomeBtn}</button></div><details><summary>${x.welcomeHow}</summary><ol>${x.welcomeSteps.map(s=>`<li>${s}</li>`).join('')}</ol></details></div>`:'';
 const status=[isSimp()?`<button class="pill" id="simpX">${x.simpPill} ✕</button>`:'',cp?`<span class="pill">${x.capoShort} ${cp}</span>`:'',shift?`<span class="pill">${x.transposed(shift)}</span>`:''].join('');
 $('p-play').innerHTML=welcome+`<div class="pbar">
  <button class="${scrOn?'fire':'pri'}" id="scrBtn">${scrOn?x.scrStop:x.scrGo}</button>
  ${scrOn?`<div class="spd" aria-label="${esc(x.speedL)}"><button class="sq" data-st="sp" data-d="-1" aria-label="-">🐢</button><output id="spdV">${scrSpd}</output><button class="sq" data-st="sp" data-d="1" aria-label="+">🐇</button></div>`:''}
  ${scrOn?`<span class="muted spdl">${x.speedL}</span>`:`<button id="campBtn">${x.campGo}</button>
  <button id="adjBtn" class="${adjOpen?'on':''}">${x.adjust} ${adjOpen?'▴':'▾'}</button>
  <button id="shBtn">${x.share}</button>`}
  ${status}
  ${adjOpen&&!scrOn?`<div class="adj"><div class="stp"><span class="muted">${x.simpL}</span><button id="simpT" class="${isSimp()?'on':''}">${isSimp()?x.simpOn:x.simpOff}</button></div>${stepper('fs',x.fontL,fsz)}${stepper('cp',x.capoShort,cp)}${stepper('tr',x.transpL,(shift>0?'+':'')+shift)}${stepper('sp',x.speedL,scrSpd)}<div class="stp"><span class="muted">${x.stateL}</span>${repChip(cur)}</div></div>`:''}
 </div>
 ${best.k&&best.k!==cp?`<p class="t capnote"><button class="link" id="cpBest">${x.capoTry(best.k)}</button></p>`:''}${cp?`<p class="t capnote">${x.capoNote(cp)}</p>`:''}
 ${!isSimp()&&shapes.some(c=>c.bass!=null||/maj|9|11|13|6|sus|add/.test(c.ext||'')||c.q==='d'||c.q==='a'||c.q==='s'||diffS(c)>1)?`<p class="t capnote"><button class="link" id="simpH">${x.simpHint}</button></p>`:''}
 ${shapes.length?`<div class="cbar" aria-label="${esc(x.chordsInSong)}">${shapes.map((c,i)=>`<button class="cbi" data-cbi="${i}"><b>${esc(cname(tp(c,cp),cp))}</b>${diag(vFor(c))}</button>`).join('')}</div>`:''}
 <div class="sheetv" style="font-size:${camp?fsz+6:fsz}px">${body}</div>
 <p class="t hint">${x.playHint}</p>`;
 $('p-play')._shapes=shapes;fitSheet();
 $('scrBtn').onclick=()=>{scrOn?stopScroll():startScroll();renderPlay()};
 if($('campBtn')){$('campBtn').onclick=()=>setCamp(true);$('adjBtn').onclick=()=>{adjOpen=!adjOpen;renderPlay()};$('shBtn').onclick=()=>shareSong(curSong())}
 if($('wAdd'))$('wAdd').onclick=()=>{openSongs();openEdit(null)};
 const st=()=>{simpOn[cur]=!isSimp();store.set('pcz-simp',simpOn);renderPlay()};['simpT','simpX','simpH'].forEach(id=>{if($(id))$(id).onclick=st});
 if($('cpBest'))$('cpBest').onclick=()=>{pcapo[cur]=best.k;store.set('pcz-capo',pcapo);renderPlay()};
}
let campF=0;
function fitSheet(){const sv=$('p-play').querySelector('.sheetv');if(!sv||$('p-play').hidden)return;if(camp&&campF){sv.style.fontSize=campF+'px';return}let f=camp?fsz+6:fsz;sv.style.fontSize=f+'px';while(f>11&&sv.scrollWidth>sv.clientWidth+1){f--;sv.style.fontSize=f+'px'}if(camp)campF=f;campUI()}
window.addEventListener('resize',()=>{if(view==='song'&&sub==='play')fitSheet()});
function adjStep(id,d){
 if(id==='fs'){fsz=Math.max(12,Math.min(34,fsz+2*d));store.set('pcz-fs',fsz)}
 if(id==='cp'){pcapo[cur]=Math.max(0,Math.min(9,(pcapo[cur]||0)+d));store.set('pcz-capo',pcapo)}
 if(id==='tr'){shift=Math.max(-11,Math.min(11,shift+d))}
 if(id==='sp'){scrSpd=Math.max(1,Math.min(10,scrSpd+d));store.set('pcz-scroll2',scrSpd);document.querySelectorAll('#spdV,.stp output[data-o="sp"],#cSpd').forEach(o=>o.textContent=scrSpd);return}
 if(id==='tr')renderSong();else renderPlay();
}
function startScroll(){scrOn=true;let last=performance.now(),acc=0;const step=t=>{if(!scrOn)return;const dt=(t-last)/1000;last=t;acc+=dt*(scrSpd*3);if(acc>=1){const n=Math.floor(acc);acc-=n;window.scrollBy(0,n)}if(window.innerHeight+window.scrollY>=document.body.scrollHeight-2){stopScroll();if(sub==='play'&&view==='song'&&!camp)renderPlay();return}scrRaf=requestAnimationFrame(step)};scrRaf=requestAnimationFrame(step);campUI()}
function stopScroll(){scrOn=false;cancelAnimationFrame(scrRaf);campUI()}
async function wakeSync(){const want=view==='song'&&sub==='play'&&!document.hidden;try{if(want&&!wake&&navigator.wakeLock){wake=await navigator.wakeLock.request('screen');wake.addEventListener('release',()=>{wake=null})}else if(!want&&wake){await wake.release();wake=null}}catch(e){wake=null}}
document.addEventListener('visibilitychange',wakeSync);
/* campfire mode */
function setCamp(on){camp=on;campF=0;document.body.classList.toggle('camp',on);$('campBar').hidden=!on;if(on)sub='play';renderSong();if(on){window.scrollTo(0,0);toast(X().campTip)}campUI()}
function campUI(){const b=$('cScr');if(b){b.textContent=scrOn?'⏸':'▶';b.setAttribute('aria-label',scrOn?X().scrStop:X().scrGo)}const f=$('cFs');if(f)f.textContent=campF||fsz;const v=$('cSpd');if(v)v.textContent=scrSpd}
function campFont(d){const sv=$('p-play').querySelector('.sheetv');campF=Math.max(12,Math.min(48,(campF||fsz+6)+2*d));if(sv)sv.style.fontSize=campF+'px';campUI()}
/* --- Rozbor --- */
function renderChords(){
 const {cs,us,k}=A,x=X(),beg=level==='beg',el=$('rozbor');
 if(!k){el.innerHTML=`<p class="empty">${x.empty}</p>`;return}
 const p=pattern(cs,k),c=us[selIdx],r=role(c,k),v=vFor(c);
 const keyBlock=beg?`<div><div class="lbl">${x.homeL} ${gq('tonina')}</div><div class="key"><b>${esc(nn(k.t)+(k.minor?'m':''))}</b></div><div class="muted">${k.minor?x.moodMin:x.moodMaj} ${gq('durmoll')}</div></div>`
  :`<div><div class="lbl">${x.keyL} ${gq('tonina')}</div><div class="key"><b>${nn(k.t)}</b> ${k.minor?x.minor:x.major}</div><div class="muted">${x.rel(k.minor?nn(k.t+3)+' '+x.major:nn(k.t+9)+' '+x.minor)}</div></div>`;
 const card=(u,i)=>{const q=role(u,k);return `<button class="cd${q.home?' home':''}${i===selIdx?' on':''}" data-i="${i}" data-cn="${esc(cname(u))}">${beg?'':`<span class="num">${q.num}</span>`}<span class="cn">${esc(cname(u))}</span><span class="fn">${level==='adv'?q.term:q.word}</span></button>`};
 el.innerHTML=`<div class="keyline">${keyBlock}<div class="row">${shift?`<span class="pill">${x.transposed(shift)}</span>`:''}${pbtn(x.playAll,seq(),{cls:'fire'})}</div></div>
 ${p?`<div class="pat"><div class="lbl">${x.patL} ${gq('postup')}</div><div class="big">${p.name}</div>
  <div class="path">${p.chords.map(u=>{const q=role(u,k);return `<span class="pc${q.home?' home':''}" data-cn="${esc(cname(u))}"><b>${esc(cname(u))}</b><small>${q.word}</small></span>`}).join('<i>→</i>')}<i>↺</i></div>
  <p>${p.tip}</p>${beg?'':`<p class="t">${x.techn}: ${p.term} (${p.num})</p>`}<div class="row" style="margin-top:8px">${pbtn(x.listen,p.chords.concat(p.chords))}</div></div>`:''}
 ${beg?'':`<div class="lbl">${x.numsL} ${gq('stupen')}</div>`}
 <div class="cards">${us.map(card).join('')}</div>
 <div class="sel"><div class="dgw" data-open="1">${diag(v)}</div><div><div class="cn">${esc(cname(c))}</div><p><b>${beg?r.word:r.num+' · '+(level==='adv'?r.term:r.word)}.</b> ${r.tip}</p><p class="t">${x.tones}: ${tones(c).map(t=>nn(c.root+t)).join(' ')}</p><div class="row" style="margin-top:8px">${pbtn('▶ '+x.hear,[c])}<button id="moreShapes">${x.shapes}</button></div></div></div>
 <div style="margin-top:16px"><div class="lbl">${x.capoL} ${gq('kapo')}</div><div class="caps">${capos(us).map(o=>{const sh=withFlat(false,()=>us.slice(0,6).map(u=>esc(cname(u,o.k))).join(' '));return `<button class="cp" data-capo="${o.k}"><b>${o.k?x.capoAt(o.k):x.noCapo}</b><span>${sh}</span></button>`}).join('')}</div></div>`;
 $('moreShapes').onclick=()=>openChord(c);el.querySelector('[data-open]').onclick=()=>openChord(c);
}
/* --- Sólo --- */
function drawSolo(){
 const {k,us}=A,x=X();let marks=[],box=[],cap='';
 document.querySelectorAll('#mode button').forEach(b=>{b.classList.toggle('on',b.dataset.m===mode);b.textContent=x['m'+{pent:'Pent',scale:'Scale',chord:'Chord'}[b.dataset.m]]});
 document.querySelectorAll('#lab button').forEach(b=>{b.classList.toggle('on',b.dataset.l===lab);b.textContent=b.dataset.l==='deg'?x.lDeg:x.lName});
 if(k){let ref,set;
  if(mode==='chord'){const c=us[selIdx];ref=c.root;set=tones(c);cap=x.capChord(esc(cname(c)),set.map(t=>nn(c.root+t)).join(' '))}
  else{ref=k.t;set=mode==='pent'?(k.minor?[0,3,5,7,10]:[0,2,4,7,9]):(k.minor?[0,2,3,5,7,8,10]:[0,2,4,5,7,9,11]);
   const mr=k.minor?k.t:(k.t+9)%12,f=(mr-4+12)%12,ns=set.map(t=>nn(k.t+t)).join(' ');
   cap=mode==='pent'?x.capPent(keyName(k),ns,nn(mr),[f,f+12].filter(v=>v<=15).join(tr('. a ',' and ')),!k.minor):x.capScale(keyName(k),ns);
   if(mode==='pent')box=[f,f+12].filter(v=>v+3<=15)}
  for(let s=0;s<6;s++)for(let f=0;f<=15;f++){const pc=(OPEN[s]+f)%12,rel=(pc-ref+12)%12;if(set.includes(rel))marks.push({s,f,k:rel===0?'home':'note',t:lab==='deg'?DEG[rel]:nn(pc)})}
 }
 $('fbc').innerHTML=cap;$('mDesc').innerHTML=x.mDesc[mode];renderSoloGuide();const o={frets:15,marks,box,lefty};if(!$('p-solo').hidden)setBoard($('fb1'),o);else $('fb1')._o=o;
}
/* --- how to solo over this song --- */
function renderSoloGuide(){
 const g=$('sGuide'),x=X(),{k,us}=A;if(!k){g.innerHTML='';return}
 const wasOpen=g.open,key=keyName(k),home=nn(k.t),pentI=k.minor?[0,3,5,7,10]:[0,2,4,7,9],scI=k.minor?[0,2,3,5,7,8,10]:[0,2,4,5,7,9,11];
 const pent=pentI.map(t=>nn(k.t+t)),extra=scI.filter(t=>!pentI.includes(t)).map(t=>nn(k.t+t));
 const mr=k.minor?k.t:(k.t+9)%12,fret=(mr-4+12)%12||12;
 const rows=us.slice(0,8).map(c=>`<tr><td><b>${esc(cname(c))}</b></td><td>${tones(c).map(t=>nn(c.root+t)).join(' ')}</td></tr>`).join('');
 g.innerHTML=`<summary>🎸 ${x.sgT}</summary><div class="sgb">
 <ol class="sgsteps">
  <li><b>${x.sg1T}</b> ${x.sg1(key,home)}</li>
  <li><b>${x.sg2T}</b> ${x.sg2(pent.join(' '),fret,k.minor?'':nn(mr))} <button class="link" data-sm="pent">${x.sgShow}</button></li>
  <li><b>${x.sg3T}</b> ${x.sg3(extra.join(tr(' a ',' and ')))} <button class="link" data-sm="scale">${x.sgShow}</button></li>
  <li><b>${x.sg4T}</b> ${x.sg4} <table class="sgt">${rows}</table><button class="link" data-sm="chord">${x.sgShow}</button></li>
  <li><b>${x.sg5T}</b> ${x.sg5(home)}</li>
 </ol>
 <div class="row">${pbtn('▶ '+x.sgHear,pentI.concat(12).map(t=>52+((k.t-4+12)%12)+t),{notes:true,step:.34,cls:'fire'})}<button id="sgJam">${x.sgJam}</button><button id="sgLes">${x.sgLes}</button></div></div>`;
 g.open=wasOpen;
 g.querySelectorAll('[data-sm]').forEach(b=>b.onclick=()=>{mode=b.dataset.sm;drawSolo();setBoard($('fb1'),$('fb1')._o);$('fb1').scrollIntoView({behavior:'smooth',block:'center'})});
 $('sgJam').onclick=()=>{go('five');fiveGo('jam')};
 $('sgLes').onclick=()=>{go('lessons');const i=lessons().findIndex(l=>l.id==='imp1');if(i>=0)lesGo(i)};
}
/* --- Proč? (bottom of Rozbor) --- */
function renderWhy(){
 $('aiBox').hidden=!sample;if(sample)$('aq').placeholder=X().askPh;
 const {k,us}=A,el=$('faq');if(!k){el.innerHTML='';return}
 const C=(iv,q,ext='')=>C0(k.t+iv,q,ext),I=C(0,k.minor?'m':'M'),Ia=C(0,k.minor?'M':'m'),IV=C(5,k.minor?'m':'M'),V=C(7,'M');
 const n=c=>esc(cname(c)),song=esc(curSong().name||tr('tahle písnička','this song')),key=keyName(k);
 const mr=k.minor?k.t:(k.t+9)%12,fret=(mr-4+12)%12||12,pent=(k.minor?[0,3,5,7,10]:[0,2,4,7,9]),base=52+((k.t-4+12)%12);
 const NAT=NATIDS[k.minor?'min':'maj'],best=capos(us)[0],shapes=withFlat(false,()=>us.slice(0,6).map(u=>esc(cname(u,best.k))).join(' ')),lt=nsh(k.t+11);
 const it=[];
 it.push([tr(`Proč ${song} zní ${k.minor?'smutně':'vesele'}?`,`Why does ${song} sound ${k.minor?'sad':'happy'}?`),
  k.minor?tr(`Písnička je v moll, domov je <b>${n(I)}</b>. Mollový akord má prostřední tón o jeden pražec níž než durový a ucho to slyší jako smutek. Poslechni si rozdíl:`,`The song is in minor, home is <b>${n(I)}</b>. A minor chord has its middle note one fret lower than major, and the ear hears that as sadness. Hear the difference:`)
  :tr(`Písnička je v duru, domov je <b>${n(I)}</b>. Durový akord má prostřední tón o pražec výš než mollový, proto zní světle. Poslechni si rozdíl:`,`The song is in major, home is <b>${n(I)}</b>. A major chord has its middle note one fret higher than minor, so it sounds bright. Hear the difference:`),
  pbtn('▶ '+cname(I),[I])+pbtn('▶ '+cname(Ia),[Ia])]);
 it.push([tr('Jak nad ní hrát sólo?','How do I solo over it?'),
  tr(`Hraj ${key} pentatoniku: <b>${pent.map(t=>nn(k.t+t)).join(' ')}</b>. Box 1 začíná na <b>${fret}. pražci</b> basové E struny. Když chceš, aby fráze zněla hotově, skonči na tónu <b>${nn(k.t)}</b>, to je domov.`,`Play the ${key} pentatonic: <b>${pent.map(t=>nn(k.t+t)).join(' ')}</b>. Box 1 starts at <b>fret ${fret}</b> on the low E string. To make a phrase sound finished, end on <b>${nn(k.t)}</b>, that’s home.`),
  pbtn(tr('▶ Zahraj pentatoniku','▶ Play the pentatonic'),pent.concat(12).map(t=>base+t),{notes:true,step:.38})+pbtn(tr('Ukaž na hmatníku','Show on the fretboard'),[],{act:()=>{mode='pent';setSub('solo')}})]);
 for(const u of us.filter(u=>role(u,k).iv!==0).slice(0,4)){const r=role(u,k);let a=`<b>${n(u)}</b> = ${r.num} (${r.word.toLowerCase()}). ${r.tip}`;
  if(k.minor&&r.id==='7M')a=`<b>${n(u)}</b> = ${r.num} (${r.word.toLowerCase()}). `+tr(`V čisté ${key} by tu byl ${n(C(7,'m'))}. ${n(u)} ale obsahuje tón <b>${lt}</b>, který leží jen půltón pod domovem ${nn(k.t)}, a ten táhne domů mnohem silněji. Proto zní tak dramaticky.`,`In pure ${key} this would be ${n(C(7,'m'))}. But ${n(u)} contains <b>${lt}</b>, just a half step below home ${nn(k.t)}, and that pulls home much harder. That’s why it sounds so dramatic.`);
  else if(!NAT.includes(r.id))a+=' '+tr(`Do tóniny ${key} normálně nepatří, je vypůjčený. Proto zní překvapivě.`,`It doesn’t normally belong to ${key}, it’s borrowed. That’s why it surprises.`);
  it.push([tr(`Proč je tu akord ${n(u)}?`,`Why is the ${n(u)} chord here?`),a,pbtn(`▶ ${cname(u)} → ${cname(I)}`,[u,I])])}
 it.push([tr('Jak ji zahrát co nejjednodušeji?','How can I play it the easiest way?'),
  best.k?tr(`Dej kapodastr na <b>${best.k}. pražec</b> a hraj tvary <b>${shapes}</b>. Zní to stejně jako originál. Ťukni nahoře na kartičku s kapem a nastaví se ti v Hraj.`,`Put a capo on <b>fret ${best.k}</b> and play the shapes <b>${shapes}</b>. It sounds the same as the original. Tap the capo card above and it’s set in Play.`):tr(`Nejsnazší je to bez kapodastru: <b>${shapes}</b>.`,`It’s easiest without a capo: <b>${shapes}</b>.`),'']);
 it.push([tr('Kterým akordem písničku ukončit?','Which chord should I end on?'),
  tr(`Akordem <b>${n(I)}</b>, to je domov. Když skončíš jinde, písnička zůstane viset ve vzduchu.`,`On <b>${n(I)}</b>, that’s home. End anywhere else and the song hangs in the air.`),
  pbtn(tr('▶ Konec doma','▶ End at home'),[IV,V,I])+pbtn(tr('▶ Konec jinde','▶ End elsewhere'),[IV,I,V])]);
 el.innerHTML=it.map(([q,a,b])=>`<details class="fq"><summary>${q}</summary><div><p>${a}</p>${b?`<div class="row">${b}</div>`:''}</div></details>`).join('');
}
function setSub(s){const toWhy=s==='why';if(toWhy)s='chords';sub=s;stopPlay();if(view!=='song'){go('song')}else renderSong();if(toWhy)setTimeout(()=>{const f=$('faq');if(f)f.scrollIntoView({behavior:'smooth'})},80);else window.scrollTo(0,0)}
function pickSong(id){cur=id;store.set('pcz-cur',cur);opened[id]=Date.now();store.set('pcz-opened',opened);shift=0;selIdx=0;adjOpen=false}

/* --- song list & editor --- */
let editId=null,lastDeleted=null;
function openSongs(){$('songOv').hidden=false;$('sList').hidden=false;$('sEdit').hidden=true;$('sq').value='';renderSongList()}
function renderSongList(){
 const x=X(),q=$('sq').value.trim().toLowerCase(),row=(s,ed)=>`<div class="srow"><button class="${s.id===cur?'on':''}" data-pickid="${esc(s.id)}">${esc(s.name||'—')}</button>${repChip(s.id)}${ed?`<button data-editid="${esc(s.id)}">${x.edit}</button>`:''}</div>`;
 $('sq').placeholder=x.searchPh;
 $('ssort').innerHTML=Object.entries(x.sorts).map(([k,v])=>`<button data-so="${k}" class="${ssort===k?'on':''}">${v}</button>`).join('');
 const fil=a=>a.filter(s=>!q||(s.name||'').toLowerCase().includes(q)||(s.text||'').toLowerCase().includes(q));
 const srt=a=>a.slice().sort(ssort==='az'?(p,r)=>(p.name||'').localeCompare(r.name||'',lang):ssort==='status'?(p,r)=>(rep[r.id]||0)-(rep[p.id]||0)||(p.name||'').localeCompare(r.name||'',lang):(p,r)=>(opened[r.id]||0)-(opened[p.id]||0));
 const m=srt(fil(mine)),e=srt(fil(EXAMPLES));
 $('slMine').innerHTML=m.length?m.map(s=>row(s,1)).join(''):`<p class="t">${mine.length?x.noFound:x.noMine}</p>`;
 $('slEx').innerHTML=e.length?e.map(s=>row(s,0)).join(''):`<p class="t">${x.noFound}</p>`;
}
function openEdit(id){editId=id;const s=mine.find(v=>v.id===id);$('sList').hidden=true;$('sEdit').hidden=false;$('sDelQ').hidden=true;$('sEditT').textContent=s?X().editT:X().newT;$('nm').value=s?s.name:'';$('tx').value=s?s.text:'';$('sDel').hidden=!s;upd();detLine();$('nm').focus()}
function upd(){$('find').href='https://www.google.com/search?q='+encodeURIComponent(($('nm').value.trim()+tr(' akordy',' chords')).trim())}
function detLine(){const cs=parse($('tx').value),seen=uniq(cs.map(c=>cname(c)));$('det').textContent=seen.length?X().det(seen.slice(0,12).join(' ')):X().detNone}
function addSong(name,text){const s={id:'m'+Date.now()+Math.floor(Math.random()*1000),name:name||'—',text};mine.push(s);store.set('pcz-songs',mine);return s}

/* --- share by link --- */
const b64u=u8=>{let s='';u8.forEach(b=>s+=String.fromCharCode(b));return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')};
const ub64=s=>{s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u};
async function packSong(s){const raw=new TextEncoder().encode(JSON.stringify({n:s.name,t:s.text}));try{if(window.CompressionStream){const z=await new Response(new Blob([raw]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer();return 'z'+b64u(new Uint8Array(z))}}catch(e){}return 'p'+b64u(raw)}
async function unpackSong(code){const kind=code[0],u=ub64(code.slice(1));let raw=u;if(kind==='z'){raw=new Uint8Array(await new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer())}const o=JSON.parse(new TextDecoder().decode(raw));if(typeof o.t!=='string')throw 0;return {name:String(o.n||'—').slice(0,120),text:o.t.slice(0,20000)}}
async function shareSong(s){
 const x=X(),url=location.origin+location.pathname+'#s='+await packSong(s);
 try{if(navigator.share){await navigator.share({title:s.name,text:s.name,url});return}}catch(e){if(e&&e.name==='AbortError')return}
 try{await navigator.clipboard.writeText(url);toast(x.shared)}catch(e){toast(x.shareFail)}
}
let pendingImp=null;
async function handleImport(){
 const h=location.hash;if(!h.startsWith('#s='))return false;
 try{pendingImp=await unpackSong(h.slice(3))}catch(e){toast(X().importBad);try{history.replaceState(null,'','#song')}catch(e2){}return false}
 try{history.replaceState(null,'','#song')}catch(e){}
 const keep=playCh;playCh=[];$('impN').textContent=pendingImp.name;$('impTx').innerHTML=songBody(pendingImp.text);playCh=keep;if($('ov').hidden)$('impOv').hidden=false;return true;
}

/* --- toast --- */
let toastT=0;
function toast(msg,act,fn){$('toastT').textContent=msg;const b=$('toastB');b.hidden=!act;b.textContent=act||'';b.onclick=()=>{$('toast').hidden=true;fn&&fn()};$('toast').hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>{$('toast').hidden=true},act?7000:3500)}

document.addEventListener('click',e=>{const b=e.target.closest('[data-rep]');if(!b)return;e.stopPropagation();const id=b.dataset.rep;rep[id]=((rep[id]||0)+1)%4;store.set('pcz-rep',rep);document.querySelectorAll(`[data-rep="${CSS.escape(id)}"]`).forEach(z=>{z.className='rep r'+rep[id];z.textContent=REPS()[rep[id]]})});
document.addEventListener('DOMContentLoaded',()=>{
 $('sub').onclick=e=>{const b=e.target.closest('button');if(b)setSub(b.dataset.s)};
 $('p-play').addEventListener('click',e=>{
  const st=e.target.closest('[data-st]');if(st){adjStep(st.dataset.st,+st.dataset.d);return}
  const cb=e.target.closest('[data-cbi]');if(cb){const c=$('p-play')._shapes[+cb.dataset.cbi];openChord(c,cname(tp(c,pcapo[cur]||0),pcapo[cur]||0)+((pcapo[cur]||0)?' · '+X().capoShort+' '+pcapo[cur]:''));return}
  const b=e.target.closest('[data-chi]');if(b){const c=playCh[+b.dataset.chi];openChord(c,cname(tp(c,pcapo[cur]||0),pcapo[cur]||0)+((pcapo[cur]||0)?' · '+X().capoShort+' '+pcapo[cur]:''));return}
  if(camp&&!e.target.closest('button'))$('campBar').hidden=!$('campBar').hidden;
 });
 $('p-chords').addEventListener('click',e=>{
  const cpb=e.target.closest('[data-capo]');if(cpb){pcapo[cur]=+cpb.dataset.capo;store.set('pcz-capo',pcapo);setSub('play');return}
  const b=e.target.closest('.cd');if(!b)return;selIdx=+b.dataset.i;mode='chord';renderChords();drawSolo();play([A.us[selIdx]])});
 $('mode').onclick=e=>{const b=e.target.closest('button');if(b){mode=b.dataset.m;drawSolo()}};
 $('lab').onclick=e=>{const b=e.target.closest('button');if(b){lab=b.dataset.l;drawSolo()}};
 $('pick').onclick=openSongs;$('sClose').onclick=()=>{$('songOv').hidden=true};
 $('sq').addEventListener('input',renderSongList);
 $('ssort').onclick=e=>{const b=e.target.closest('[data-so]');if(b){ssort=b.dataset.so;store.set('pcz-ssort',ssort);renderSongList()}};
 $('songOv').addEventListener('click',e=>{if(e.target.id==='songOv'){$('songOv').hidden=true;return}const p=e.target.closest('[data-pickid]');if(p){pickSong(p.dataset.pickid);$('songOv').hidden=true;refreshView();return}const ed=e.target.closest('[data-editid]');if(ed)openEdit(ed.dataset.editid)});
 $('sAdd').onclick=()=>openEdit(null);$('sBack').onclick=()=>{$('sList').hidden=false;$('sEdit').hidden=true;renderSongList()};
 $('nm').addEventListener('input',upd);$('tx').addEventListener('input',detLine);
 $('sPaste').onclick=async()=>{try{const t=await navigator.clipboard.readText();if(t){$('tx').value=t;detLine()}else toast(X().pasteFail)}catch(e){toast(X().pasteFail)}};
 $('sSave').onclick=()=>{const name=$('nm').value.trim()||'—',text=$('tx').value;let s=mine.find(v=>v.id===editId);if(s){s.name=name;s.text=text;store.set('pcz-songs',mine)}else s=addSong(name,text);pickSong(s.id);$('songOv').hidden=true;sub='play';refreshView()};
 $('sDel').onclick=()=>{$('sDelQ').hidden=false};$('sDelN').onclick=()=>{$('sDelQ').hidden=true};
 $('sDelY').onclick=()=>{const i=mine.findIndex(v=>v.id===editId);if(i<0)return;lastDeleted={s:mine[i],i};mine.splice(i,1);store.set('pcz-songs',mine);if(cur===editId){cur='l1';store.set('pcz-cur',cur)}$('sList').hidden=false;$('sEdit').hidden=true;renderSongList();refreshView();
  toast(X().deleted(lastDeleted.s.name),X().undo,()=>{if(!lastDeleted)return;mine.splice(lastDeleted.i,0,lastDeleted.s);store.set('pcz-songs',mine);lastDeleted=null;if(!$('songOv').hidden)renderSongList();refreshView()})};
 $('impY').onclick=()=>{if(!pendingImp)return;const s=addSong(pendingImp.name,pendingImp.text);pendingImp=null;pickSong(s.id);$('impOv').hidden=true;sub='play';toast(X().importDone(s.name));if(view!=='song')go('song');else refreshView()};
 $('impN2').onclick=()=>{$('impOv').hidden=true;pendingImp=null};
 $('cfm').onclick=e=>{e.stopPropagation();campFont(-1)};$('cfp').onclick=e=>{e.stopPropagation();campFont(1)};
 $('cScr').onclick=()=>{scrOn?stopScroll():startScroll()};$('csm').onclick=e=>{e.stopPropagation();adjStep('sp',-1)};$('csp').onclick=e=>{e.stopPropagation();adjStep('sp',1)};
 $('cExit').onclick=()=>{stopScroll();setCamp(false)};
});
