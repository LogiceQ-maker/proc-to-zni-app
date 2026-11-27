'use strict';
/* ---------- rhythm trainer: the mic hears your strums and measures how close they are to the beat ----------
   Timing: onsets are found in a low-passed copy of the mic signal (so the high metronome click is ignored)
   on a 2.7 ms grid. The speaker→mic delay is measured once by a short calibration (clicks heard by the mic)
   and subtracted, so "on time" means on time as you hear it. */
const RPAT={doby:[0,2,4,6],osm:[0,1,2,3,4,5,6,7],tabor:[0,2,3,5,6,7],dva:[0,4]};
const RBARS=8;
let RT=null,rtHist=store.get('pcz-rhythm',{});
function rtDefaults(){const L=PL();return {pat:{beg:'doby',mid:'osm',adv:'tabor'}[L],bpm:store.get('pcz-rbpm',{beg:60,mid:72,adv:88}[L]),tol:{beg:.05,mid:.04,adv:.03}[L]}}
function rtNew(){const d=rtDefaults();RT={...d,ph:'setup',on:false,res:[],stray:0,lat:store.get('pcz-lat',null),latEst:false,clickLvl:store.get('pcz-clickE',0)}}

/* --- onset detector: runs inside the audio thread (AudioWorklet), so every sample has an exact time ---
   It listens to 2–8 kHz, where the pick attack lives and our low metronome click doesn't. */
const OD_SRC=`
function bq(t,fc,sr,Q){Q=Q||.7071;const w=2*Math.PI*fc/sr,a=Math.sin(w)/(2*Q),c=Math.cos(w);let b0,b1,b2;if(t==='lp'){b0=(1-c)/2;b1=1-c;b2=(1-c)/2}else{b0=(1+c)/2;b1=-(1+c);b2=(1+c)/2}const a0=1+a,a1=-2*c,a2=1-a;let x1=0,x2=0,y1=0,y2=0;return v=>{const y=(b0*v+b1*x1+b2*x2-a1*y1-a2*y2)/a0;x2=x1;x1=v;y2=y1;y1=y;return y}}
class OnsetProc extends AudioWorkletProcessor{
 constructor(){super();const sr=sampleRate;this.f=[bq('hp',2000,sr),bq('hp',2000,sr),bq('lp',8000,sr)];this.hop=128;this.acc=0;this.k=0;this.he=[];this.le=[];this.last=-9;this.n=0;
  this.P={W:4,look:20,gap:1,loc:4,th:1,ref:.08,abs:1e-9};this.port.onmessage=e=>{if(e.data&&e.data.P)Object.assign(this.P,e.data.P)}}
 process(inputs){const inp=inputs[0]&&inputs[0][0];if(!inp)return true;const P=this.P,hop=this.hop,sr=sampleRate;
  for(let i=0;i<inp.length;i++){const v=this.f[2](this.f[1](this.f[0](inp[i])));this.acc+=v*v;this.k++;
   if(this.k===hop){this.k=0;const he=this.he;he.push(this.acc/hop+1e-12);this.acc=0;this.n++;if(he.length>64)he.shift();
    const tEnd=(currentFrame+i+1)/sr;const W=P.W;if(he.length<W+P.look+2)continue;
    const n=he.length;let s=0;for(let j=n-W;j<n;j++)s+=he[j];const eW=s/W,L=Math.log(eW),le=this.le;le.push(L);if(le.length>64)le.shift();
    const m=le.length;if(m<P.look+3)continue;let pm=1e9;for(let j=m-1-P.look;j<m-1-P.gap;j++)if(le[j]<pm)pm=le[j];
    if(L-pm>P.th&&eW>P.abs&&tEnd-this.last>P.ref){const base=Math.exp(pm);let j0=n-W-P.gap;for(let j=n-W-P.gap;j<n;j++){if(he[j]>base*P.loc){j0=j;break}}
     const to=tEnd-(n-j0)*hop/sr;if(to-this.last>P.ref){this.last=to;this.port.postMessage({t:to,e:eW})}}}}
  return true}}
registerProcessor('onset-proc',OnsetProc);`;
const OD={node:null,src:null,cb:null,ready:null};
async function odSetup(){
 if(!Mic.on||!Mic.src)return false;
 if(!ac.audioWorklet){return false}
 if(!OD.ready)OD.ready=ac.audioWorklet.addModule(URL.createObjectURL(new Blob([OD_SRC],{type:'application/javascript'}))).then(()=>true,()=>false);
 if(!(await OD.ready))return false;
 if(OD.node&&OD.src===Mic.src)return true;
 odStop();OD.node=new AudioWorkletNode(ac,'onset-proc',{numberOfInputs:1,numberOfOutputs:1,outputChannelCount:[1]});
 const sink=ac.createGain();sink.gain.value=0;OD.node.connect(sink).connect(ac.destination); // keep it pulled by the graph, silent
 OD.sink=sink;Mic.src.connect(OD.node);OD.src=Mic.src;OD.node.port.onmessage=e=>{if(OD.cb)OD.cb(e.data.t,e.data.e)};return true}
