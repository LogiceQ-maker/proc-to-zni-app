'use strict';
/* ---------- tuner ---------- */
const TUN=[{id:'std',g:0,n:['Standard','Standard'],m:[40,45,50,55,59,64]},{id:'dropd',g:0,n:['Drop D','Drop D'],m:[38,45,50,55,59,64]},{id:'half',g:0,n:['O půltón níž','Half step down'],m:[39,44,49,54,58,63]},{id:'whole',g:0,n:['O celý tón níž','Whole step down'],m:[38,43,48,53,57,62]},{id:'dropc',g:0,n:['Drop C','Drop C'],m:[36,43,48,53,57,62]},{id:'openg',g:0,n:['Open G','Open G'],m:[38,43,50,55,59,62]},{id:'opend',g:0,n:['Open D','Open D'],m:[38,45,50,54,57,62]},{id:'opene',g:0,n:['Open E','Open E'],m:[40,47,52,56,59,64]},{id:'dadgad',g:0,n:['DADGAD','DADGAD'],m:[38,45,50,55,57,62]},
 {id:'s12',g:1,n:['Standard','Standard'],m:[40,52,45,57,50,62,55,67,59,59,64,64]},{id:'s12h',g:1,n:['O půltón níž','Half step down'],m:[39,51,44,56,49,61,54,66,58,58,63,63]},
 {id:'s7',g:2,n:['Standard','Standard'],m:[35,40,45,50,55,59,64]},{id:'b4',g:3,n:['4 struny','4 strings'],m:[28,33,38,43]},{id:'b5',g:3,n:['5 strun','5 strings'],m:[23,28,33,38,43]},{id:'uke',g:4,n:['Standard (G C E A)','Standard (G C E A)'],m:[67,60,64,69]}];
