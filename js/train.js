'use strict';
/* ---------- 5 minutes: daily plan + all practice tools ---------- */
let earSt=store.get('pcz-ear',{}),FV={scr:'home',plan:false},EX=null,CH=null,PA=null,EAR=null,CARD=null,YT=null;
const PLAN=['changes','notes','rhythm','cards','ear'];
const planToday=()=>planDone[today()]||[];
function markPlan(s){const t=today(),a=planDone[t]||[];if(!a.includes(s)){a.push(s);planDone[t]=a;store.set('pcz-plan',planDone)}}
function updToday(){const t=plog[today()]||0,x=X();const a=$('todayT');if(a){a.textContent=fmt(Math.min(t,5999))+' / 5:00';$('todayP').style.width=Math.min(100,t/3)+'%';$('streakT').textContent=t>=300?x.goal+' '+x.streak(streak()):x.streak(streak())}const et=$('exToday');if(et)et.textContent=fmt(t)+' / 5:00'}
function fiveGo(scr,plan){stopAll();if(scr==='changes')CH=null;if(scr==='ear')EAR=null;if(scr==='deg')DQ=null;if(scr==='jam')JM=null;if(scr==='rhythm'&&RT)RT.ph='setup';if(scr==='cards')CARD=null;FV={scr,plan:!!plan};activeTrain=!['home','notes','prog','path'].includes(scr)?scr:null;setMicCb();renderFive();window.scrollTo(0,0)}
function stopAll(){stopPlay();if(typeof Q!=='undefined'&&Q&&Q.to)clearTimeout(Q.to);if(PA&&PA.on)paStop();if(CH&&CH.tm){clearInterval(CH.tm)}chMicOff();jamStop();if(typeof rtStop==='function'&&RT&&RT.on)rtStop();if(YT&&YT.iv){clearInterval(YT.iv)}if(YT&&YT.player&&YT.player.pauseVideo)try{YT.player.pauseVideo()}catch(e){}}
function planNext(){markPlan(FV.scr==='notesEx'?'notes':FV.scr);const nx=PLAN.find(s=>!planToday().includes(s));if(!nx){fiveGo('home');return}startPlanStep(nx)}
function startPlanStep(s){if(s==='notes'){FV={scr:'quest',plan:true};qBegin(qCurrent());window.scrollTo(0,0);return}if(s==='cards'&&!done.length){fiveGo('cards',true);return}fiveGo(s,true)}
function head(title,mic){const x=X(),pd=planToday().length;return `<div class="exhead"><button id="exBack">${x.back5}</button><div class="row"><span class="muted" id="exToday"></span>${FV.plan?`<span class="chip on" style="min-height:32px">${x.planL} ${Math.min(pd+1,4)}/4</span>`:''}${mic?`<span class="micchip"><span class="dotm"></span><button data-mic></button></span>`:''}</div></div><p class="t micmsg"></p><h2 class="exT">${title}</h2>`}
function nextBtn(){return FV.plan?`<button class="fire" id="planNext">${planToday().length>=PLAN.length-1?X().planFinish:X().planNext}</button>`:''}
function bindHead(){$('exBack').onclick=()=>fiveGo('home');const pn=$('planNext');if(pn)pn.onclick=planNext;updToday();micUI()}
function renderFive(){
 regN=Math.max(regN,700);const x=X(),el=$('fiveC'),s=FV.scr;
 if(s==='home'){
  const pd=planToday(),all=PLAN.every(p=>pd.includes(p)),dc=dueCards().length;
  const stepT={changes:x.ex.changes,notes:x.ex.path,rhythm:x.ex.rhythm,cards:x.ex.cards,ear:x.ex.ear};
  const nx=PLAN.find(p=>!pd.includes(p));
  el.innerHTML=`<h1 class="vt">${x.fiveT}</h1><p class="muted">${x.fiveSub}</p>${tipCard()}
  <div class="panel hero"><div class="herotop"><div><div class="lbl">${x.today}</div><div class="today" id="todayT"></div></div><div class="muted" id="streakT"></div></div><div class="prog"><i id="todayP"></i></div>
  <ol class="steps">${PLAN.map((p,i)=>`<li class="${pd.includes(p)?'dn':p===nx?'nx':''}"><span class="n">${pd.includes(p)?'✓':i+1}</span><div><b>${stepT[p][0]}</b><span>${x.planDurK[p]}</span></div></li>`).join('')}</ol>
  ${all?`<p class="donemsg">${x.todayDone}</p>`:`<button class="fire big" id="planGo">${pd.length?x.todayCont:x.todayGo}</button>`}</div>
  <button class="prgbtn" id="toProg"><span><b>${x.progress}</b><small>${x.progressSub}</small></span><i>›</i></button>
  <details class="more5"${all?' open':''}><summary>${x.moreEx}${dc?` <em>${x.dueN(dc)}</em>`:''}</summary>
  <div class="exs6">${['path','rhythm','jam','notes','changes','along','ear','deg','cards','yt'].map(k=>`<button class="ex" data-go="${k}"><b>${x.ex[k][0]}</b><span>${x.ex[k][1]}</span>${k==='cards'&&dc?`<em>${x.dueN(dc)}</em>`:''}</button>`).join('')}</div></details>`;
  updToday();if($('planGo'))$('planGo').onclick=()=>{if(nx)startPlanStep(nx)};$('toProg').onclick=()=>fiveGo('prog');
  el.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>fiveGo(b.dataset.go));return;
 }
 if(s==='prog')return renderProgress();
 if(s==='path')return renderPath();
 if(s==='quest')return Q?qRender():renderPath();
 if(s==='notes')return renderNotesHome();
 if(s==='notesEx')return renderEx();
 if(s==='changes')return renderChanges();
 if(s==='along')return renderAlong();
 if(s==='ear')return renderEar();
 if(s==='deg')return renderDeg();
 if(s==='jam')return renderJam();
 if(s==='rhythm')return renderRhythm();
 if(s==='cards')return renderCards();
 if(s==='yt')return renderYT();
}