function odStop(){if(OD.node){try{OD.src.disconnect(OD.node)}catch(e){}try{OD.node.disconnect();OD.sink.disconnect()}catch(e){}}OD.node=null;OD.src=null}
/* --- clicks --- */
function rtClick(t,acc){const o=ac.createOscillator(),g=ac.createGain();o.type='sine';o.frequency.value=acc?1100:880;
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(acc?.55:.4,t+.004);g.gain.setTargetAtTime(0,t+.006,.012);o.connect(g).connect(ac.destination);o.start(t);o.stop(t+.09)}
function rtBurst(t){const n=Math.floor(ac.sampleRate*.012),buf=ac.createBuffer(1,n,ac.sampleRate),d=buf.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);
 const s=ac.createBufferSource(),g=ac.createGain();g.gain.value=.9;s.buffer=buf;s.connect(g).connect(ac.destination);s.start(t)}

/* --- calibration: how long from "speaker plays" to "mic hears" --- */
async function rtCalib(){
 const x=X();RT.ph='calib';rtRender();
 if(!(await micStart())){RT.ph='setup';RT.lat=rtGuess();RT.latEst=true;rtRender();return}
 Mic.cb=null;if(!(await odSetup())){RT.ph='setup';RT.lat=rtGuess();RT.latEst=true;RT.noWk=true;rtRender();return}const times=[],hits=[],ck=[];let t=ac.currentTime+.4;for(let i=0;i<6;i++){times.push(t);rtBurst(t);t+=.55}
 t+=.2;for(let i=0;i<4;i++){ck.push(t);rtClick(t,i===0);t+=.5}
 OD.cb=(to,e)=>{hits.push([to,e])};
 await new Promise(r=>setTimeout(r,(t-ac.currentTime+.4)*1000));OD.cb=null;
 const lags=[];for(const ts of times){const h=hits.find(v=>v[0]>ts-.005&&v[0]<ts+.35);if(h)lags.push(h[0]-ts)}
 lags.sort((a,b)=>a-b);const med=lags.length?lags[lags.length>>1]:null,spread=lags.length>=3?lags[lags.length-2]-lags[1]:1;
 if(med!=null&&lags.length>=4&&spread<.02){RT.lat=med;RT.latEst=false;store.set('pcz-lat',med)}else{RT.lat=rtGuess();RT.latEst=true}
 // how loud does our own metronome click look to the detector? (so we can ignore it later)
 const ce=ck.map(c=>hits.find(v=>Math.abs(v[0]-c-RT.lat)<.05)).filter(Boolean).map(v=>v[1]);RT.clickLvl=!RT.latEst&&ce.length?Math.max(...ce):0;store.set('pcz-clickE',RT.clickLvl);
 RT.ph='setup';RT.calibMsg=RT.latEst?x.rtCalFail:x.rtCalOk(Math.round(RT.lat*1000));rtRender()}
function rtGuess(){return (ac&&(ac.outputLatency||0)+(ac.baseLatency||0))+.03}

