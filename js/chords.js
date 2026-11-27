'use strict';
/* ---------- chord shapes & diagrams ---------- */
// frets from low E to high e, -1 = muted; lvl 0 open, 1 easy partial, 2 barre
const LIB=[
 [0,'M',[-1,3,2,0,1,0],0],[2,'M',[-1,-1,0,2,3,2],0],[4,'M',[0,2,2,1,0,0],0],[7,'M',[3,2,0,0,0,3],0],[9,'M',[-1,0,2,2,2,0],0],[5,'M',[-1,-1,3,2,1,1],1],[11,'M',[-1,-1,4,4,4,2],1],
 [9,'m',[-1,0,2,2,1,0],0],[2,'m',[-1,-1,0,2,3,1],0],[4,'m',[0,2,2,0,0,0],0],[11,'m',[-1,-1,4,4,3,2],1],[5,'m',[-1,-1,3,1,1,1],1],
 [0,'7',[-1,3,2,3,1,0],0],[2,'7',[-1,-1,0,2,1,2],0],[4,'7',[0,2,0,1,0,0],0],[7,'7',[3,2,0,0,0,1],0],[9,'7',[-1,0,2,0,2,0],0],[11,'7',[-1,2,1,2,0,2],0],
 [9,'m7',[-1,0,2,0,1,0],0],[2,'m7',[-1,-1,0,2,1,1],0],[4,'m7',[0,2,2,0,3,0],0],
 [0,'maj7',[-1,3,2,0,0,0],0],[2,'maj7',[-1,-1,0,2,2,2],0],[5,'maj7',[-1,-1,3,2,1,0],0],[7,'maj7',[3,2,0,0,0,2],0],[9,'maj7',[-1,0,2,1,2,0],0],[4,'maj7',[0,2,1,1,0,0],0],
 [2,'sus2',[-1,-1,0,2,3,0],0],[9,'sus2',[-1,0,2,2,0,0],0],[2,'sus4',[-1,-1,0,2,3,3],0],[9,'sus4',[-1,0,2,2,3,0],0],[4,'sus4',[0,2,2,2,0,0],0],
 [4,'5',[0,2,2,-1,-1,-1],0],[9,'5',[-1,0,2,2,-1,-1],0],[2,'5',[-1,-1,0,2,3,-1],0]];
