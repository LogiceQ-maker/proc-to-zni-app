'use strict';
/* ---------- more: metronome, settings, backup ---------- */
let bpm=store.get('pcz-bpm',80),beats=4,timer=null,nextT=0,beat=0,taps=[];
function setB(v){bpm=Math.max(40,Math.min(220,Math.round(v)));$('bpm').textContent=bpm;$('br').value=bpm;store.set('pcz-bpm',bpm)}
function dots(){$('dots').innerHTML=Array.from({length:beats},()=>'<span class="dot"></span>').join('');document.querySelectorAll('#bt button').forEach(b=>b.classList.toggle('on',+b.dataset.b===beats))}
function mtick(){while(nextT<ac.currentTime+.1){const b=beat,t=nextT;click(t,b===0);setTimeout(()=>{document.querySelectorAll('.dot').forEach((d,i)=>{d.classList.toggle('hit',i===b);d.classList.toggle('one',i===0)})},Math.max(0,(t-ac.currentTime)*1000));nextT+=60/bpm;beat=(beat+1)%beats}}
function renderMore(){const x=X();
 document.querySelectorAll('#lang button').forEach(b=>b.classList.toggle('on',b.dataset.l===lang));
 document.querySelectorAll('#notn button').forEach(b=>{b.textContent=b.dataset.n==='h'?x.notH:x.notB;b.classList.toggle('on',(b.dataset.n==='h')===cz)});
 $('lvls').innerHTML=Object.entries(x.lv).map(([k,[a]])=>`<button data-lvl="${k}" class="${level===k?'on':''}">${a}</button>`).join('');
 $('plvls').innerHTML=Object.entries(x.pl).map(([k,[a]])=>`<button data-plv="${k}" class="${playLvl===k?'on':''}">${a}</button>`).join('');
 $('lefty').checked=lefty;$('go').textContent=timer?x.stopM:x.start;$('bkMsg').textContent=''}

/* ---------- ask Claude (only where available) ---------- */
let askCtl=null;
async function ask(q){
 if(!sample||!q.trim())return;if(askCtl)askCtl.abort();askCtl=new AbortController();const {k,us}=A,aa=$('aa');aa.textContent=X().asking;
 const lv={beg:'complete beginner in music theory (plays chords by ear, knows no theory terms)',mid:'knows what major and minor are, little else',adv:'knows degrees and scales'}[level||'beg'];
 const ctx=k?`Song: ${curSong().name||'untitled'}\nChords in order: ${seq().map(c=>cname(c)).join(' ')}\nDetected key: ${keyName(k)}\nChord roles: ${us.map(u=>{const r=role(u,k);return cname(u)+' = '+r.num+' ('+r.word+')'}).join(', ')}`:'No song loaded.';
 const prompt=`You are a warm, practical guitar teacher inside the app "Proč to zní" that teaches music theory through songs the student already plays.\nStudent: ${lv}.\nAnswer in ${lang==='cs'?'Czech':'English'}.${cz?' Use Czech/German chord names: H means B natural, B means B flat.':''}\nRules: max 5 short sentences, or up to 4 short lines. Plain everyday words; if you use a theory term, explain it in brackets in a few words. Tie the answer to the student's song and chords. Suggest something to try on the guitar or listen for when useful. No markdown symbols, no headings.\n\n${ctx}\n\nQuestion: ${q}`;
 try{const r=await sample(prompt,{signal:askCtl.signal,cache:false,onText:({text})=>{aa.textContent=text}});aa.textContent=r.text}
 catch(e){if(e&&e.name==='AbortError')return;if(e&&e.code==='not_granted'){sample=null;renderWhy();return}aa.textContent=X().askErr}
}