/* --- a round --- */
async function rtStart(){
 try{actx()}catch(e){return}
 if(!(await micStart())){RT.noMic=true;rtRender();return}
 if(RT.lat==null){await rtCalib();if(RT.ph!=='setup')return}
 Mic.cb=null;if(!(await odSetup())){RT.noWk=true;rtRender();return}
 const spb=60/RT.bpm,se=spb/2,start=ac.currentTime+.25,T0=start+4*spb,slots=[];
 for(let bar=0;bar<RBARS;bar++)for(const sl of RPAT[RT.pat])slots.push(T0+(bar*8+sl)*se);
 Object.assign(RT,{ph:'run',on:true,T0,se,slots,match:new Array(slots.length).fill(null),res:[],stray:0,lastD:null,beatI:-1});
 // schedule clicks (count-in + 8 bars + closing click)
 const total=4+RBARS*4;RT.clicks=[];RT.clickE=[];for(let i=0;i<=total;i++){rtClick(start+i*spb,i%4===0);RT.clicks.push(start+i*spb)}
 RT.endAt=T0+RBARS*8*se+se;
 OD.cb=rtOnset;rtRender();
 RT.ui=setInterval(rtTick,30);
}
function rtOnset(to,e){
 if(!RT||RT.ph!=='run')return;const t=to-RT.lat;
 // the mic may hear our own click a little: calibration measured how loud, ignore anything that weak right on a click
 if(t<RT.T0-RT.se*.6)return;
 if(RT.clickLvl&&e<RT.clickLvl*4&&RT.clicks.some(c=>Math.abs(t-c)<.05))return;
 if(t>RT.endAt)return;
 let bi=-1,bd=9;RT.slots.forEach((s,i)=>{const d=Math.abs(t-s);if(d<bd){bd=d;bi=i}});
 const d=t-RT.slots[bi];
 if(Math.abs(d)>RT.se*.45){RT.stray++;RT.lastD={d,stray:true,at:performance.now()};return}
 const prev=RT.match[bi];if(prev!=null&&Math.abs(prev)<=Math.abs(d)){RT.stray++;return}if(prev!=null)RT.stray++;
 RT.match[bi]=d;RT.res.push({i:bi,d});RT.lastD={d,at:performance.now()};rtLive();
}
function rtTick(){if(!RT||RT.ph!=='run')return;const now=ac.currentTime-RT.lat*0;
 // which eighth are we on (for the arrows)
 const k=Math.floor((now-RT.T0)/RT.se+.5),slot=((k%8)+8)%8,bar=Math.floor(k/8);
 if(k!==RT.beatI){RT.beatI=k;document.querySelectorAll('#rtS .sl').forEach((s,i)=>s.classList.toggle('hit',i===slot&&now>=RT.T0-RT.se/2));
  const c=$('rtCnt');if(c)c.textContent=now<RT.T0?String(4-Math.floor((RT.T0-now)/(RT.se*2))):`${Math.min(RBARS,bar+1)} / ${RBARS}`}
 if(ac.currentTime>RT.endAt+.25)rtFinish()}
function rtLive(){const l=RT.lastD;if(!l)return;const x=X(),ms=Math.round(l.d*1000),el=$('rtLane'),tx=$('rtNow');
 if(el){const dot=document.createElement('i');const cl=Math.max(-120,Math.min(120,ms));dot.style.left=(50+cl/120*50)+'%';dot.className=Math.abs(l.d)<=RT.tol?'ok':Math.abs(l.d)<=RT.tol*2?'mid':'bad';el.appendChild(dot);setTimeout(()=>dot.classList.add('fade'),40);setTimeout(()=>dot.remove(),2400)}
 if(tx){tx.textContent=Math.abs(l.d)<=RT.tol?x.rtSpot:ms<0?x.rtEarly(-ms):x.rtLate(ms);tx.className='rtnow '+(Math.abs(l.d)<=RT.tol?'ok':Math.abs(l.d)<=RT.tol*2?'mid':'bad')}}
function rtStop(){if(!RT)return;clearInterval(RT.ui);RT.on=false;OD.cb=null;odStop();micStop()}
function rtFinish(){
 rtStop();const x=X(),ds=RT.res.map(r=>r.d),n=RT.slots.length,hit=ds.filter(d=>Math.abs(d)<=RT.tol).length,okc=ds.filter(d=>Math.abs(d)>RT.tol&&Math.abs(d)<=RT.tol*2).length,miss=RT.match.filter(v=>v==null).length;
 const sorted=ds.slice().sort((a,b)=>a-b),bias=sorted.length?sorted[sorted.length>>1]:0,mad=sorted.length?sorted.map(d=>Math.abs(d-bias)).sort((a,b)=>a-b)[sorted.length>>1]*1.48:0;
 const score=Math.max(0,Math.round(((hit+okc*.5)/n)*100-RT.stray*2));
 RT.sum={score,bias:Math.round(bias*1000),spread:Math.round(mad*1000),hit,okc,miss,stray:RT.stray,n};
 const key=RT.pat+'@'+RT.bpm,h=rtHist[key]||{best:0,runs:[]};h.best=Math.max(h.best,score);h.runs.push({d:today(),s:score});h.runs=h.runs.slice(-20);rtHist[key]=h;store.set('pcz-rhythm',rtHist);
 if(FV.plan)markPlan('rhythm');
 RT.ph='done';rtRender();
}