/* --- fretboard notes --- */
const NAT=[0,2,4,5,7,9,11],STAGE_S=[[5,4],[5,4,3,2],[0,1,2,3,4,5],[0,1,2,3,4,5]];
const pool=()=>{const ss=STAGE_S[stage-1],out=[];for(const s of ss)for(let f=0;f<=12;f++){const pc=(OPEN[s]+f)%12;if(stage===4||NAT.includes(pc))out.push({s,f,pc})}return out};
const mast=(s,f)=>{const v=stats[s+'-'+f];if(!v||!v[1])return 0;const r=v[0]/v[1];return v[1]>=3&&r>=.8?3:r>=.6?2:1};
function rec(s,f,ok){const k=s+'-'+f,v=stats[k]||[0,0];v[0]+=ok?1:0;v[1]++;if(v[1]>8){v[0]*=.85;v[1]*=.85}stats[k]=v;store.set('pcz-stats',stats)}
function wpick(arr,wf){let tot=0;const w=arr.map(a=>{const v=wf(a);tot+=v;return v});let r=Math.random()*tot;for(let i=0;i<arr.length;i++){r-=w[i];if(r<=0)return arr[i]}return arr[arr.length-1]}
const posW=p=>{const v=stats[p.s+'-'+p.f];return v&&v[1]?1+(1-v[0]/v[1])*5:3};
function renderNotesHome(){
 const x=X(),el=$('fiveC');
 el.innerHTML=head(x.ex.notes[0])+`<div class="lbl">${x.stageL}</div><div class="chips" id="stages">${x.stages.map(([a,b],i)=>`<button class="chip${stage===i+1?' on':''}" data-st="${i+1}" title="${esc(b)}">${a}</button>`).join('')}</div>
 <div class="exs">${x.nex.map(([a,b],i)=>`<button class="ex" data-ex="${i}"><b>${a}</b><span>${b}</span></button>`).join('')}</div>
 <div class="panel"><div class="lbl">${x.mapL}</div><div class="fbwrap"><div class="fb" id="fbMap"><svg></svg></div></div><div class="legend">${[['#2e9e6b',0],['#e8b031',1],['#e5484d',2],['#ffffff55',3]].map(([c,i])=>`<span><i style="background:${c};border:1px solid #0003"></i>${x.leg[i]}</span>`).join('')}</div></div>`;
 bindHead();
 setBoard($('fbMap'),{frets:12,marks:pool().map(p=>({s:p.s,f:p.f,k:'h'+mast(p.s,p.f),t:nsh(p.pc)})),lefty});
 $('stages').onclick=e=>{const b=e.target.closest('[data-st]');if(b){stage=+b.dataset.st;store.set('pcz-stage',stage);store.set('pcz-stageman',true);renderNotesHome()}};
 el.querySelectorAll('[data-ex]').forEach(b=>b.onclick=()=>{FV.scr='notesEx';activeTrain='notesEx';startEx(+b.dataset.ex)});
}
function nextFindNote(){const notes=stage===4?[...Array(12).keys()]:[4,9,2,7,0,5,11];let best=null,bs=9;for(const pc of notes){let s=0;for(let st=0;st<6;st++)s+=mast(st,(pc-OPEN[st]+12)%12);const v=s/6+(EX&&EX.pc===pc?5:0)+Math.random()*.3;if(v<bs){bs=v;best=pc}}return best}
function startEx(type,keepPc,plan){
 stopPlay();EX={type,t0:Date.now(),ok:0,tot:0,run:0,miss:0,done:false,gap:true};
 if(type===0){EX.pc=keepPc??nextFindNote();EX.seq=[5,4,3,2,1,0,1,2,3,4,5];EX.i=0;EX.found=[]}
 if(type===1)nextName();
 if(type===2){const notes=stage===4?[...Array(12).keys()]:NAT;EX.pc=keepPc??wpick(notes,pc=>{const ps=pool().filter(p=>p.pc===pc);return ps.length?ps.reduce((a,p)=>a+posW(p),0)/ps.length:0});EX.need=pool().filter(p=>p.pc===EX.pc).map(p=>p.s+'-'+p.f);EX.found=[];EX.bad=[]}
 setMicCb();renderFive();
}
function nextName(){const p=wpick(pool(),posW);EX.pos=p;EX.ans=null;EX.lock=false}
function renderEx(){
 const x=X(),e=EX,ex=$('fiveC');if(!e)return fiveGo('notes');let prompt='',extra='',marks=[],hl=null,tap=null;
 const finished=e.done||(e.type===1&&e.tot>=10);
 if(e.type===0){const s=e.seq[Math.min(e.i,e.seq.length-1)];hl=e.done?null:s;
  marks=e.done?e.found.map(([s,f])=>({s,f,k:'good',t:nsh(e.pc)})):(e.blink?[{s:e.blink[0],f:e.blink[1],k:'good',t:nsh(e.pc)}]:[]);
  if(e.flash)marks.push({s:e.flash[0],f:e.flash[1],k:'bad',t:nsh((OPEN[e.flash[0]]+e.flash[1])%12)});
  prompt=e.done?'':`<div class="prompt"><span class="big">${nsh(e.pc)}</span><p>${(Mic.on?x.playOn:x.tapOn)(nsh(e.pc),x.stringN[s])}<br><span class="t">${e.i+1} / ${e.seq.length} · ${x.sayIt}</span></p></div>`;
  if(e.done){const sec=Math.round((e.end-e.t0)/1000);for(let s=0;s<6;s++){if((e.pc-OPEN[s]+12)%12===0)marks.push({s,f:12,k:'good',t:nsh(e.pc)})}extra=`<div class="result"><h3>${x.roundDone(nsh(e.pc),sec)}</h3><div class="row" style="margin-top:10px">${nextBtn()}<button class="${FV.plan?'':'fire'}" id="exNext">${x.nextNote}</button><button id="exAgain">${x.again}</button></div></div>`}
  else tap=(s2,f)=>{if(s2!==e.seq[e.i])return;exAnswer((OPEN[s2]+f)%12,s2,f)};
 }
 if(e.type===1){const p=e.pos;marks=[{s:p.s,f:p.f,k:e.ans==null?'target':(e.ans?'good':'bad'),t:e.ans==null?'':nsh(p.pc)}];
  const names=stage===4?[...Array(12).keys()]:NAT;
  prompt=`<div class="prompt"><p><b>${x.nameQ}</b><br><span class="t">${x.orPlay}</span></p></div>`;
  extra=`<div class="ansb${names.length>7?' x12':''}">${names.map(pc=>`<button data-pc="${pc}" class="${e.ans!=null&&pc===p.pc?'ok':e.ans===false&&pc===e.picked?'no':''}">${nsh(pc)}</button>`).join('')}</div><div class="score" style="margin-top:12px"><span>${x.streakL}: <b>${e.run}</b></span><span>${x.accL}: <b>${e.tot?Math.round(e.ok/e.tot*100):0} %</b></span><span>${e.tot} / 10</span></div>`+(finished&&FV.plan?`<div class="result"><h3>${x.tenDone(e.ok)}</h3><div class="row" style="margin-top:10px">${nextBtn()}</div></div>`:'');
 }
 if(e.type===2){marks=e.found.map(k=>{const [s,f]=k.split('-').map(Number);return {s,f,k:'good',t:nsh(e.pc)}}).concat(e.bad.map(k=>{const [s,f]=k.split('-').map(Number);return {s,f,k:'bad',t:nsh((OPEN[s]+f)%12)}}));
  if(e.reveal)e.need.filter(k=>!e.found.includes(k)).forEach(k=>{const [s,f]=k.split('-').map(Number);marks.push({s,f,k:'ghost',t:nsh(e.pc)})});
  prompt=`<div class="prompt"><span class="big">${nsh(e.pc)}</span><p>${x.allQ(nsh(e.pc),e.need.length)}<br><span class="t">${e.found.length} / ${e.need.length}</span></p></div>`;
  if(e.done){const sec=Math.round((e.end-e.t0)/1000);extra=`<div class="result"><h3>${x.allDone(nsh(e.pc),sec,e.miss)}</h3><div class="row" style="margin-top:10px">${nextBtn()}<button class="${FV.plan?'':'fire'}" id="exNext">${x.nextNote}</button><button id="exAgain">${x.again}</button></div></div>`}
  else{extra=`<div class="row" style="margin-top:12px"><button id="exReveal">${x.showRest}</button></div>`;tap=(s,f)=>{const k=s+'-'+f;if(e.found.includes(k)||!STAGE_S[stage-1].includes(s))return;if(e.need.includes(k)){e.found.push(k);rec(s,f,true);e.bad=[];pling(OPENM[s]+f);if(e.found.length===e.need.length){e.done=true;e.end=Date.now()}}else{e.bad=[k];e.miss++;rec(s,f,false)}renderEx()}}
 }
 ex.innerHTML=head(x.nex[e.type][0],true)+(Mic.on?'':`<p class="t">${x.micHint}</p>`)+prompt+`<div class="fbwrap"><div class="fb" id="fbEx"><svg></svg></div></div><div class="heard" id="heard"></div>`+extra;
 bindHead();if(!FV.plan){$('exBack').onclick=()=>{EX=null;fiveGo('notes')}}
 setBoard($('fbEx'),{frets:12,marks,hl,lefty,tap});
 const nb=$('exNext');if(nb)nb.onclick=()=>startEx(e.type);const ag=$('exAgain');if(ag)ag.onclick=()=>startEx(e.type,e.pc);
 const rv=$('exReveal');if(rv)rv.onclick=()=>{e.reveal=true;renderEx()};
 ex.querySelectorAll('[data-pc]').forEach(b=>b.onclick=()=>nameAnswer(+b.dataset.pc));
}
function exAnswer(pc,s,f){const e=EX;if(!e||e.type!==0||e.done)return;const s0=e.seq[e.i],target=(e.pc-OPEN[s0]+12)%12;
 if(pc===e.pc){if(!e.found.some(([a,b])=>a===s0&&b===target))rec(s0,target,true);e.found.push([s0,target]);e.flash=null;e.blink=[s0,target];const bk=e.blink;setTimeout(()=>{if(EX===e&&e.blink===bk){e.blink=null;renderEx()}},600);pling(OPENM[s0]+target);e.i++;if(e.i>=e.seq.length){e.done=true;e.end=Date.now()}}
 else if(f!=null){e.flash=[s,f];rec(s0,target,false);e.miss++}
 renderEx()}