/* ---------- navigation ---------- */
const VIEWS=['song','five','lessons','tuner','more'];
function go(v,noHash){
 if(!VIEWS.includes(v))v='song';
 if(v!==view&&(view==='tuner'||view==='five'))micStop();
 if(v!==view&&view==='five'&&typeof stopAll==='function'){stopAll();activeTrain=null}
 if(v!==view)stopScroll();
 view=v;stopPlay();$('sheet').hidden=true;
 VIEWS.forEach(n=>$('v-'+n).hidden=n!==v);
 document.querySelectorAll('#nav [data-v]').forEach(b=>{b.classList.toggle('on',b.dataset.v===v);b.setAttribute('aria-current',b.dataset.v===v?'page':'false')});
 if(!noHash&&location.hash!=='#'+v)try{history.replaceState(null,'','#'+v)}catch(e){}
 if(v==='five'&&FV.scr!=='home'&&!activeTrain)FV={scr:'home',plan:false};
 refreshView();setMicCb();wakeSync();window.scrollTo(0,0);
}
function refreshView(){if(view==='song')renderSong();else if(view==='five'){if(FV.scr!=='home'&&FV.scr!=='notes')activeTrain=FV.scr;renderFive()}else if(view==='lessons')renderLes();else if(view==='tuner')renderTuner();else renderMore()}
function refresh(){applyText();analyze();refreshView()}
function applyText(){const x=X();document.documentElement.lang=lang;document.querySelectorAll('[data-t]').forEach(el=>{const v=x[el.dataset.t];if(typeof v==='string')el.textContent=v});$('tx').placeholder=x.ph;
 document.querySelectorAll('#lang2 button').forEach(b=>b.classList.toggle('on',b.dataset.l===lang));obRender();micUI()}
function obRender(){const x=X();$('lv').innerHTML=Object.entries(x.lv).map(([k,[a,b]])=>`<button data-lv="${k}" class="${level===k?'on':''}"><b>${a}</b><span>${b}</span></button>`).join('');$('lvP').innerHTML=Object.entries(x.pl).map(([k,[a,b]])=>`<button data-plv="${k}" class="${playLvl===k?'on':''}"><b>${a}</b><span>${b}</span></button>`).join('');$('obDone').disabled=!(level&&playLvl)}
function setPlay(v){playLvl=v;store.set('pcz-play',v);if(store.get('pcz-stage',null)===null||!store.get('pcz-stageman',false)){stage={beg:1,mid:2,adv:3}[v];store.set('pcz-stage',stage)}PA=null;CH=null;YT=null}
function setLang(l){if(l===lang)return;lang=l;cz=l==='cs';store.set('pcz-lang',lang);store.set('pcz-cz',cz);refresh()}