/* --- UI --- */
function renderRhythm(){if(!RT)rtNew();rtRender()}
function rtRender(){
 if(FV.scr!=='rhythm')return;const x=X(),el=$('fiveC'),P=RPAT[RT.pat];
 const arrows=[...Array(8)].map((_,i)=>{const on=P.includes(i),down=i%2===0;return `<span class="sl${on?'':' off'}">${on?(down?'↓':'↑'):'·'}<small>${i%2?'a':i/2+1}</small></span>`}).join('');
 let body='';
 if(RT.ph==='setup'){const h=rtHist[RT.pat+'@'+RT.bpm];
  body=`<p class="muted">${x.rtHow}</p>
  <div class="lbl" style="margin-top:12px">${x.rtPat}</div><div class="seg" id="rtPat">${Object.keys(RPAT).map(k=>`<button data-k="${k}" class="${RT.pat===k?'on':''}">${x.rtPats[k]}</button>`).join('')}</div>
  <div class="strumrow" id="rtS">${arrows}</div>
  <div class="row" style="margin:10px 0"><span class="muted">BPM</span><button class="sq" id="rbm">−</button><output id="rbpm">${RT.bpm}</output><button class="sq" id="rbp">+</button>${h?`<span class="muted">${x.rtBest}: <b>${h.best}</b></span>`:''}</div>
  <p class="t">${x.rtTip}</p>${RT.calibMsg?`<p class="t">${RT.calibMsg}</p>`:''}${RT.noMic?`<p class="t">${x.micDenied} ${mhLink()}</p>`:''}${RT.noWk?`<p class="t">${x.rtNoWk}</p>`:''}
  <button class="fire big" id="rtGo">${x.rtGo}</button>
  <div class="center"><button class="link mhlink" id="rtCal">${RT.lat==null?x.rtCalNone:x.rtCalAgain(Math.round(RT.lat*1000),RT.latEst)}</button></div>`}
 if(RT.ph==='calib')body=`<div class="rtcal"><div class="big">🤫</div><h3>${x.rtCalT}</h3><p>${x.rtCalSub}</p></div>`;
 if(RT.ph==='run')body=`<div class="rtcnt" id="rtCnt">4</div><div class="strumrow" id="rtS">${arrows}</div>
  <div class="rtlane" id="rtLane"><span class="l">${x.rtEarlyL}</span><span class="r">${x.rtLateL}</span><b class="mid"></b></div>
  <p class="rtnow" id="rtNow">${x.rtListen}</p><div class="center">${mhLink()}</div>
  <div class="center"><button id="rtStop">${x.stopM}</button></div>`;
 if(RT.ph==='done'){const s=RT.sum,verdict=Math.abs(s.bias)<=12?x.rtOnTime:s.bias<0?x.rtRush(-s.bias):x.rtDrag(s.bias),steady=s.spread<=18?x.rtSteady:s.spread<=35?x.rtOkSteady:x.rtWobbly;
  const dots=RT.res.map(r=>`<i class="${Math.abs(r.d)<=RT.tol?'ok':Math.abs(r.d)<=RT.tol*2?'mid':'bad'}" style="left:${r.i/RT.slots.length*100}%;top:${50+Math.max(-120,Math.min(120,r.d*1000))/120*45}%"></i>`).join('');
  const up=s.score>=85&&RT.bpm<160;
  body=`<div class="rtres"><div class="big">${s.score}<small>/100</small></div><p class="body"><b>${verdict}</b> ${steady}</p>
  <div class="rtplot"><b class="mid"></b>${dots}<span class="l">${x.rtLateL}</span><span class="r2">${x.rtEarlyL}</span></div>
  <p class="t">${x.rtStats(s.hit,s.okc,s.miss,s.stray,s.n)}</p><p class="t">${s.miss>s.n*.15?x.rtMissTip:s.stray>s.n*.15?x.rtStrayTip:s.score>=85?x.rtNextUp:s.spread>35?x.rtSlowDown:Math.abs(s.bias)>25?x.rtBiasTip:x.rtKeep}</p></div>
  <div class="row" style="justify-content:center;margin-top:10px">${FV.plan?nextBtn():''}<button class="${up?'':'fire'}" id="rtAgain">${x.again}</button>${up?`<button class="fire" id="rtUp">${x.rtFaster(RT.bpm+4)}</button>`:''}<button id="rtSet">${x.rtSettings}</button></div>`}
 el.innerHTML=head(x.ex.rhythm[0])+body;bindHead();
 const on=(id,f)=>{const b=$(id);if(b)b.onclick=f};
 on('rtGo',rtStart);on('rtStop',()=>{rtStop();RT.ph='setup';rtRender()});on('rtAgain',rtStart);on('rtSet',()=>{RT.ph='setup';rtRender()});
 on('rtUp',()=>{RT.bpm+=4;store.set('pcz-rbpm',RT.bpm);rtStart()});on('rtCal',rtCalib);
 on('rbm',()=>{RT.bpm=Math.max(40,RT.bpm-4);store.set('pcz-rbpm',RT.bpm);rtRender()});on('rbp',()=>{RT.bpm=Math.min(180,RT.bpm+4);store.set('pcz-rbpm',RT.bpm);rtRender()});
 const pp=$('rtPat');if(pp)pp.onclick=e=>{const b=e.target.closest('[data-k]');if(b){RT.pat=b.dataset.k;rtRender()}};
}
