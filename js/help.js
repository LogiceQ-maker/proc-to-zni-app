'use strict';
/* ---------- feedback, microphone help, beginner encouragement ---------- */
const APP_VER='v9';
const FEEDBACK_EMAIL=''; // put your e-mail here to also offer "send by e-mail"
if(!store.get('pcz-first',null))store.set('pcz-first',today());

/* --- feedback --- */
let fbKind=0;
function diagLine(){const ua=navigator.userAgent,ios=/iPhone|iPad/.test(ua)?(ua.match(/OS (\d+)_/)||[])[1]:null,and=(ua.match(/Android (\d+)/)||[])[1];
 const dev=ios?'iOS '+ios:and?'Android '+and:/Mac/.test(ua)?'Mac':/Windows/.test(ua)?'Windows':'?';
 const sa=(window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||navigator.standalone?tr('z plochy','home screen'):tr('v prohlížeči','browser');
 return `${APP_VER} · ${dev} · ${sa} · ${tr('hra','play')}:${playLvl||'-'} ${tr('nauka','theory')}:${level||'-'} · mic:${store.get('pcz-mic','?')} · ${innerWidth}×${innerHeight}`}
function fbRender(){const x=X();$('fbKind').innerHTML=x.fbKinds.map((k,i)=>`<button class="chip${i===fbKind?' on':''}" data-fk="${i}">${k}</button>`).join('');$('fbTx').placeholder=x.fbPh[fbKind]}
function fbText(){const x=X();return `[Proč to zní] ${x.fbKinds[fbKind]}\n\n${$('fbTx').value.trim()}\n\n— ${diagLine()}`}
async function fbSend(){const x=X(),t=fbText();if(!$('fbTx').value.trim()){$('fbMsg').textContent=x.fbEmpty;$('fbTx').focus();return}
 try{if(navigator.share){await navigator.share({text:t});$('fbMsg').textContent=x.fbThanks;return}}catch(e){if(e&&e.name==='AbortError')return}
 if(FEEDBACK_EMAIL){location.href='mailto:'+FEEDBACK_EMAIL+'?subject='+encodeURIComponent('Proč to zní')+'&body='+encodeURIComponent(t);return}
 fbCopy()}
async function fbCopy(){const x=X();try{await navigator.clipboard.writeText(fbText());$('fbMsg').textContent=x.fbCopied}catch(e){$('fbMsg').textContent=x.fbCopyFail}}

/* --- microphone help with a live level meter --- */
let MH=null;
function openMicHelp(){
 const x=X();$('micOv').hidden=false;$('mhTips').innerHTML=x.mhTips.map(t=>`<li>${t}</li>`).join('');$('mhState').textContent=x.mhStart;$('mhNote').textContent='–';$('mhLvl').style.width='0%';
 MH={cb:Mic.cb,ccb:Mic.ccb,was:Mic.on,quiet:0,heard:0};Mic.ccb=null;
 const go=()=>{Mic.cb=mhHear};
 if(Mic.on)go();else micStart().then(ok=>{if(!MH)return;if(ok)go();else{$('mhState').textContent=store.get('pcz-mic',null)==='ok'?x.micNA:x.micDenied}});
}
function mhHear(p){if(!MH)return;const x=X(),lv=Math.min(100,Math.round(Math.sqrt(Mic.rms||0)*260));$('mhLvl').style.width=lv+'%';$('mhLvl').className=lv<8?'lo':lv>85?'hi':'';
 if(p&&p.clar>.8){MH.heard++;MH.quiet=0;$('mhNote').textContent=nsh(Math.round(p.midi));$('mhState').textContent=x.mhHeard}
 else if(++MH.quiet>60&&!MH.heard)$('mhState').textContent=x.mhQuiet;
 if(lv>85)$('mhState').textContent=x.mhLoud}
function closeMicHelp(){if(!MH)return;const m=MH;MH=null;$('micOv').hidden=true;Mic.cb=m.cb;Mic.ccb=m.ccb;if(!m.was)micStop();if(typeof setMicCb==='function'&&!m.ccb&&!m.cb)setMicCb()}
const mhLink=()=>`<button class="link mhlink" data-mh="1">${X().mhLink}</button>`;

/* --- encouragement for the first weeks --- */
function tipCard(){
 const x=X(),first=store.get('pcz-first',today()),days=Math.round((new Date(today())-new Date(first))/864e5);
 if(!(PL()==='beg'||days<14))return '';if(store.get('pcz-tipoff',null)===today())return '';
 const T=x.tips,t=T[(days+new Date().getDate())%T.length];
 return `<div class="tipc"><span class="tipi">💡</span><p>${t}</p><button class="tipx" id="tipX" aria-label="×">✕</button></div>`}

document.addEventListener('click',e=>{if(e.target.closest('[data-mh]')){e.preventDefault();openMicHelp()}});
document.addEventListener('DOMContentLoaded',()=>{
 $('fbOpen').onclick=()=>{$('fbOv').hidden=false;$('fbMsg').textContent='';fbRender();setTimeout(()=>$('fbTx').focus(),60)};
 $('fbX').onclick=()=>{$('fbOv').hidden=true};$('fbOv').addEventListener('click',e=>{if(e.target.id==='fbOv')$('fbOv').hidden=true});
 $('fbKind').onclick=e=>{const b=e.target.closest('[data-fk]');if(b){fbKind=+b.dataset.fk;fbRender()}};
 $('fbSend').onclick=fbSend;$('fbCopy').onclick=fbCopy;
 $('micTestB').onclick=openMicHelp;$('mhX').onclick=closeMicHelp;$('mhOk').onclick=closeMicHelp;$('micOv').addEventListener('click',e=>{if(e.target.id==='micOv')closeMicHelp()});
 document.addEventListener('click',e=>{if(e.target.id==='tipX'){store.set('pcz-tipoff',today());const c=e.target.closest('.tipc');if(c)c.remove()}});
});