function nameAnswer(pc){const e=EX;if(!e||e.type!==1||e.lock||e.tot>=10&&FV.plan)return;const p=e.pos,ok=pc===p.pc;e.lock=true;e.ans=ok;e.picked=pc;e.tot++;if(ok){e.ok++;e.run++;pling(OPENM[p.s]+p.f)}else e.run=0;rec(p.s,p.f,ok);renderEx();if(FV.plan&&e.tot>=10)return;setTimeout(()=>{if(EX===e){nextName();renderEx()}},ok?650:1500)}
function exHear(p){const e=EX;if(!e)return;const h=$('heard');
 if(!p){e.gap=true;e.st=0;if(h)h.innerHTML='';return}
 const pc=((Math.round(p.midi)%12)+12)%12;if(h)h.innerHTML=X().heard(nsh(pc));
 if(p.onset)e.gap=true;
 if(pc===e.lpc)e.st=(e.st||0)+1;else{e.lpc=pc;e.st=1}
 if(e.st<3||!e.gap)return;
 if(e.type===0&&!e.done){if(pc===e.pc){e.gap=false;exAnswer(pc)}else if(e.st===3&&h)h.innerHTML=X().wrongHeard(nsh(pc),nsh(e.pc))}
 else if(e.type===1&&!e.lock&&e.st===3){e.gap=false;nameAnswer(pc)}
}

/* --- chord changes in one minute --- */
const ckey=c=>c.root+'|'+c.q+'|'+c.ext;
const pkey=(a,b)=>[ckey(a),ckey(b)].sort().join('~');
function vFor(c){const vs=voicings(c);if(typeof isSimp==='function'&&isSimp()&&view==='song')return vs.slice().sort((a,b)=>a.l-b.l)[0];if(PL()==='adv'&&vs[0].l===1){const b=vs.find(v=>v.l===2);if(b)return b}return vs[0]}
const diff=c=>vFor(c).l;
const XP={beg:[[4,'m',9,'m'],[2,'M',9,'M'],[2,'M',4,'M'],[9,'M',4,'M'],[9,'m',4,'M'],[0,'M',7,'M'],[7,'M',2,'M']],adv:[[0,'m',5,'m'],[5,'M',10,'M'],[1,'m',8,'M'],[9,'M',2,'m'],[6,'m',1,'m'],[11,'M',4,'M'],[8,'m',1,'m']]};
const vpos=c=>{const f=vFor(c).f.filter(x=>x>0);return f.length?Math.min(...f):0};
const vshape=c=>{const f=vFor(c).f;return f[0]<0?'A':'E'};
const chGoal=()=>PL()==='beg'?40:60;
function songPairs(){analyze();const s=seqOf(A.cs);const out=new Map();for(let i=0;i<s.length;i++){const a=s[i],b=s[(i+1)%s.length];if(ckey(a)===ckey(b))continue;const k=pkey(a,b);if(!out.has(k))out.set(k,[a,b])}let L=[...out.values()];if(PL()==='beg')L=L.filter(([a,b])=>diff(a)===0&&diff(b)===0);const xp=XP[PL()];if(xp&&(L.length<4||PL()==='adv'))for(const [r1,q1,r2,q2] of xp){const a=C0(r1,q1),b=C0(r2,q2);if(!L.some(([x,y])=>pkey(x,y)===pkey(a,b))){const pr=[a,b];pr.xp=1;L.push(pr)}}
 const out2=L.map(pr=>{const [a,b]=pr;const r=chRec[pkey(a,b)]||[],best=r.length?Math.max(...r.map(z=>z.n)):0;return {a,b,best,xp:!!pr.xp,score:(diff(a)+diff(b))*30+(PL()==='adv'?Math.abs(vpos(a)-vpos(b))*8+(vshape(a)!==vshape(b)?25:0):0)-best}}).sort((p,q)=>q.score-p.score);if(PL()!=='adv')return out2.slice(0,6);const sp=out2.filter(o=>!o.xp).slice(0,3);return sp.concat(out2.filter(o=>o.xp).slice(0,6-sp.length))}
const BASIC=[[0,'M'],[2,'M'],[4,'M'],[5,'M'],[7,'M'],[9,'M'],[11,'M'],[9,'m'],[2,'m'],[4,'m'],[11,'m'],[0,'M','7'],[2,'M','7'],[4,'M','7'],[7,'M','7'],[9,'M','7'],[11,'M','7']].map(([r,q,e])=>C0(r,q,e||''));
function renderChanges(){
 const x=X(),el=$('fiveC');if(!CH){const ps=songPairs();CH={a:ps[0]?ps[0].a:BASIC[0],b:ps[0]?ps[0].b:BASIC[4],ph:'setup',n:0}}
 const r=chRec[pkey(CH.a,CH.b)]||[],best=r.length?Math.max(...r.map(z=>z.n)):0,last=r.length?r[r.length-1].n:null;
 const pairs=songPairs(),G=chGoal(),dg=c=>`<div class="dgc"><b class="cn">${esc(cname(c))}</b>${diag(vFor(c))}</div>`;if(CH.force==null)CH.force=PL()==='adv';
 let body='';
 if(CH.ph==='setup'){
  const opts=sel=>uniq(BASIC.concat(A.us).map(c=>ckey(c))).map(k=>{const [r,q,e]=k.split('|');const c=C0(+r,q,e);return `<option value="${esc(k)}"${k===ckey(sel)?' selected':''}>${esc(cname(c))}</option>`}).join('');
  body=`<p class="muted">${x.chHow}</p>${pairs.length?`<div class="lbl" style="margin-top:12px">${x.chFromSong}</div><div class="chips">${pairs.map((p,i)=>`${p.xp&&(!i||!pairs[i-1].xp)?`</div><div class="lbl" style="margin-top:10px">${x.chHard}</div><div class="chips">`:''}<button class="chip${pkey(p.a,p.b)===pkey(CH.a,CH.b)?' on':''}" data-pp="${i}">${esc(p.xp?withFlat(false,()=>cname(p.a)):cname(p.a))} ↔ ${esc(p.xp?withFlat(false,()=>cname(p.b)):cname(p.b))}${p.best?` · ${p.best}`:''}</button>`).join('')}</div>`:''}
  <div class="row" style="margin:6px 0 14px"><span class="muted">${x.chOwn}</span><select id="chA" style="width:auto">${opts(CH.a)}</select><span>↔</span><select id="chB" style="width:auto">${opts(CH.b)}</select></div>
  <div class="pair">${dg(CH.a)}<span class="arr">↔</span>${dg(CH.b)}</div>
  <div class="goal"><div class="lbl">${x.chRec}: <b>${best||'–'}</b>${last!=null?` · ${x.chLast}: ${last}`:''} · ${x.chGoalN(G)}</div><div class="prog"><i style="width:${Math.min(100,best/G*100)}%"></i></div></div>
  <label class="sw" style="justify-content:center"><input type="checkbox" id="chF" ${CH.force?'checked':''}> <span>${x.chForce}</span></label>
  <label class="sw" style="justify-content:center"><input type="checkbox" id="chM" ${store.get('pcz-chmic',true)?'checked':''}> <span>${x.chMicL}</span></label><p class="micmsg t center"></p>
  <button class="fire big1" id="chGo">${x.chStart}</button>`;
 }
 if(CH.ph==='run'){body=`<div class="bigtimer" id="chT">${CH.left>60?CH.left-60:CH.left}</div><p class="center">${CH.left>60?x.chReady:x.chNow(esc(cname(CH.a)),esc(cname(CH.b)))}</p>${CH.mic?`<div class="chlive"><span class="dotm on"></span> ${x.chHeard} <b id="chAuto">${CH.auto||0}</b> ${mhLink()}</div>`:''}<div class="pair" id="chPair">${dg(CH.a).replace('class="dgc"','class="dgc" data-w="a"')}<span class="arr">↔</span>${dg(CH.b).replace('class="dgc"','class="dgc" data-w="b"')}</div><button id="chStop">${x.stopM}</button>`}
 if(CH.ph==='enter'){body=`<h3 class="center" style="font-size:28px">${CH.mic&&CH.lab?x.chMicSaid:x.chHowMany}</h3><div class="row center" style="justify-content:center;margin:14px 0"><button class="sq" data-d="-5">−5</button><button class="sq" data-d="-1">−</button><output class="bignum" id="chN">${CH.n}</output><button class="sq" data-d="1">+</button><button class="sq" data-d="5">+5</button></div><p class="t center">${CH.mic&&CH.lab?x.chMicFix:CH.mic?x.chMicNone:x.chCount}</p><div class="row" style="justify-content:center"><button class="fire" id="chSave">${x.save}</button></div>`}
 if(CH.ph==='saved'){body=`<div class="result"><h3>${x.chSaved(CH.n,best)}</h3><div class="prog"><i style="width:${Math.min(100,Math.max(best,CH.n)/G*100)}%"></i></div><p class="t">${x.chGoalN(G)} · ${x.chTip}</p><div class="row" style="margin-top:10px">${nextBtn()}<button id="chAgain">${x.again}</button><button id="chOther">${x.chOther}</button></div></div>`}
 el.innerHTML=head(x.ex.changes[0])+body;bindHead();
 el.querySelectorAll('[data-pp]').forEach(b=>b.onclick=()=>{const p=pairs[+b.dataset.pp];CH.a=p.a;CH.b=p.b;renderChanges()});
 const fromKey=k=>{const [r,q,e]=k.split('|');return C0(+r,q,e)};
 if($('chA')){$('chA').onchange=e=>{CH.a=fromKey(e.target.value);renderChanges()};$('chB').onchange=e=>{CH.b=fromKey(e.target.value);renderChanges()}}
 if($('chM'))$('chM').onchange=e=>store.set('pcz-chmic',e.target.checked);
 if($('chGo'))$('chGo').onclick=async()=>{try{actx()}catch(e){}CH.mic=false;CH.auto=0;CH.lab=null;CH.cand=null;CH.run=0;
  if(store.get('pcz-chmic',true)){Mic.cb=null;if(await micStart()){CH.mic=true;Mic.fast=true;Mic.ccb=chHear}}
  CH.ph='run';CH.left=63;renderChanges();CH.tm=setInterval(()=>{CH.left--;try{if(CH.left>60||CH.left===0||CH.force)click(ac.currentTime+.01,CH.left===0||CH.left===60)}catch(e){}if(CH.left<=0){clearInterval(CH.tm);chMicOff();CH.ph='enter';CH.n=CH.mic&&CH.lab?CH.auto:(last||20);renderChanges();return}const t=$('chT');if(t)t.textContent=CH.left>60?CH.left-60:CH.left;if(CH.left===60)renderChanges()},1000)};
 if($('chF'))$('chF').onchange=e=>{CH.force=e.target.checked};
 if($('chStop'))$('chStop').onclick=()=>{clearInterval(CH.tm);chMicOff();CH.ph='setup';renderChanges()};
 el.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{CH.n=Math.max(0,CH.n+ +b.dataset.d);$('chN').textContent=CH.n});
 if($('chSave'))$('chSave').onclick=()=>{const k=pkey(CH.a,CH.b);(chRec[k]=chRec[k]||[]).push({d:today(),n:CH.n});chRec[k]=chRec[k].slice(-30);store.set('pcz-ch',chRec);CH.ph='saved';if(FV.plan)markPlan('changes');renderChanges()};
 if($('chAgain'))$('chAgain').onclick=()=>{CH.ph='setup';renderChanges()};if($('chOther'))$('chOther').onclick=()=>{CH=null;renderChanges()};
}