const ESH={M:[0,2,2,1,0,0],m:[0,2,2,0,0,0],'7':[0,2,0,1,0,0],m7:[0,2,0,0,0,0],maj7:[0,-1,1,1,0,-1],sus4:[0,2,2,2,0,0],'5':[0,2,2,-1,-1,-1]};
const ASH={M:[-1,0,2,2,2,0],m:[-1,0,2,2,1,0],'7':[-1,0,2,0,2,0],m7:[-1,0,2,0,1,0],maj7:[-1,0,2,1,2,0],sus2:[-1,0,2,2,0,0],sus4:[-1,0,2,2,3,0],'5':[-1,0,2,2,-1,-1],dim:[-1,0,1,2,1,-1],aug:[-1,0,3,2,2,-1]};
const STR_M=[40,45,50,55,59,64];
function ctype(c){if(c.q==='m')return /7/.test(c.ext)&&!/maj7/.test(c.ext)?'m7':'m';if(c.q==='s')return /sus2/.test(c.ext)?'sus2':'sus4';if(c.q==='5')return '5';if(c.q==='d')return 'dim';if(c.q==='a')return 'aug';if(/maj7/.test(c.ext))return 'maj7';if(/7|9|13/.test(c.ext))return '7';return 'M'}
function voicings(c){
 const t=ctype(c),out=[];
 for(const [pc,ty,f,l] of LIB)if(pc===c.root&&ty===t)out.push({f,l});
 const add=(sh,r)=>{if(!sh)return;const f=sh.map(x=>x<0?-1:x+r);if(!out.some(o=>o.f.join()===f.join()))out.push({f,l:r?2:0})};
 let r=(c.root-4+12)%12;add(ESH[t],r);r=(c.root-9+12)%12;add(ASH[t],r);
 if(!out.length){const b={...c,q:c.q==='m'?'m':'M',ext:''};return voicings(b)}
 return out.sort((a,b)=>a.l-b.l||Math.max(...a.f)-Math.max(...b.f));
}
const vMidis=v=>v.f.map((x,i)=>x<0?null:STR_M[i]+x).filter(x=>x!=null);
function diag(v){
 const pos=v.f.filter(x=>x>0),mx=Math.max(0,...pos),base=mx<=4?1:Math.min(...pos),X0=20,dx=16,Y0=34,dy=22;
 let h=`<svg viewBox="0 0 120 150" class="dg" aria-hidden="true">`;
 h+=base===1?`<rect x="${X0-1}" y="${Y0-4}" width="${dx*5+2}" height="5" fill="currentColor"/>`:`<text x="${X0-6}" y="${Y0+dy*.65}" font-size="13" text-anchor="end" fill="currentColor">${base}.</text>`;
 for(let i=0;i<=5;i++)h+=`<line x1="${X0}" y1="${Y0+i*dy}" x2="${X0+dx*5}" y2="${Y0+i*dy}" stroke="currentColor" stroke-opacity=".45"/>`;
 for(let s=0;s<6;s++)h+=`<line x1="${X0+s*dx}" y1="${Y0}" x2="${X0+s*dx}" y2="${Y0+dy*5}" stroke="currentColor" stroke-width="${1.6-s*.15}"/>`;
 if(v.l===2){const at=v.f.map((x,i)=>x===base?i:-1).filter(i=>i>=0);if(at.length>=2){const a=Math.min(...at),b=Math.max(...at);h+=`<rect x="${X0+a*dx-7}" y="${Y0+(.5)*dy-7}" width="${(b-a)*dx+14}" height="14" rx="7" fill="var(--fire)"/>`}}
 v.f.forEach((x,s)=>{const cx=X0+s*dx;if(x<0)h+=`<text x="${cx}" y="${Y0-10}" font-size="13" text-anchor="middle" fill="currentColor">×</text>`;else if(x===0)h+=`<circle cx="${cx}" cy="${Y0-14}" r="4.5" fill="none" stroke="currentColor" stroke-width="1.5"/>`;else h+=`<circle cx="${cx}" cy="${Y0+(x-base+.5)*dy}" r="7" fill="var(--fire)"/>`});
 return h+'</svg>';
}
function openChord(c,label){
 const x=X(),vs=voicings(c).slice(0,4),lv=[x.lvOpen,x.lvEasy,x.lvBarre];
 $('chT').textContent=label||cname(c);
 $('chB').innerHTML=vs.map(v=>`<div class="dgc">${diag(v)}<div class="t">${lv[v.l]}</div>${pbtn('▶',[{midis:vMidis(v)}],{cls:'sq'})}</div>`).join('')+(c.bass!=null?`<p class="t" style="grid-column:1/-1">${x.bassNote(nn(c.bass))}</p>`:'');
 $('chTip').textContent=vs[0]&&vs[0].l===2?x.barreTip:'';
 chkC=c;chkV=vs[0];$('chChk').innerHTML=`<button class="fire" id="chkGo">🎤 ${x.chkBtn}</button><p class="micmsg t"></p>`;
 $('chOv').hidden=false;
}
document.addEventListener('click',e=>{if(e.target.id==='chOv'||e.target.closest('#chClose')){$('chOv').hidden=true;chkStop()}});
/* --- check a chord with the microphone --- */
let chkC=null,chkV=null,CK=null;
const STRN=[40,45,50,55,59,64];
function chkStop(){if(CK){clearTimeout(CK.to);CK=null;if(Mic.ccb===chkHear){Mic.ccb=null;micStop()}}}
async function chkStart(){
 const x=X();chkStop();try{actx()}catch(e){}if(!(await micStart()))return;
 CK={acc:new Float32Array(12),n:0,on:false,t0:0,to:0};Mic.cb=null;Mic.ccb=chkHear;
 $('chChk').innerHTML=`<div class="chk wait"><span class="dotm on"></span> ${x.chkListen(esc(cname(chkC)))}</div><button id="chkX">${x.stopM}</button>`;
 CK.to=setTimeout(()=>{if(CK&&!CK.n){chkStop();$('chChk').innerHTML=`<div class="chk bad">${x.chkQuiet}</div><button class="fire" id="chkGo">🎤 ${x.chkAgain}</button>`}},8000);
}
function chkHear(ch,r,onset){
 if(!CK)return;const now=performance.now();
 if(!CK.on){if(onset||r>0.01){CK.on=true;CK.t0=now}else return}
 const dt=now-CK.t0;if(dt<120)return;
 if(r>0.002&&dt<1300){for(let i=0;i<12;i++)CK.acc[i]+=ch[i]*r;CK.n++}
 if(dt>=1300){const acc=CK.acc,n=CK.n;chkStop();chkResult(acc,n)}
}
function chkResult(acc,n){
 const x=X(),c=chkC,v=chkV;let t=0;for(const a of acc)t+=a;const ch=acc.map(a=>t?a/t:0);
 const P=pcsOf(c),missing=P.filter(p=>ch[p]<0.045),extra=[];for(let p=0;p<12;p++)if(!P.includes(p)&&ch[p]>0.16)extra.push(p);
 // what does it sound like? compare with all major/minor/7 chords
 let best=null,bs=-9;for(let r=0;r<12;r++)for(const q of ['M','m']){const k=C0(r,q,'');const sc=chordFit(ch,k);if(sc>bs){bs=sc;best=k}}
 const mine=chordFit(ch,c),like=best&&bs>mine+.08&&pcsOf(best).join()!==P.join()?best:null;
 const where=p=>{if(!v)return '';const out=[];v.f.forEach((f,i)=>{if(f>=0&&(STRN[i]+f)%12===p)out.push(x.chkStr(nsh(STRN[i]),i===5,f))});return out.join(', ')};
 let cls='ok',msg=x.chkGood(esc(cname(c)));
 if(n<4){cls='bad';msg=x.chkQuiet}
 else if(missing.length||like||extra.length){cls='bad';const parts=[];
  if(like)parts.push(x.chkLike(esc(cname(like))));
  for(const p of missing)parts.push(x.chkMiss(nn(p),where(p)));
  if(extra.length&&!like)parts.push(x.chkExtra(extra.map(p=>nn(p)).join(', ')));
  msg=parts.join('<br>')}
 const bars=Array.from({length:12},(_,i)=>(i+((c.root)%12))%12).map(p=>`<span class="${P.includes(p)?'in':''}"><i style="height:${Math.round(Math.min(1,ch[p]*3)*100)}%"></i><b>${nsh(p)}</b></span>`).join('');
 $('chChk').innerHTML=`<div class="chk ${cls}">${cls==='ok'?'✓ ':''}${msg}</div><div class="chbars">${bars}</div><button class="fire" id="chkGo">🎤 ${x.chkAgain}</button>`;
}
document.addEventListener('click',e=>{if(e.target.closest('#chkGo'))chkStart();else if(e.target.closest('#chkX'))chkStop(),$('chChk').innerHTML=`<button class="fire" id="chkGo">🎤 ${X().chkBtn}</button>`});
