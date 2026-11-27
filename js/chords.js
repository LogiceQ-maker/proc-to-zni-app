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
 $('chOv').hidden=false;
}
document.addEventListener('click',e=>{if(e.target.id==='chOv'||e.target.closest('#chClose'))$('chOv').hidden=true});