function chMicOff(){Mic.fast=false;if(Mic.ccb){Mic.ccb=null;micStop()}}
function chHear(ch,r){
 if(!CH||CH.ph!=='run'||CH.left>60||r<0.0035)return;
 const sa=chordFit(ch,CH.a),sb=chordFit(ch,CH.b),lab=sa>sb+.05?'a':sb>sa+.05?'b':null;if(!lab)return;
 if(lab===CH.cand)CH.run++;else{CH.cand=lab;CH.run=1}
 if(CH.run>=2&&lab!==CH.lab){if(CH.lab)CH.auto++;CH.lab=lab;const o=$('chAuto');if(o)o.textContent=CH.auto;document.querySelectorAll('#chPair [data-w]').forEach(d=>d.classList.toggle('hot',d.dataset.w===lab))}
}
/* --- play along --- */
const PATS={doby:'D-D-D-D-',tabor:'D-DU-UDU',osm:'DUDUDUDU',valcik:'D-D-D-'};
function renderAlong(){
 const x=X(),el=$('fiveC');analyze();
 if(!PA){const L=PL();PA={on:false,bpm:store.get('pcz-pabpm',{beg:60,mid:80,adv:96}[L]),per:{beg:2,mid:1,adv:1}[L],pat:{beg:'doby',mid:'tabor',adv:'osm'}[L],snd:true,i:0,slot:-1}}
 const ch=A.cs.length?A.cs:[C0(7,'M'),C0(0,'M'),C0(2,'M')],len=PATS[PA.pat].length,cur_=ch[PA.i%ch.length],nx=ch[(PA.i+1)%ch.length];
 el.innerHTML=head(x.ex.along[0])+`<p class="muted">${x.paHow(esc(curSong().name||''))}</p>
 <div class="pa"><div class="pa-now"><div class="lbl">${x.paNow}</div><div class="pa-ch" id="paC">${esc(cname(cur_))}</div><div class="lbl">${x.paNext}: <b id="paN">${esc(cname(nx))}</b></div></div><div class="dgw" id="paD">${diag(vFor(cur_))}</div></div>
 <div class="strumrow" id="paS">${[...PATS[PA.pat]].map((c,i)=>`<span class="sl${i%2?' off':''}">${c==='D'?'↓':c==='U'?'↑':'·'}<small>${i%2?'a':i/2+1}</small></span>`).join('')}</div>
 <div class="row" style="justify-content:center;margin:12px 0"><button class="${PA.on?'pri':'fire'} big1" id="paGo">${PA.on?x.stopM:x.start}</button></div>
 <div class="panel"><div class="row"><span class="muted">BPM</span><button class="sq" id="pbm">−</button><output>${PA.bpm}</output><button class="sq" id="pbp">+</button></div>
 <div class="row" style="margin-top:10px"><span class="muted">${x.paPat}</span><div class="seg" id="paPat">${Object.keys(PATS).map(k=>`<button data-k="${k}" class="${PA.pat===k?'on':''}">${x.pats[k]}</button>`).join('')}</div></div>
 <div class="row" style="margin-top:10px"><span class="muted">${x.paPer}</span><div class="seg" id="paPer">${[.5,1,2].map(v=>`<button data-v="${v}" class="${PA.per===v?'on':''}">${v===.5?'½':v}</button>`).join('')}</div></div>
 <label class="sw"><input type="checkbox" id="paSnd" ${PA.snd?'checked':''}> <span>${x.paSnd}</span></label></div>`;
 bindHead();
 $('paGo').onclick=()=>{PA.on?paStop():paStart();renderAlong()};
 $('pbm').onclick=()=>{PA.bpm=Math.max(40,PA.bpm-4);store.set('pcz-pabpm',PA.bpm);renderAlong()};$('pbp').onclick=()=>{PA.bpm=Math.min(180,PA.bpm+4);store.set('pcz-pabpm',PA.bpm);renderAlong()};
 $('paPat').onclick=e=>{const b=e.target.closest('[data-k]');if(b){PA.pat=b.dataset.k;if(PA.on){paStop();paStart()}renderAlong()}};
 $('paPer').onclick=e=>{const b=e.target.closest('[data-v]');if(b){PA.per=+b.dataset.v;renderAlong()}};
 $('paSnd').onchange=e=>{PA.snd=e.target.checked};
}
function paStart(){
 try{actx()}catch(e){return}analyze();const ch=A.cs.length?A.cs:[C0(7,'M'),C0(0,'M'),C0(2,'M')];
 PA.on=true;PA.i=0;PA.slot=-1;PA.g=ac.createGain();PA.g.gain.value=.8;PA.g.connect(ac.destination);
 const pat=PATS[PA.pat],L=pat.length;let n=-L,t=ac.currentTime+.1;PA.nextT=t;
 PA.tm=setInterval(()=>{const sd=60/PA.bpm/2;while(PA.nextT<ac.currentTime+.12){const slot=((n%L)+L)%L,bar=Math.floor(n/L),t0=PA.nextT;
   const slotsPerChord=Math.max(1,Math.round(L*PA.per)),ci=n>=0?Math.floor(n/slotsPerChord):0,c=ch[ci%ch.length];
   if(slot%2===0)click(t0,slot===0,PA.g);
   if(n>=0&&PA.snd&&pat[slot]!=='-')strum(c,t0,pat[slot],pat[slot]==='U'?.12:.18,PA.g,sd*1.8);
   const nn_=n;setTimeout(()=>{if(!PA||!PA.on)return;paUI(nn_,slot,ch,slotsPerChord)},Math.max(0,(t0-ac.currentTime)*1000));
   n++;PA.nextT+=sd}},25);
}
function paUI(n,slot,ch,spc){document.querySelectorAll('#paS .sl').forEach((s,i)=>s.classList.toggle('hit',i===slot));if(n<0){const c=$('paC');if(c&&slot%2===0)c.textContent=String(Math.floor((n+PATS[PA.pat].length)/2)+1);return}
 const ci=Math.floor(n/spc);if(ci!==PA.i||n%spc===0){PA.i=ci;const c=ch[ci%ch.length],nx=ch[(ci+1)%ch.length];const a=$('paC');if(a){a.textContent=cname(c);$('paN').textContent=cname(nx);$('paD').innerHTML=diag(vFor(c))}}}