let tLock=null,tSm=[],tQ=0;
const curTun=()=>TUN.find(t=>t.id===tuningId)||TUN[0];
const tunTargets=()=>curTun().m.map((m,i)=>({m,i}));
const oct=m=>Math.floor(m/12)-1;
function renderTuner(){
 const x=X(),li=lang==='cs'?0:1;
 $('tuning').innerHTML=x.tg.map((g,gi)=>`<optgroup label="${esc(g)}">${TUN.filter(t=>t.g===gi).map(t=>`<option value="${t.id}"${t.id===tuningId?' selected':''}>${esc(g)}: ${esc(t.n[li])}, ${t.m.filter((m,i)=>t.g!==1||i%2===0).map(m=>nsh(m)).join(' ')}</option>`).join('')}</optgroup>`).join('');
 $('strs').innerHTML=tunTargets().map(t=>`<button data-ti="${t.i}" class="${tLock===t.i?'on':''}">${nsh(t.m)}<sub>${oct(t.m)}</sub></button>`).join('');
 if(!$('ticks').innerHTML){let h='';for(let c=-50;c<=50;c+=10){const a=(c/50)*60*Math.PI/180,r1=c%50?112:106,r2=124;h+=`<line x1="${150+r1*Math.sin(a)}" y1="${150-r1*Math.cos(a)}" x2="${150+r2*Math.sin(a)}" y2="${150-r2*Math.cos(a)}" stroke="#ffffff70" stroke-width="2"/>`}$('ticks').innerHTML=h}
 micUI();if(!Mic.on){$('v-tuner').classList.remove('intune','hold');$('tnote').textContent='–';$('thint').textContent='';$('thint').className='thint';$('needle').style.transform='rotate(0deg)'}
}
let tOk=0,tLast=0,tNeed=0,tJump=[];
function tunerHear(p){
 const th=$('thint'),x=X(),tv=$('v-tuner');
 if(!p||p.clar<0.75){tQ++;
  // keep the last reading on screen ~3 s so you have time to look, then fade
  if(tQ===8)tv.classList.add('hold');
  if(tQ>55){th.textContent=x.quiet;th.className='thint';tv.classList.remove('intune','hold');$('needle').style.transform='rotate(0deg)';tOk=0}
  tSm=[];return}
 const fresh=tQ>=3||p.onset;tQ=0;tv.classList.remove('hold');
 // stability: a new pluck (after silence or a clear attack) may change the note at once,
 // but while a string rings, a sudden jump (overtone, octave slip) must last 4 readings to count
 if(fresh){tSm=[];tJump=[]}
 if(tSm.length>=3){const so0=[...tSm].sort((a,b)=>a-b),cur=so0[so0.length>>1];
  if(Math.abs(p.midi-cur)>.6){tJump.push(p.midi);if(tJump.length<4)return;const j=[...tJump].sort((a,b)=>a-b);if(j[3]-j[0]>.5){tJump.shift();return}tSm=tJump.slice();tJump=[]}else tJump=[]}
 tSm.push(p.midi);if(tSm.length>7)tSm.shift();const so=[...tSm].sort((a,b)=>a-b),mid=so.length>>1,m=so.length>=3?(so[mid-1]+so[mid]+so[mid+1])/3:so[mid];
 let tg=null;const ts=tunTargets();
 if(tLock!=null&&!$('tauto').checked)tg=ts[tLock];else{let bd=99;for(const t of ts){const d=Math.abs(m-t.m);if(d<bd){bd=d;tg=t}}if(tLock!=null&&$('tauto').checked&&Math.abs(m-ts[tLock].m)<1.5)tg=ts[tLock]}
 const cents=(m-tg.m)*100,cl=Math.max(-50,Math.min(50,cents));
 tNeed=tNeed?tNeed+(cl-tNeed)*.45:cl;
 $('needle').style.transform=`rotate(${tNeed/50*60}deg)`;
 const far=Math.abs(cents)>100,cm=Math.round(m);
 $('tnote').innerHTML=far?`${nsh(cm)}<sub>${oct(cm)}</sub>`:`${nsh(tg.m)}<sub>${oct(tg.m)}</sub>`;
 const ok=Math.abs(cents)<=4||(tOk>0&&Math.abs(cents)<=7);tOk=ok?tOk+1:0;const shown=tOk>=3;
 tv.classList.toggle('intune',shown);
 th.className='thint'+(shown?' ok':'');
 th.innerHTML=shown?x.inT:far?esc(x.farT(nsh(tg.m)+oct(tg.m),cents<0)):`<b class="arr">${cents<0?'▲':'▼'}</b> ${cents<0?x.low:x.high} <span class="cn">${cents>0?'+':''}${Math.round(cents)}</span>`;
 if(shown&&tOk===3&&navigator.vibrate)navigator.vibrate(40);
 document.querySelectorAll('#strs button').forEach(b=>{b.classList.toggle('near',+b.dataset.ti===tg.i);if(shown&&+b.dataset.ti===tg.i)b.classList.add('done')});
}
function setMicCb(){Mic.minHz=view==='tuner'?Math.max(25,440*2**((Math.min(...tunTargets().map(t=>t.m))-69)/12)*.8):70;Mic.cb=view==='tuner'?tunerHear:(view==='five'&&FV.scr==='notesEx'&&EX?exHear:view==='five'&&FV.scr==='quest'&&Q?qHear:view==='five'&&FV.scr==='jam'&&JM&&JM.on?jamHear:null)}
document.addEventListener('DOMContentLoaded',()=>{
 $('tuning').onchange=e=>{tuningId=e.target.value;store.set('pcz-tuning',tuningId);tLock=null;renderTuner();setMicCb()};
 $('strs').onclick=e=>{const b=e.target.closest('[data-ti]');if(!b)return;const i=+b.dataset.ti;tLock=tLock===i?null:i;if($('tref').checked)pling(curTun().m[i]);renderTuner()};
 $('tauto').onchange=()=>{if($('tauto').checked)tLock=null;renderTuner()};
});