document.addEventListener('DOMContentLoaded',()=>{
 /* metronome & settings */
 $('go').onclick=()=>{if(timer){clearInterval(timer);timer=null;$('go').textContent=X().start;document.querySelectorAll('.dot').forEach(d=>d.classList.remove('hit'));return}try{actx();nextT=ac.currentTime+.06;beat=0;timer=setInterval(mtick,25);$('go').textContent=X().stopM}catch(e){}};
 $('br').oninput=e=>setB(+e.target.value);$('bm').onclick=()=>setB(bpm-1);$('bp').onclick=()=>setB(bpm+1);
 $('bt').onclick=e=>{const b=e.target.closest('button');if(b){beats=+b.dataset.b;beat=0;dots()}};

 $('lang').onclick=e=>{const b=e.target.closest('button');if(b)setLang(b.dataset.l)};
 $('notn').onclick=e=>{const b=e.target.closest('button');if(!b)return;cz=b.dataset.n==='h';store.set('pcz-cz',cz);refresh()};
 $('lvls').onclick=e=>{const b=e.target.closest('[data-lvl]');if(!b)return;level=b.dataset.lvl;store.set('pcz-level',level);refresh()};
 $('plvls').onclick=e=>{const b=e.target.closest('[data-plv]');if(!b)return;setPlay(b.dataset.plv);refresh()};
 $('lefty').onchange=e=>{lefty=e.target.checked;store.set('pcz-lefty',lefty);refresh()};
 $('reset').onclick=()=>{$('resetQ').hidden=false};$('resetN').onclick=()=>{$('resetQ').hidden=true};
 $('resetY').onclick=()=>{earSt={};store.set('pcz-ear',{});QST={};store.set('pcz-quest',{});QT=[];store.set('pcz-qtest',[]);degSt={};store.set('pcz-deg',{});stats={};plog={};done=[];cards={};chRec={};planDone={};['pcz-stats','pcz-log','pcz-done2','pcz-cards','pcz-ch','pcz-plan'].forEach(k=>store.set(k,k==='pcz-done2'?[]:{}));$('resetQ').hidden=true};
 $('bkCopy').onclick=async()=>{const data=JSON.stringify({app:'proc-to-zni',v:1,songs:mine,rep});$('bkTx').value=data;try{await navigator.clipboard.writeText(data);$('bkMsg').textContent=X().bkCopied}catch(e){$('bkTx').select();$('bkMsg').textContent=X().bkSelect}};
 $('bkLoad').onclick=()=>{try{const d=JSON.parse($('bkTx').value);if(!d||!Array.isArray(d.songs))throw 0;let n=0;for(const s of d.songs){if(!s||typeof s.text!=='string')continue;const ex=mine.find(m=>m.id===s.id);if(ex){ex.name=String(s.name||'—');ex.text=s.text}else{mine.push({id:String(s.id||'m'+Date.now()+n),name:String(s.name||'—'),text:s.text})}n++}if(d.rep&&typeof d.rep==='object')Object.assign(rep,d.rep);store.set('pcz-songs',mine);store.set('pcz-rep',rep);$('bkMsg').textContent=X().bkLoaded(n)}catch(e){$('bkMsg').textContent=X().bkBad}};
 /* ask & glossary */
 $('ab').onclick=()=>ask($('aq').value);
 document.addEventListener('click',e=>{const b=e.target.closest('[data-g]');if(!b)return;e.stopPropagation();const g=GL[b.dataset.g][lang==='cs'?0:1];window._term=g[0];
  $('shT').textContent=g[0];$('shX').textContent=g[1];$('shA').hidden=!sample;$('shA').textContent=X().askMore;$('shC').textContent=X().close;$('sheet').hidden=false});
 $('shC').onclick=()=>{$('sheet').hidden=true};
 $('shA').onclick=()=>{$('sheet').hidden=true;setSub('why');const q=tr(`Vysvětli mi na téhle písničce: ${window._term}`,`Explain using this song: ${window._term}`);$('aq').value=q;ask(q)};
 /* nav & onboarding */
 $('nav').onclick=e=>{const b=e.target.closest('[data-v]');if(b){if(b.dataset.v==='five'&&view==='five'){fiveGo('home');return}go(b.dataset.v)}};
 window.addEventListener('hashchange',()=>{if(location.hash.startsWith('#s=')){handleImport();return}go(location.hash.slice(1),true)});
 $('lang2').onclick=e=>{const b=e.target.closest('button');if(b)setLang(b.dataset.l)};
 $('lv').onclick=e=>{const b=e.target.closest('[data-lv]');if(!b)return;level=b.dataset.lv;store.set('pcz-level',level);obRender()};
 $('lvP').onclick=e=>{const b=e.target.closest('[data-plv]');if(!b)return;setPlay(b.dataset.plv);obRender()};
 const obFinish=()=>{$('ov').hidden=true;$('obMic').hidden=true;$('ov').querySelector('.box').hidden=false;les=null;refresh();if(pendingImp)$('impOv').hidden=false};
 $('obDone').onclick=()=>{if(!(level&&playLvl))return;if(store.get('pcz-mic',null)==='ok'||!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia)){obFinish();return}$('ov').querySelector('.box').hidden=true;$('obMic').hidden=false;$('obMicMsg').textContent=''};
 $('obMicY').onclick=async()=>{try{actx()}catch(e){}try{await getMicStream();$('obMicMsg').textContent=X().micOk;clearTimeout(micKeep);micKeep=setTimeout(()=>{if(!Mic.on)micRelease()},90000);setTimeout(obFinish,700)}catch(e){$('obMicMsg').textContent=X().micNo;$('obMicN').textContent=X().okGo}};
 $('obMicN').onclick=()=>{store.set('pcz-mic','later');obFinish()};
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('sheet').hidden=true;$('songOv').hidden=true;$('chOv').hidden=true;if(camp)setCamp(false)}});
 setB(bpm);dots();applyText();const h0=location.hash.startsWith('#s=')?'song':location.hash.slice(1)||'song';go(h0,true);
 if(!level||!playLvl)$('ov').hidden=false;
 else if(store.get('pcz-mic',null)==null&&navigator.mediaDevices&&navigator.mediaDevices.getUserMedia&&!location.hash.startsWith('#s=')){$('ov').hidden=false;$('ov').querySelector('.box').hidden=true;$('obMic').hidden=false}
 handleImport();
 (async()=>{try{const s=window.claude&&window.claude.use?await window.claude.use('sample'):null;if(s){sample=s;renderWhy()}}catch(e){}})();
 if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost'))navigator.serviceWorker.register('sw.js').catch(()=>{});
});