function paStop(){if(!PA)return;PA.on=false;clearInterval(PA.tm);try{PA.g.disconnect()}catch(e){}}

/* --- ear: where does it go? --- */
function earOpts(k){const lv=level||'beg';if(!k.minor)return ['5M','7M','9m'].concat(lv!=='beg'?['2m']:[]).concat(lv==='adv'?['4m','10M']:[]);return ['5m','7M','8M'].concat(lv!=='beg'?['3M']:[]).concat(lv==='adv'?['10M','7m']:[])}
const idChord=(k,id)=>C0(k.t+parseInt(id),id.endsWith('m')?'m':'M');
function renderEar(){
 const x=X(),el=$('fiveC');analyze();
 if(!EAR){const k=A.k||{t:0,minor:false};EAR={k,n:0,ok:0,t:null,ans:null}}
 const k=EAR.k,opts=earOpts(k),I=C0(k.t,k.minor?'m':'M');
 if(!EAR.t){let t;do{t=opts[Math.floor(Math.random()*opts.length)]}while(t===EAR.prev&&opts.length>1);EAR.t=t;EAR.ans=null;setTimeout(()=>play([I,idChord(k,t)],null,1.2),300)}
 const lbl=id=>{const r=role(idChord(k,id),k);return `<b>${r.word}</b>${level==='beg'?'':`<small>${r.num}</small>`}`};
 const done5=EAR.n>=5;
 el.innerHTML=head(x.ex.ear[0])+`<p class="muted">${x.earHow(keyName(k))}</p>
 <div class="row" style="margin:12px 0">${pbtn(x.earAgain,[I,idChord(k,EAR.t)],{cls:'fire',step:1.2})}${pbtn(x.earHome,[I])}</div>
 <div class="earb">${opts.map(id=>`<button data-id="${id}" class="${EAR.ans?id===EAR.t?'ok':id===EAR.ans?'no':'':''}">${lbl(id)}</button>`).join('')}</div>
 <p class="qfb" id="earFb">${EAR.ans?(EAR.ans===EAR.t?x.right:x.earWas(role(idChord(k,EAR.t),k).word))+' '+(EAR.ans?esc(cname(idChord(k,EAR.t))):''):''}</p>
 <div class="score"><span>${x.accL}: <b>${EAR.n?Math.round(EAR.ok/EAR.n*100):0} %</b></span><span>${FV.plan?EAR.n+' / 5':EAR.n+'×'}</span></div>
 ${EAR.ans?`<div class="row" style="margin-top:12px">${pbtn(x.earCompare,[I,idChord(k,EAR.t),I],{step:1.1})}${done5&&FV.plan?nextBtn():`<button class="pri" id="earNext">${x.next1}</button>`}</div>`:''}
 <p class="t" style="margin-top:14px">${x.earTip}</p>`;
 bindHead();
 el.querySelectorAll('[data-id]').forEach(b=>b.onclick=()=>{if(EAR.ans)return;EAR.ans=b.dataset.id;EAR.n++;if(EAR.ans===EAR.t)EAR.ok++;{const d=today(),v=earSt[d]||[0,0];v[1]++;if(EAR.ans===EAR.t)v[0]++;earSt[d]=v;store.set('pcz-ear',earSt)}if(EAR.n>=5&&FV.plan)markPlan('ear');renderEar()});
 if($('earNext'))$('earNext').onclick=()=>{EAR.prev=EAR.t;EAR.t=null;renderEar()};
}

/* --- ear: scale degrees (functional ear training) --- */
let DQ=null,degSt=store.get('pcz-deg',{});
const DLAB=['1','♭2','2','♭3','3','4','♯4','5','♭6','6','♭7','7'];
function degSet(k){const sc=k.minor?[0,2,3,5,7,8,10]:[0,2,4,5,7,9,11];return level==='beg'?[0,k.minor?3:4,7]:level==='adv'?[0,1,2,3,4,5,6,7,8,9,10,11]:sc}
function degPlay(cad){stopPlay();try{actx()}catch(e){return}master=ac.createGain();master.gain.value=.7;master.connect(ac.destination);let t=ac.currentTime+.06;
 if(cad){for(const c of DQ.cad){strum(c,t,'D',.2);t+=.8}t+=.4}note(DQ.base+DQ.t,t,.6,master,1.8)}
function degResolve(){const k=DQ.k,sc=k.minor?[0,2,3,5,7,8,10]:[0,2,4,5,7,9,11],d=DQ.t,path=[d];
 if(d>6){for(const x of sc.concat(12))if(x>d)path.push(x)}else{for(const x of sc.slice().reverse())if(x<d)path.push(x)}
 if(path[path.length-1]!==0&&path[path.length-1]!==12)path.push(d>6?12:0);play(path.map(x=>DQ.base+x),null,.42,true)}
function renderDeg(){
 const x=X(),el=$('fiveC');analyze();
 if(!DQ){const k=A.k||{t:0,minor:false},q=k.minor?'m':'M';DQ={k,n:0,ok:0,t:null,ans:null,base:55+((k.t-7+12)%12),cad:[C0(k.t,q),C0(k.t+5,q),C0(k.t+7,'M'),C0(k.t,q)]}}
 const k=DQ.k,opts=degSet(k);
 if(DQ.t==null){let t;do{t=opts[Math.floor(Math.random()*opts.length)]}while(t===DQ.prev&&opts.length>1);DQ.t=t;DQ.ans=null;setTimeout(()=>degPlay(DQ.n===0||DQ.newKey),250);DQ.newKey=false}
 const nm=d=>x.degN[d]||'';
 el.innerHTML=head(x.ex.deg[0])+`<p class="muted">${x.degHow(keyName(k))}</p>
 <div class="row" style="margin:12px 0"><button class="fire" id="dgCad">${x.degCad}</button><button id="dgNote">${x.degNote}</button></div>
 <div class="earb deg">${opts.map(d=>`<button data-dg="${d}" class="${DQ.ans!=null?d===DQ.t?'ok':d===DQ.ans?'no':'':''}"><b>${DLAB[d]}</b><small>${nm(d)}</small></button>`).join('')}</div>
 <p class="qfb">${DQ.ans!=null?(DQ.ans===DQ.t?x.right:x.degWas(DLAB[DQ.t]))+' '+x.degWhy[DQ.t]:''}</p>
 <div class="score"><span>${x.accL}: <b>${DQ.n?Math.round(DQ.ok/DQ.n*100):0} %</b></span><span>${DQ.n}×</span></div>
 ${DQ.ans!=null?`<div class="row" style="margin-top:12px"><button id="dgRes">${x.degRes}</button><button class="pri" id="dgNext">${x.next1}</button></div>`:''}
 <p class="t" style="margin-top:14px">${x.degTip}</p>`;
 bindHead();
 $('dgCad').onclick=()=>degPlay(true);$('dgNote').onclick=()=>degPlay(false);
 el.querySelectorAll('[data-dg]').forEach(b=>b.onclick=()=>{if(DQ.ans!=null){note(DQ.base+ +b.dataset.dg,actx().currentTime+.02,.6,ac.destination,1.2);return}DQ.ans=+b.dataset.dg;DQ.n++;if(DQ.ans===DQ.t)DQ.ok++;
  const d=today(),v=degSt[d]||[0,0];v[1]++;if(DQ.ans===DQ.t)v[0]++;degSt[d]=v;store.set('pcz-deg',degSt);renderDeg();setTimeout(degResolve,150)});
 if($('dgRes'))$('dgRes').onclick=degResolve;
 if($('dgNext'))$('dgNext').onclick=()=>{DQ.prev=DQ.t;DQ.t=null;renderDeg()};
}

/* --- jam: improvise over the song, the mic listens --- */
let JM=null;
function jamSetup(){analyze();const k=A.k||{t:9,minor:true},ch=A.cs.length?seqOf(A.cs).slice(0,8):(k.minor?[C0(k.t,'m'),C0(k.t+8,'M'),C0(k.t+10,'M'),C0(k.t+7,'M')]:[C0(k.t,'M'),C0(k.t+9,'m'),C0(k.t+5,'M'),C0(k.t+7,'M')]);
 const pent=k.minor?[0,3,5,7,10]:[0,2,4,7,9],scale=k.minor?[0,2,3,5,7,8,10]:[0,2,4,5,7,9,11],mr=k.minor?k.t:(k.t+9)%12,p=(mr-4+12)%12||12;
 const fr=p>9?p-12:p,box=fr<0?0:fr;
 JM={k,ch,pent,scale,on:false,bpm:{beg:70,mid:84,adv:96}[PL()],bar:0,i:0,notes:0,inK:0,land:0,lands:0,lastN:null,heard:[],chal:0,box,st:0,lm:null,gap:true,tm:0,nextT:0,beat:0}}
const JCH=()=>{const t3=JM?JM.pent.slice(0,3).map(r=>DLAB[r]).join(', '):'1, ♭3, 4';return [tr(`Hraj jen 3 tóny: ${t3}.`,`Play only 3 notes: ${t3}.`),tr('Otázka a odpověď: první fráze skončí jinde, druhá doma.','Question and answer: phrase one ends elsewhere, phrase two at home.'),tr('Na změně akordu přistaň na jeho základním tónu.','On each chord change, land on the chord’s root.'),tr('Hraj s pauzami: motiv, ticho, motiv.','Play with rests: motif, silence, motif.')]};
function jamStop(){if(!JM)return;JM.on=false;clearInterval(JM.tm);if(Mic.cb===jamHear)Mic.cb=null}
function jamStart(){try{actx()}catch(e){return}JM.on=true;JM.notes=0;JM.inK=0;JM.land=0;JM.lands=0;JM.bar=0;JM.i=0;JM.beat=0;JM.nextT=ac.currentTime+.15;JM.t0=Date.now();
 const g=ac.createGain();g.gain.value=.55;g.connect(ac.destination);JM.g=g;
 JM.tm=setInterval(()=>{if(!JM||!JM.on)return;const spb=60/JM.bpm;while(JM.nextT<ac.currentTime+.15){const b=JM.beat%4,c=JM.ch[JM.i%JM.ch.length],t=JM.nextT;
   if(b===0||b===2)strum(c,t,'D',b===0?.16:.1,g,spb*1.9);click(t,b===0,g);
   const bb=JM.beat;setTimeout(()=>{if(!JM||!JM.on)return;if(bb%4===0){JM.chordAt=Date.now();JM.landOpen=true;JM.cur=JM.ch[JM.i%JM.ch.length];if(Math.floor(bb/4)%4===0&&bb>0)JM.chal=(JM.chal+1)%4;jamUI()}},Math.max(0,(t-ac.currentTime)*1000));
   JM.beat++;JM.nextT+=spb;if(JM.beat%4===0){JM.i++;JM.bar++}}},40);
 micStart().then(ok=>{if(JM){JM.mic=ok;Mic.cb=jamHear;jamUI()}});renderJam()}
function jamHear(p){
 if(!JM||!JM.on)return;if(!p||p.clar<.8){JM.gap=true;JM.st=0;return}
 const m=Math.round(p.midi);if(p.onset)JM.gap=true;if(m===JM.lm)JM.st++;else{JM.lm=m;JM.st=1}
 if(JM.st!==2||!JM.gap)return;JM.gap=false;
 const rel=((m-JM.k.t)%12+12)%12,kind=JM.pent.includes(rel)?'p':JM.scale.includes(rel)?'s':'x';JM.notes++;if(kind!=='x')JM.inK++;
 if(JM.landOpen&&Date.now()-JM.chordAt<700){JM.landOpen=false;JM.lands++;const c=JM.cur;if(c&&pcsOf(c).includes(((m%12)+12)%12)){JM.land++;JM.flash='land'}}
 JM.heard.unshift({m,kind});JM.heard=JM.heard.slice(0,8);jamUI()}
function jamUI(){if(FV.scr!=='jam'||!JM)return;const x=X(),c=JM.cur||JM.ch[0],nx=JM.ch[(JM.i+1)%JM.ch.length];
 const a=$('jmC');if(a)a.textContent=cname(c);const b=$('jmN');if(b)b.textContent=cname(nx);const ch=$('jmT');if(ch)ch.textContent=JCH()[JM.chal];
 const sc=$('jmS');if(sc)sc.innerHTML=x.jamScore(JM.notes?Math.round(JM.inK/JM.notes*100):0,JM.land,JM.lands);
 const h=$('jmH');if(h)h.innerHTML=JM.heard.map(z=>`<span class="j${z.kind}">${nsh(z.m)}</span>`).join('');
 const fb=$('jmFb');if(fb&&JM.flash==='land'){fb.textContent=x.jamLand;fb.classList.remove('pop');void fb.offsetWidth;fb.classList.add('pop');JM.flash=null}
 const bd=$('jmB');if(bd&&bd._o){const marks=jamMarks();bd._o.marks=marks;drawBoard(bd)}}
function jamMarks(){const out=[],last=JM.heard[0];for(let s2=0;s2<6;s2++)for(let f=JM.box;f<=Math.min(12,JM.box+4);f++){const m=OPENM[s2]+f,rel=((m-JM.k.t)%12+12)%12;if(JM.pent.includes(rel)){const hit=last&&last.m===m;out.push({s:s2,f,k:hit?'good':rel===0?'home':'note',t:DLAB[rel]})}}return out}
function renderJam(){
 const x=X(),el=$('fiveC');if(!JM)jamSetup();
 el.innerHTML=head(x.ex.jam[0])+`<p class="muted">${x.jamHow(keyName(JM.k))}</p>
 <div class="jam"><div class="jnow"><small>${x.paNow}</small><b id="jmC">${esc(cname(JM.cur||JM.ch[0]))}</b><small>${x.paNext}: <span id="jmN">${esc(cname(JM.ch[1%JM.ch.length]))}</span></small></div>
 <div class="jtask"><small>${x.jamTaskL}</small><p id="jmT">${JCH()[JM.chal]}</p><div class="jfb" id="jmFb"></div></div></div>
 <div class="fbwrap"><div class="fb" id="jmB"><svg></svg></div></div>
 <div class="jheard" id="jmH"></div><div>${mhLink()}</div><div class="score" id="jmS">${x.jamScore(0,0,0)}</div>
 <div class="row" style="margin-top:10px"><button class="${JM.on?'pri':'fire'} big1" id="jmGo">${JM.on?x.stopM:x.jamGo}</button><span class="muted">BPM</span><button class="sq" id="jmM">−</button><output id="jmBpm">${JM.bpm}</output><button class="sq" id="jmP">+</button></div>
 <p class="t" style="margin-top:8px">${x.jamTip}</p>`;
 bindHead();setBoard($('jmB'),{frets:12,marks:jamMarks(),box:[JM.box],lefty,horiz:true});
 $('jmGo').onclick=()=>{if(JM.on){jamStop();renderJam()}else jamStart()};
 $('jmM').onclick=()=>{JM.bpm=Math.max(50,JM.bpm-4);$('jmBpm').textContent=JM.bpm};$('jmP').onclick=()=>{JM.bpm=Math.min(140,JM.bpm+4);$('jmBpm').textContent=JM.bpm};
 jamUI();
}

/* --- cards --- */
function renderCards(){
 const x=X(),el=$('fiveC');
 if(!done.length){el.innerHTML=head(x.ex.cards[0])+`<p class="muted">${x.cardsNone}</p><div class="row" style="margin-top:12px"><button class="fire" id="toLes">${x.toLessons}</button>${FV.plan?`<button id="planSkip">${x.planSkip}</button>`:''}</div>`;bindHead();$('toLes').onclick=()=>go('lessons');if($('planSkip'))$('planSkip').onclick=planNext;return}
 if(!CARD)CARD={n:0,ok:0,cur:null};
 if(!CARD.cur){const id=pickCard();const q=cardQ(id)||cardQ('tension');CARD.cur={id,...q,ord:shuffle(q.o.map((v,i)=>i)),ans:null}}
 const c=CARD.cur,L=lessons(),ln=(L.find(l=>l.id===c.id)||{}).t||'';
 el.innerHTML=head(x.ex.cards[0])+`<p class="muted">${x.cardsHow(dueCards().length)}</p>
 <div class="card"><div class="lbl">${x.fromLesson}: ${ln}</div><p class="qq">${c.q}</p><div class="opts">${c.ord.map(i=>`<button data-i="${i}" class="${c.ans!=null?i===c.ok?'ok':i===c.ans?'no':'':''}">${c.o[i]}</button>`).join('')}</div>
 ${c.ans!=null?`<p class="qfb">${c.ans===c.ok?x.right:x.notQuite} ${c.w}</p>`:''}</div>
 <div class="score"><span>${FV.plan?CARD.n+' / 5':CARD.n+'×'}</span><span>${x.accL}: <b>${CARD.n?Math.round(CARD.ok/CARD.n*100):0} %</b></span></div>
 ${c.ans!=null?`<div class="row" style="margin-top:12px">${CARD.n>=5&&FV.plan?nextBtn():`<button class="pri" id="cNext">${x.next1}</button>`}</div>`:''}`;
 bindHead();
 el.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{if(c.ans!=null)return;c.ans=+b.dataset.i;const ok=c.ans===c.ok;CARD.n++;if(ok)CARD.ok++;cardAnswer(c.id,ok);if(CARD.n>=5&&FV.plan)markPlan('cards');renderCards()});
 if($('cNext'))$('cNext').onclick=()=>{CARD.cur=null;renderCards()};
}

/* --- YouTube loop --- */
function ytId(s){const m=/(?:v=|youtu\.be\/|shorts\/|embed\/|live\/)([\w-]{11})/.exec(s||'');return m?m[1]:/^[\w-]{11}$/.test((s||'').trim())?s.trim():null}
function loadYT(cb){if(window.YT&&window.YT.Player)return cb(true);if(!loadYT.q){loadYT.q=[];const s=document.createElement('script');s.src='https://www.youtube.com/iframe_api';s.onerror=()=>{loadYT.q.forEach(f=>f(false));loadYT.q=[]};document.head.appendChild(s);window.onYouTubeIframeAPIReady=()=>{loadYT.q.forEach(f=>f(true));loadYT.q=[]};setTimeout(()=>{if(!(window.YT&&window.YT.Player)){loadYT.q.forEach(f=>f(false));loadYT.q=[]}},9000)}loadYT.q.push(cb)}
function renderYT(){
 const x=X(),el=$('fiveC');if(!YT)YT={id:store.get('pcz-ytlast',null),a:null,b:null,loop:true,ramp:PL()==='beg',rate:PL()==='beg'?.5:.75};
 const saved=YT.id?(ytLoops[YT.id]||[]):[];
 el.innerHTML=head(x.ex.yt[0])+`<p class="muted">${x.ytHow}</p>
 <div class="row" style="margin:10px 0"><input type="text" id="ytU" placeholder="https://youtu.be/…" style="flex:1;min-width:200px" value="${YT.id?'https://youtu.be/'+esc(YT.id):''}"><button class="fire" id="ytL">${x.ytLoad}</button></div>
 <p class="t" id="ytMsg"></p>
 <div class="ytbox"><div id="ytp"></div></div>
 <div class="panel" id="ytC" ${YT.id?'':'hidden'}>
  <div class="row"><span class="muted">${x.ytSpeed}</span><div class="seg" id="ytR">${[.25,.5,.75,1].map(r=>`<button data-r="${r}" class="${YT.rate===r?'on':''}">${r*100} %</button>`).join('')}</div></div>
  <div class="row" style="margin-top:10px"><button id="ytA">A · ${YT.a!=null?fmt(YT.a):'–'}</button><button id="ytB">B · ${YT.b!=null?fmt(YT.b):'–'}</button><button id="ytX">${x.ytClear}</button><button id="ytS">${x.ytSave}</button></div>
  <label class="sw"><input type="checkbox" id="ytLp" ${YT.loop?'checked':''}> <span>${x.ytLoop}</span></label>
  <label class="sw"><input type="checkbox" id="ytRp" ${YT.ramp?'checked':''}> <span>${x.ytRamp}</span></label>
  ${saved.length?`<div class="lbl" style="margin-top:8px">${x.ytSaved}</div><div class="chips">${saved.map((l,i)=>`<button class="chip" data-li="${i}">${fmt(l.a)}–${fmt(l.b)}</button>`).join('')}</div>`:''}
 </div>`;
 bindHead();
 $('ytL').onclick=()=>{const id=ytId($('ytU').value);if(!id){$('ytMsg').textContent=x.ytBad;return}YT.id=id;YT.a=YT.b=null;store.set('pcz-ytlast',id);ytMount()};
 const P=()=>YT.player&&YT.player.getCurrentTime?YT.player:null;
 if($('ytA')){
  el.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{YT.rate=+b.dataset.r;if(P())P().setPlaybackRate(YT.rate);el.querySelectorAll('[data-r]').forEach(z=>z.classList.toggle('on',z===b))});
  $('ytA').onclick=()=>{if(P()){YT.a=Math.floor(P().getCurrentTime()*10)/10;$('ytA').textContent='A · '+fmt(YT.a)}};
  $('ytB').onclick=()=>{if(P()){YT.b=Math.floor(P().getCurrentTime()*10)/10;$('ytB').textContent='B · '+fmt(YT.b)}};
  $('ytX').onclick=()=>{YT.a=YT.b=null;$('ytA').textContent='A · –';$('ytB').textContent='B · –'};
  $('ytS').onclick=()=>{if(YT.a!=null&&YT.b!=null&&YT.b>YT.a){(ytLoops[YT.id]=ytLoops[YT.id]||[]).push({a:YT.a,b:YT.b});store.set('pcz-yt',ytLoops);renderYT()}};
  $('ytLp').onchange=e=>YT.loop=e.target.checked;$('ytRp').onchange=e=>YT.ramp=e.target.checked;
  el.querySelectorAll('[data-li]').forEach(b=>b.onclick=()=>{const l=saved[+b.dataset.li];YT.a=l.a;YT.b=l.b;if(P())P().seekTo(l.a,true);$('ytA').textContent='A · '+fmt(YT.a);$('ytB').textContent='B · '+fmt(YT.b)});
 }
 if(YT.id)ytMount();
}
function ytMount(){
 const x=X();$('ytC').hidden=false;$('ytMsg').textContent=x.ytLoading;
 loadYT(ok=>{if(!ok){$('ytMsg').textContent=x.ytNA;return}if(FV.scr!=='yt')return;$('ytMsg').textContent='';
  if(YT.player&&YT.player.destroy)try{YT.player.destroy()}catch(e){}
  $('ytp').innerHTML='<div id="ytpi"></div>';
  YT.player=new window.YT.Player('ytpi',{videoId:YT.id,playerVars:{playsinline:1,rel:0,modestbranding:1},events:{onReady:()=>{try{YT.player.setPlaybackRate(YT.rate)}catch(e){}}}});
  clearInterval(YT.iv);YT.iv=setInterval(()=>{const p=YT.player;if(!p||!p.getCurrentTime||FV.scr!=='yt')return;const t=p.getCurrentTime();
   if(YT.loop&&YT.a!=null&&YT.b!=null&&YT.b>YT.a&&t>=YT.b){p.seekTo(YT.a,true);if(YT.ramp&&YT.rate<1){const rs=[.25,.5,.75,1];YT.rate=rs[Math.min(3,rs.indexOf(YT.rate)+1)]||1;p.setPlaybackRate(YT.rate);document.querySelectorAll('#ytR [data-r]').forEach(z=>z.classList.toggle('on',+z.dataset.r===YT.rate))}}},120);
 });
}

/* --- Můj pokrok --- */
function bestStreak(){const ks=Object.keys(plog).filter(k=>plog[k]>=300).sort();let best=0,run=0,prev=null;for(const k of ks){const d=new Date(k+'T12:00');if(prev&&Math.round((d-prev)/864e5)===1)run++;else run=1;best=Math.max(best,run);prev=d}return best}
function renderProgress(){
 const x=X(),el=$('fiveC');analyze();
 const d=new Date();d.setHours(12);const days=[];const off=(d.getDay()+6)%7;const start=new Date(d);start.setDate(d.getDate()-off-28);
 for(let i=0;i<35;i++){const z=new Date(start);z.setDate(start.getDate()+i);const k=dkey(z),v=plog[k]||0;days.push({k,v,fut:z>d,t:k===today()})}
 const wk=days.slice(28).reduce((a,z)=>a+z.v,0),tot=Object.values(plog).reduce((a,v)=>a+v,0);
 const L=lessons(),byCh=CHAPTERS.map((c,i)=>{const ls=L.filter(l=>l.ch===i);return {n:c[lang==='cs'?0:1],all:ls.length,d:ls.filter(l=>done.includes(l.id)).length}});
 const known=done.filter(id=>cards[id]&&cards[id].b>=3).length;
 const recs=Object.entries(chRec).map(([k,r])=>({k,best:Math.max(...r.map(z=>z.n)),last:r[r.length-1].n,r})).sort((a,b)=>b.best-a.best).slice(0,5);
 const mx=Math.max(1,...recs.map(r=>r.best));
 const pkName=k=>k.split('~').map(p=>{const [r,q,e]=p.split('|');const c={root:+r,q,ext:e||''};try{return esc(cname(c))}catch(err){return esc(p)}}).join(' ↔ ');
 const ev=Object.values(earSt).concat(Object.values(degSt)),eo=ev.reduce((a,v)=>a+v[0],0),en=ev.reduce((a,v)=>a+v[1],0);
 const allE={};for(const S2 of [earSt,degSt])for(const [k,v] of Object.entries(S2)){const a=allE[k]||[0,0];allE[k]=[a[0]+v[0],a[1]+v[1]]}const recent=Object.keys(allE).sort().slice(-7).reduce((a,k)=>[a[0]+allE[k][0],a[1]+allE[k][1]],[0,0]);
 let mk=0,mn=0,marks=[];for(let s2=0;s2<6;s2++)for(let f=0;f<=12;f++){const pc=(OPEN[s2]+f)%12;if(!NAT.includes(pc))continue;mn++;const m=mast(s2,f);if(m===3)mk++;if(m)marks.push({s:s2,f,k:'h'+m,t:nn(pc)})}
 const all=[...mine,...EXAMPLES],rc=[0,0,0,0];all.forEach(s2=>rc[rep[s2.id]||0]++);
 const lvl=v=>v>=300?4:v>=180?3:v>=60?2:v>0?1:0;
 const dw=lang==='cs'?['Po','Út','St','Čt','Pá','So','Ne']:['Mo','Tu','We','Th','Fr','Sa','Su'];
 el.innerHTML=`<div class="exhead"><button id="exBack">${x.back5}</button></div><h2 class="exT">${x.progress}</h2><p class="muted">${x.progressSub}</p>
 <div class="pgrid">
  <div class="panel stat"><span class="lbl">${x.pStreak}</span><b>${streak()}</b><small>${x.pBest}: ${bestStreak()}</small></div>
  <div class="panel stat"><span class="lbl">${x.pWeek}</span><b>${Math.round(wk/60)}</b><small>min · ${x.pTotal} ${x.pMin(Math.round(tot/60))}</small></div>
 </div>
 <div class="panel"><div class="lbl">${x.pDays}</div><div class="heat">${dw.map(w=>`<span class="hw">${w}</span>`).join('')}${days.map(z=>`<i class="h${z.fut?'f':lvl(z.v)}${z.t?' ht':''}" title="${z.k}: ${Math.round(z.v/60)} min"></i>`).join('')}</div></div>
 <div class="panel"><div class="lbl">${x.qPathT} · ${x.qStarsT(QD.reduce((a,d)=>a+qStars(d.id),0),QD.length*3)}</div>${QT.length?`<div class="qchart">${QT.slice(-12).map(r=>`<i style="height:${Math.max(4,r.sc)}%" title="${r.d}: ${r.sc}"></i>`).join('')}</div><p class="t">${x.qTest}: ${QT.map(r=>r.sc).slice(-6).join(' → ')}</p>`:`<p class="t">${x.qTestNone}</p>`}</div>
 <div class="panel"><div class="lbl">${x.pLessons} · ${done.length}/${L.length||12}</div>${byCh.map(c=>`<div class="bar"><span>${esc(c.n)}</span><div class="prog"><i style="width:${c.all?c.d/c.all*100:0}%"></i></div><b>${c.d}/${c.all}</b></div>`).join('')}
  <p class="t">${x.pCards}: <b>${known}</b> / ${done.length}</p></div>
 <div class="panel"><div class="lbl">${x.pRec}</div>${recs.length?recs.map(r=>`<div class="bar"><span>${pkName(r.k)}</span><div class="prog"><i style="width:${r.best/mx*100}%"></i></div><b>${r.best}</b></div>`).join(''):`<p class="t">${x.pNone}</p>`}</div>
 <div class="pgrid">
  <div class="panel stat"><span class="lbl">${x.pEar}</span><b>${en?Math.round(eo/en*100):0} %</b><small>${recent[1]?tr('7 dní','7 days')+': '+Math.round(recent[0]/recent[1]*100)+' %':x.pNone}</small></div>
  <div class="panel stat"><span class="lbl">${x.ex.rhythm[0]}</span><b>${(()=>{const v=Object.values(rtHist);return v.length?Math.max(...v.map(h=>h.best)):'–'})()}</b><small>${(()=>{const e=Object.entries(rtHist).sort((a,b)=>b[1].best-a[1].best)[0];return e?(x.rtPats[e[0].split('@')[0]]||'')+' · '+e[0].split('@')[1]+' BPM':x.pNone})()}</small></div>
  <div class="panel stat"><span class="lbl">${x.pRep}</span><b>${rc[2]+rc[3]}</b><small>${x.rep1}: ${rc[1]} · ${x.rep3}: ${rc[3]}</small></div>
 </div>
 <div class="panel"><div class="lbl">${x.pMap} · ${x.pKnown(Math.round(mk/mn*100))}</div><div class="fbwrap"><div class="fb" id="pfb"><svg></svg></div></div><p class="t">${tr("Zelená = umíš jistě, žlutá = skoro, červená = ještě se učíš. Trénuj v cvičení Tóny na hmatníku.","Green = solid, yellow = almost, red = still learning. Practise in Notes on the fretboard.")}</p></div>`;
 $('exBack').onclick=()=>fiveGo('home');
 setBoard($('pfb'),{frets:12,marks,box:[],lefty});
}
