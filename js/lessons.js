'use strict';
/* ---------- lessons (learn once) & cards (repeat until it sticks) ---------- */
const recLes=()=>({beg:0,mid:0,adv:7})[level||'beg'];
const knowIt=(i,id)=>(level==='adv'&&i<7)||(level==='mid'&&id==='minor');
let les=store.get('pcz-les',null);
const CHAPTERS=[['Domov a napětí','Home and tension'],['Z čeho je hudba','What music is made of'],['Sólo a uši','Solos and ears']];
const triadNames=(r,ts)=>ts.map(t=>nn(r+t)).join(' ');
function lessons(){
 const {k,us}=A;if(!k)return [];
 const C=(iv,q,ext='')=>C0(k.t+iv,q,ext),I=C(0,k.minor?'m':'M'),IV=C(5,k.minor?'m':'M'),V=C(7,'M'),V7=C(7,'M','7'),VI=k.minor?C(8,'M'):C(9,'m');
 const n=c=>esc(cname(c)),song=esc(curSong().name||tr('tahle písnička','this song')),key=keyName(k),others=us.filter(u=>role(u,k).iv!==0);
 const mr=k.minor?k.t:(k.t+9)%12,Mr=k.minor?(k.t+3)%12:k.t,fret=(mr-4+12)%12||12,ps=k.minor?[0,3,5,7,10,12]:[0,2,4,7,9,12],base=52+((k.t-4+12)%12);
 const pick=(arr,cnt)=>{const o=[];for(const a of arr)if(!o.includes(a))o.push(a);return o.slice(0,cnt)};
 const q1=pick([n(I),...others.map(n),n(IV),n(V),n(VI)],3),nonHome=others[0]||V,nr=role(nonHome,k).num,q3=pick([nr,'I','IV','V','vi','VI','VII'],3);
 const tgtK=k.minor?(k.t===9?4:9):(k.t===7?0:7),sh=(tgtK-k.t+12)%12,s0=seq().slice(0,8),s1=s0.map(c=>tp(c,sh));
 const kn=C0(tgtK,k.minor?'m':'M'),best=capos(us)[0],shapes=withFlat(false,()=>us.slice(0,6).map(u=>esc(cname(u,best.k))).join(' '));
 const Rn=nn(k.t),maj3=withFlat([5,10,3,8,1].includes(k.t),()=>triadNames(k.t,[0,4,7])),min3=withFlat([5,10,3,8,1].includes((k.t+3)%12),()=>triadNames(k.t,[0,3,7]));
 const H=cz?'H':'B',triad=triadNames(I.root,tones(I)),Mn=withFlat([5,10,3,8,1].includes(Mr),()=>nn(Mr)),mn=withFlat([5,10,3,8,1].includes(Mr),()=>nn(mr));
 const afr=(Mr-9+12)%12||12,scaleFr=[0,2,4,5,7,9,11,12].map(x=>afr+x).join(' ');
 const bor=k.minor?{c:V,why:tr(`${n(V)} (durová pětka místo mollové)`,`${n(V)} (a major five instead of minor)`)}:{c:C(10,'M'),why:tr(`${n(C(10,'M'))} (rockový host bVII)`,`${n(C(10,'M'))} (the rock guest bVII)`)};
 const borIn=us.find(u=>!NATIDS[k.minor?'min':'maj'].includes(role(u,k).id)&&role(u,k).iv!==0);
 const arp=c=>{const r=40+((c.root-4+12)%12);return tones(c).map(t=>r+12+t).concat(r+24)};
 const relProg=[C0(Mr,'M'),C0(Mr+5,'M'),C0(Mr+7,'M'),C0(Mr,'M')],relProgM=[C0(mr,'m'),C0(mr+5,'m'),C0(mr+7,'M'),C0(mr,'m')];
 return [
 {id:'home',ch:0,t:tr('Domov','Home'),b:tr(`Každá písnička má jeden akord, kde je doma. Tam většinou začíná a skoro vždy končí. V písničce ${song} je domov <b>${n(I)}</b>.`,`Every song has one chord where it feels at home. It usually starts there and almost always ends there. In ${song} home is <b>${n(I)}</b>.`),
  e:[[tr('▶ Skonči doma','▶ End at home'),[I,IV,V,I]],[tr('▶ Skonči jinde','▶ End elsewhere'),[I,IV,I,V]]],en:tr('Slyšíš, že druhá verze zůstane viset ve vzduchu? Ucho chce domů.','Hear how the second one hangs in the air? Your ear wants to go home.'),
  task:tr(`Zahraj svou písničku a schválně skonči na jiném akordu než ${n(I)}. Slyšíš, že to nesedí?`,`Play your song and end on a chord other than ${n(I)} on purpose. Hear that it doesn’t sit right?`),
  q:tr(`Který akord je v písničce ${song} domov?`,`Which chord is home in ${song}?`),o:q1,ok:0,w:tr(`Domov je ${n(I)}: písnička se k němu pořád vrací.`,`Home is ${n(I)}: the song keeps coming back to it.`)},
 {id:'tension',ch:0,t:tr('Napětí','Tension'),b:tr(`Jeden akord táhne domů nejvíc. Je to pátý akord od domova, proto mu říkáme pětka (V). V tónině ${key} je to <b>${n(V)}</b>.`,`One chord pulls home more than any other. It’s the fifth chord from home, so we call it five (V). In ${key} it’s <b>${n(V)}</b>.`),
  e:[[tr('▶ Napětí → domov','▶ Tension → home'),[V,I]],[tr('▶ Jen napětí','▶ Tension only'),[I,V]]],en:tr('Po druhé ukázce máš chuť dohrát domov sám, že?','After the second one you want to play home yourself, right?'),
  task:tr(`Zahraj ${n(V)}, nech ho doznít a počítej do tří. Pak ${n(I)}. Cítíš to uvolnění?`,`Play ${n(V)}, let it ring and count to three. Then ${n(I)}. Feel the release?`),
  q:tr(`Který akord v tónině ${key} táhne nejvíc domů?`,`Which chord in ${key} pulls home the most?`),o:pick([n(V),n(IV),n(VI)],3),ok:0,w:tr(`${n(V)} je pětka (V), nejsilnější napětí.`,`${n(V)} is the five (V), the strongest tension.`)},
 {id:'numbers',ch:0,t:tr('Čísla místo názvů','Numbers, not names'),b:tr(`Když akordy očísluješ od domova (domov = I), uvidíš skryté vzorce. Tvoje písnička je <b>${s0.map(c=>role(c,k).num).join(' – ')}</b>. Od ${n(kn)} by stejná písnička byla ${s1.map(n).join(' ')}.`,`Number the chords from home (home = I) and hidden patterns appear. Your song is <b>${s0.map(c=>role(c,k).num).join(' – ')}</b>. Starting from ${n(kn)} the same song would be ${s1.map(n).join(' ')}.`),
  e:[[tr('▶ Originál','▶ Original'),s0],[tr('▶ Posunuto','▶ Moved'),s1]],en:tr('Pořád stejná písnička, jen výš nebo níž. Čísla zůstala.','Still the same song, just higher or lower. The numbers stay.'),
  task:tr(`Zahraj ${s1.map(n).join(' ')}. Poznáš v tom svou písničku?`,`Play ${s1.map(n).join(' ')}. Can you hear your song in it?`),
  q:tr(`Jaké číslo má akord ${n(nonHome)} v téhle písničce?`,`What number does ${n(nonHome)} have in this song?`),o:q3,ok:0,w:tr(`Od domova ${n(I)} je ${n(nonHome)} stupeň ${nr}.`,`Counting from home ${n(I)}, ${n(nonHome)} is degree ${nr}.`)},
 {id:'capo',ch:0,t:tr('Kapodastr','Capo'),b:tr(`Kapodastr posune celou kytaru výš. Hraješ stejné tvary, ale znějí o tolik půltónů výš, na kolikátém pražci kapo je. Pro tuhle písničku: <b>${best.k?S.cs.capoAt(best.k):S.cs.noCapo}</b> a hraješ ${shapes}.`,`A capo moves the whole guitar up. You play the same shapes, they sound as many half steps higher as the fret the capo is on. For this song: <b>${best.k?S.en.capoAt(best.k):S.en.noCapo}</b> and you play ${shapes}.`),
  e:[[tr('▶ Tvar G bez kapa','▶ G shape, no capo'),[C0(7,'M')]],[tr('▶ Tvar G, kapo na 2','▶ G shape, capo on 2'),[C0(9,'M')]]],en:tr('Stejný tvar, ale druhý zní o kus výš. Je to A.','Same shape, the second sounds higher. It’s an A.'),
  task:tr('Nasaď kapo na 2. pražec a zahraj G, C, D. Ve skutečnosti zní A, D, E.','Put a capo on fret 2 and play G, C, D. What really sounds is A, D, E.'),
  q:tr('Kapo je na 2. pražci a hraješ tvar G. Jaký akord zní?','Capo on fret 2 and you play a G shape. Which chord sounds?'),o:['A','G',H],ok:0,w:tr('G posunuté o dva půltóny nahoru je A.','G moved up two half steps is A.')},
 {id:'minor',ch:1,t:tr('Dur a moll','Major and minor'),b:tr(`Dur a moll se liší jen jedním tónem, tím prostředním (tercie). V moll je o jeden pražec níž a to stačí na smutnou náladu. ${Rn} dur: <b>${maj3}</b> · ${Rn} moll: <b>${min3}</b>.`,`Major and minor differ by one note, the middle one (the third). In minor it’s one fret lower, and that’s enough for a sad mood. ${Rn} major: <b>${maj3}</b> · ${Rn} minor: <b>${min3}</b>.`),
  e:[[tr('▶ Dur','▶ Major'),[C(0,'M')]],[tr('▶ Moll','▶ Minor'),[C(0,'m')]]],en:tr('Jeden tón, úplně jiná nálada.','One note, a totally different mood.'),
  task:tr('Zahraj E a pak Em. Který prst se pohnul? Přesně ten tón je tercie.','Play E and then Em. Which finger moved? That note is the third.'),
  q:tr('Čím se liší moll od duru?','How is minor different from major?'),o:tr(['Prostřední tón je o pražec níž','Hraje se pomaleji','Má o jeden tón víc'],['The middle note is one fret lower','It’s played slower','It has one more note']),ok:0,w:tr('Jen tercie, prostřední tón, je o půltón níž.','Only the third, the middle note, is a half step lower.')},
 {id:'scale',ch:1,t:tr('Stupnice','The scale'),b:tr(`Stupnice je žebřík tónů, ze kterých je písnička postavená. Durová jde po krocích <b>celý–celý–půl–celý–celý–celý–půl</b>. Celý tón = 2 pražce, půltón = 1 pražec. Proto mezi E–F a ${H}–C není žádný křížek.`,`A scale is the ladder of notes a song is built from. Major goes in steps <b>whole–whole–half–whole–whole–whole–half</b>. Whole step = 2 frets, half step = 1 fret. That’s why there’s no sharp between E–F and ${H}–C.`),
  e:[[tr('▶ C dur','▶ C major'),[48,50,52,53,55,57,59,60],{notes:true,step:.36}],[`▶ ${Mn} ${tr('dur','major')}`,[0,2,4,5,7,9,11,12].map(x=>45+afr+x),{notes:true,step:.36}]],en:tr('Poslouchej, kde jsou ty dva menší kroky. Zní jako „dosednutí“.','Listen for the two small steps. They sound like settling down.'),
  task:tr(`Na struně A zahraj pražce ${scaleFr}. To je ${Mn} dur stupnice, ze které je tvoje písnička.`,`On the A string play frets ${scaleFr}. That’s the ${Mn} major scale your song is built from.`),
  q:tr('Kolik pražců je mezi E a F?','How many frets between E and F?'),o:['1','2','3'],ok:0,w:tr(`E–F a ${H}–C jsou půltóny, proto tam není křížek.`,`E–F and ${H}–C are half steps, so there’s no sharp between them.`)},
 {id:'triad',ch:1,t:tr('Z čeho je akord','What a chord is made of'),b:tr(`Akord vznikne ze stupnice: vezmeš 1., 3. a 5. tón, tedy každý druhý. ${n(I)} = <b>${triad}</b>. Proto má akord jen tři různé tóny, i když brnkáš šest strun.`,`A chord comes from the scale: take the 1st, 3rd and 5th note, every other one. ${n(I)} = <b>${triad}</b>. That’s why a chord has only three different notes even when you strum six strings.`),
  e:[[tr('▶ Tóny po jednom','▶ Notes one by one'),arp(I),{notes:true,step:.4}],[tr('▶ Celý akord','▶ Whole chord'),[I]]],en:tr('Stejné tóny, jednou po jednom, jednou naráz.','Same notes, once one by one, once together.'),
  task:tr(`Chyť ${n(I)} a brnkni struny po jedné od basové. Kolik různých tónů slyšíš? (${triad})`,`Hold ${n(I)} and pick the strings one by one from the bass. How many different notes do you hear? (${triad})`),
  q:tr(`Z jakých tónů je ${n(I)}?`,`Which notes make ${n(I)}?`),o:[triad,triadNames(I.root,[0,2,4]),triadNames(I.root,[0,5,7])],ok:0,w:tr(`1., 3. a 5. tón: ${triad}.`,`The 1st, 3rd and 5th: ${triad}.`)},
 {id:'seventh',ch:1,t:tr('Sedmičky','Sevenths'),b:tr(`Když k napětí (${n(V)}) přidáš ještě jeden tón, sedmičku, vznikne <b>${n(V7)}</b> a táhne domů ještě silněji. Ten přidaný tón ${nn(k.t+5)} chce spadnout o kousek níž.`,`Add one more note, the seventh, to the tension chord (${n(V)}) and you get <b>${n(V7)}</b>, which pulls home even harder. That extra note ${nn(k.t+5)} wants to fall a step down.`),
  e:[[`▶ ${cname(V)} → ${cname(I)}`,[V,I]],[`▶ ${cname(V7)} → ${cname(I)}`,[V7,I]]],en:tr('Druhý návrat zní ještě víc „konečně doma“.','The second return sounds even more like home at last.'),
  task:tr(`Zahraj ${n(V)} → ${n(I)} a pak ${n(V7)} → ${n(I)}. Které zní víc domů?`,`Play ${n(V)} → ${n(I)} and then ${n(V7)} → ${n(I)}. Which sounds more like home?`),
  q:tr(`Který akord táhne do ${n(I)} nejvíc?`,`Which chord pulls to ${n(I)} the most?`),o:[n(V7),n(V),n(IV)],ok:0,w:tr(`${n(V7)}: napětí plus sedmička.`,`${n(V7)}: tension plus the seventh.`)},
 {id:'pent',ch:2,t:tr('Kde hrát sólo','Where to solo'),b:tr(`Pentatonika je pět tónů z tóniny, které nad písničkou skoro nikdy nezní špatně. Většina rockových sól stojí na ní. Tady jsou to <b>${(k.minor?[0,3,5,7,10]:[0,2,4,7,9]).map(t=>nn(k.t+t)).join(' ')}</b> a box 1 začíná na <b>${fret}. pražci</b> basové E struny.`,`The pentatonic is five notes from the key that almost never sound wrong over the song. Most rock solos are built on it. Here it’s <b>${(k.minor?[0,3,5,7,10]:[0,2,4,7,9]).map(t=>nn(k.t+t)).join(' ')}</b> and box 1 starts at <b>fret ${fret}</b> on the low E string.`),
  e:[[tr('▶ Zahraj pentatoniku','▶ Play the pentatonic'),ps.map(t=>base+t),{notes:true,step:.38}],[tr('Ukaž na hmatníku','Show on the fretboard'),[],{act:()=>{mode='pent';setSub('solo')}}]],en:tr('Na hmatníku je box zvýrazněný oranžově.','The box is highlighted in orange on the fretboard.'),
  taskBeg:tr(`Zahraj tóny boxu od ${fret}. pražce jeden po druhém nahoru a dolů, pomalu. Pak z nich zkus poskládat krátkou melodii ze tří tónů a skonči na ${nn(k.t)}.`,`Play the box notes from fret ${fret} one by one up and down, slowly. Then make a short three-note tune from them and end on ${nn(k.t)}.`),
  task:tr(`Pusť si doprovod (5 minut → Hraj s doprovodem) a improvizuj v boxu od ${fret}. pražce. Konči na tónu ${nn(k.t)}.`,`Start the play-along (5 minutes → Play along) and improvise in the box from fret ${fret}. End on ${nn(k.t)}.`),
  q:tr('Na kterém pražci basové E struny začíná box 1?','On which fret of the low E string does box 1 start?'),o:pick([fret,(fret+2)%12||12,(fret+9)%12||12].map(String),3),ok:0,w:tr(`Na ${fret}. pražci je tón ${nn(mr)}, tam box začíná.`,`Fret ${fret} is the note ${nn(mr)}, the box starts there.`)},
 {id:'relative',ch:2,t:tr('Paralelní tónina','Relative keys'),b:tr(`Každá durová tónina má mollovou sestru se stejnými tóny i akordy: <b>${Mn} dur a ${mn} moll</b>. Liší se jen tím, kde je domov. Proto ti jeden box pentatoniky sedí na obě.`,`Every major key has a minor sister with the same notes and chords: <b>${Mn} major and ${mn} minor</b>. Only home is different. That’s why one pentatonic box fits both.`),
  e:[[`▶ ${Mn} ${tr('dur','major')}`,relProg],[`▶ ${mn} ${tr('moll','minor')}`,relProgM]],en:tr('Stejný materiál, jiný domov, jiná nálada.','Same material, different home, different mood.'),
  task:tr(`Zahraj ${Mn} – ${nn(Mr+5)} – ${nn(Mr+7)} a pak ${mn}m – ${nn(mr+5)}m – ${nn(mr+7)}. Cítíš, jak se změnil domov?`,`Play ${Mn} – ${nn(Mr+5)} – ${nn(Mr+7)} and then ${mn}m – ${nn(mr+5)}m – ${nn(mr+7)}. Feel home moving?`),
  q:tr(`Paralelní moll k ${Mn} dur je…`,`The relative minor of ${Mn} major is…`),o:[mn+' moll',nn(Mr+4)+' moll',nn(Mr+2)+' moll'].map(s=>lang==='cs'?s:s.replace('moll','minor')),ok:0,w:tr(`${mn} moll: tři půltóny pod ${Mn}.`,`${mn} minor: three half steps below ${Mn}.`)},
 {id:'keyfind',ch:2,t:tr('Jak poznat tóninu','How to find the key'),b:tr(`Tóninu poznáš ve třech krocích: <b>1)</b> kterým akordem písnička začíná a končí, <b>2)</b> který akord se vrací nejčastěji, <b>3)</b> jestli ostatní akordy patří do jedné stupnice. U ${song} to vychází na <b>${key}</b>.`,`Find the key in three steps: <b>1)</b> which chord the song starts and ends on, <b>2)</b> which chord keeps coming back, <b>3)</b> whether the other chords belong to one scale. For ${song} that gives <b>${key}</b>.`),
  e:[[tr('▶ Zahraj akordy písničky','▶ Play the song’s chords'),s0]],en:tr('Poslouchej, kde to zní jako konec.','Listen for where it sounds like the end.'),
  task:tr('Vezmi písničku, kterou hraješ zpaměti, a zkus tóninu poznat sám. Pak ji sem vlož a zkontroluj se.','Take a song you play by heart and work out the key yourself. Then add it here and check.'),
  q:(()=>{const kk=(k.t+5)%12;return withFlat([5,10,3,8,1].includes(kk),()=>tr(`Akordy ${nn(kk)} ${nn(kk+9)}m ${nn(kk+5)} ${nn(kk+7)} ${nn(kk)}. Jaká je tónina?`,`Chords ${nn(kk)} ${nn(kk+9)}m ${nn(kk+5)} ${nn(kk+7)} ${nn(kk)}. What’s the key?`))})(),
  o:(()=>{const kk=(k.t+5)%12;return withFlat([5,10,3,8,1].includes(kk),()=>[nn(kk)+' '+X().major,nn(kk+9)+' '+X().minor,nn(kk+5)+' '+X().major])})(),ok:0,w:tr('Začíná i končí na něm a ostatní akordy jsou z jeho stupnice.','It starts and ends there and the other chords come from its scale.')},
 {id:'borrowed',ch:2,t:tr('Vypůjčené akordy','Borrowed chords'),b:tr(`Některé akordy do tóniny nepatří, písnička si je půjčí kvůli barvě. V tónině ${key} je typický ${bor.why}.`+(borIn?` Ve tvé písničce je takový host <b>${n(borIn)}</b>.`:''),`Some chords don’t belong to the key, the song borrows them for colour. In ${key} a typical one is ${bor.why}.`+(borIn?` Your song has such a guest: <b>${n(borIn)}</b>.`:'')),
  e:k.minor?[[tr('▶ S vypůjčeným','▶ With the borrowed one'),[I,IV,V,I]],[tr('▶ Bez něj','▶ Without it'),[I,IV,C(7,'m'),I]]]:[[tr('▶ S vypůjčeným','▶ With the borrowed one'),[I,C(10,'M'),IV,I]],[tr('▶ Bez něj','▶ Without it'),[I,V,IV,I]]],en:tr('Vypůjčený akord dodá šťávu, ale písnička zůstane doma.','The borrowed chord adds flavour, but the song stays home.'),
  task:tr('Projdi své písničky v Rozboru a najdi akord označený jako „Host“ nebo „Vypůjčený“.','Go through your songs in Analysis and find a chord marked “Guest” or “Borrowed”.'),
  q:tr(`Který akord v ${key} je vypůjčený?`,`Which chord in ${key} is borrowed?`),o:[n(bor.c),n(IV),n(VI)],ok:0,w:bor.why}
 ];
}
let lstep=0,lAns=null;
const LSTEPS=['idea','listen','play','quiz','done'];
function partOf(i){return i<6?0:1}
function renderLes(){
 regN=Math.max(regN,500);analyze();const L=lessons(),x=X();$('lesSong').textContent=x.lesOn(curSong().name||'—');
 if(!L.length){$('lpath').innerHTML='';$('lbar').innerHTML='';$('lesson').innerHTML=`<p class="empty">${x.empty}</p>`;return}
 if(les==null){les=recLes();lstep=0}if(les>=L.length)les=0;const l=L[les],rl=recLes(),part=partOf(les);
 $('lesAll').textContent=x.allLesN(done.length,L.length);
 // the path: only the 6 lessons of the current part
 const idx=L.map((m,i)=>i).filter(i=>partOf(i)===part);
 $('lpath').innerHTML=`<div class="lbl">${x.partL[part]}</div><div class="dots">${idx.map(i=>`<button data-li="${i}" class="${done.includes(L[i].id)?'dn':''}${i===les?' on':''}" aria-label="${esc(L[i].t)}">${done.includes(L[i].id)?'✓':i-idx[0]+1}</button>`).join('<i></i>')}</div>`;
 $('ll').innerHTML=CHAPTERS.map((c,ci)=>`<div class="chap">${ci+1}. ${c[lang==='cs'?0:1]}</div>`+L.map((m,i)=>m.ch!==ci?'':`<button class="${done.includes(m.id)?'dn':''}${i===les?' on':''}" data-li="${i}"><span class="n">${done.includes(m.id)?'✓':i+1}</span>${m.t}${i===rl&&!done.includes(m.id)?` <em class="sh">${x.startHere}</em>`:''}</button>`).join('')).join('');
 const st=LSTEPS[lstep],know=knowIt(les,l.id)&&!done.includes(l.id);
 const prog=`<div class="lsteps">${LSTEPS.slice(0,4).map((k,i)=>`<span class="${i<lstep?'dn':i===lstep?'on':''}"></span>`).join('')}</div>`;
 let body='';
 if(st==='idea')body=`<div class="lbl">${x.lesOf(les+1,L.length)}</div><h2>${l.t}</h2>${know?`<p class="know">${x.knowIt2}</p>`:''}<p class="body">${l.b}</p>`;
 if(st==='listen')body=`<div class="lbl">🎧 ${x.listenL}</div><h2>${l.t}</h2><div class="bigbtns">${l.e.map(([lb,it,o])=>pbtn(lb,it,{...(o||{}),cls:'fire'})).join('')}</div><p class="body">${l.en}</p>`;
 if(st==='play')body=`<div class="lbl">🎸 ${x.taskL}</div><h2>${l.t}</h2><p class="body big">${PL()==='beg'&&l.taskBeg?l.taskBeg:l.task}</p>`;
 if(st==='quiz'){const rot=((curSong().name||'').length+les)%l.o.length,ord=l.o.map((v,i)=>(i+rot)%l.o.length);
  body=`<div class="lbl">❓ ${x.quizL}</div><p class="qq">${l.q}</p><div class="opts">${ord.map(i=>`<button data-ok="${i===l.ok?1:0}" data-oi="${i}" class="${lAns==null?'':i===l.ok&&lAns===l.ok?'ok':i===lAns?'no':''}">${l.o[i]}</button>`).join('')}</div><p class="qfb" id="qfb">${lAns==null?'':lAns===l.ok?x.right+' '+l.w:x.wrong}</p>`}
 if(st==='done'){const nx=les<L.length-1?L[les+1]:null;body=`<div class="donebox"><div class="big">🎉</div><h2>${x.lesDone(l.t)}</h2><p class="body">${x.lesDoneSub}</p>${nx?`<p class="t">${x.nextIs(nx.t)}</p>`:`<p class="t">${x.allDone}</p>`}</div>`}
 $('lesson').innerHTML=prog+`<div class="lcard">${body}</div>`;
 const canNext=st!=='quiz'||lAns===l.ok;
 $('lbar').innerHTML=st==='done'
  ?`<button data-lb="again">${x.again}</button>${les<L.length-1?`<button class="fire" data-lb="nextles">${x.next}</button>`:`<button class="fire" data-lb="five">${x.to5}</button>`}`
  :`${lstep?`<button data-lb="back">←</button>`:`<button data-lb="skip">${know?x.skipKnow:x.skipQ}</button>`}<button class="fire" data-lb="next" ${canNext?'':'disabled'}>${st==='quiz'?x.finish:x.cont}</button>`;
 $('lesson').dataset.id=l.id;
}
function lesGo(i){les=i;lstep=0;lAns=null;store.set('pcz-les',les);stopPlay();renderLes();window.scrollTo(0,0)}
function lessonDone(id){if(done.includes(id))return false;done.push(id);store.set('pcz-done2',done);if(!cards[id]){cards[id]={b:1,due:addDays(1)};store.set('pcz-cards',cards)}return true}
document.addEventListener('DOMContentLoaded',()=>{
 const pick=e=>{const b=e.target.closest('[data-li]');if(b){$('lesOv').hidden=true;lesGo(+b.dataset.li)}};
 $('ll').addEventListener('click',pick);$('lpath').addEventListener('click',pick);
 $('lesAll').onclick=()=>{$('lesOv').hidden=false};$('lesOvX').onclick=()=>{$('lesOv').hidden=true};$('lesOv').addEventListener('click',e=>{if(e.target.id==='lesOv')$('lesOv').hidden=true});
 $('lbar').addEventListener('click',e=>{const b=e.target.closest('[data-lb]');if(!b)return;const a=b.dataset.lb;stopPlay();
  if(a==='next'){lstep=Math.min(4,lstep+1)}else if(a==='back'){lstep=Math.max(0,lstep-1)}else if(a==='skip'){lstep=3}
  else if(a==='again'){lstep=0;lAns=null}else if(a==='nextles'){return lesGo(les+1)}else if(a==='five'){return go('five')}
  renderLes();window.scrollTo(0,0)});
 $('lesson').addEventListener('click',e=>{
  const b=e.target.closest('[data-ok]');if(!b||lAns===+lessons()[les].ok)return;lAns=+b.dataset.oi;
  if(b.dataset.ok==='1'&&lessonDone($('lesson').dataset.id)){}
  renderLes();
  if(b.dataset.ok==='1'){const q=$('qfb');if(q&&!q.textContent.includes(X().addedCards))q.textContent+=' '+X().addedCards}
 });
});

/* cards: spaced repetition of what lessons taught */
const BOX_DAYS=[1,2,4,8,16];
function dueCards(){const t=today();return done.filter(id=>cards[id]&&cards[id].due<=t)}
function pickCard(){const d=dueCards();const pool=d.length?d:done.slice();return pool.length?pool[Math.floor(Math.random()*pool.length)]:null}
function cardAnswer(id,ok){const c=cards[id]||{b:1,due:today()};if(ok){c.b=Math.min(5,c.b+1);c.due=addDays(BOX_DAYS[c.b-1])}else{c.b=1;c.due=today()}cards[id]=c;store.set('pcz-cards',cards)}
const rk=()=>Math.floor(Math.random()*12),rnd=a=>a[Math.floor(Math.random()*a.length)];
function songCtx(){const ss=shuffle(songs().slice());for(const s of ss){const a=analyzeText(s.text);if(a.k&&a.us.length>=3)return {s,a}}return null}
function cardQ(id){
 const x=X(),fl=k=>[5,10,3,8,1].includes(k.minor?(k.t+3)%12:k.t);
 const keyQ=(minor)=>{const k={t:rk(),minor};return k};
 const mk=(k,fn)=>withFlat(fl(k),fn);
 if(id==='home'||id==='numbers'||id==='keyfind'&&Math.random()<.5){const sc=songCtx();if(sc){const {s,a}=sc,k=a.k;return mk(k,()=>{const I=a.us.find(u=>role(u,k).iv===0)||C0(k.t,k.minor?'m':'M'),oth=a.us.filter(u=>role(u,k).iv!==0),nm=esc(s.name);
  if(id==='home')return {q:tr(`Písnička „${nm}“: který akord je domov?`,`Song “${nm}”: which chord is home?`),o:[cname(I),...shuffle(oth).slice(0,2).map(u=>cname(u))],ok:0,w:tr(`${cname(I)}, písnička se k němu vrací.`,`${cname(I)}, the song keeps returning to it.`)};
  if(id==='numbers'){const u=rnd(oth),r=role(u,k),wrong=shuffle(['I','IV','V','vi','ii','VI','VII','iv'].filter(z=>z!==r.num)).slice(0,2);return {q:tr(`„${nm}“ (domov ${cname(I)}): jaké číslo má ${cname(u)}?`,`“${nm}” (home ${cname(I)}): what number is ${cname(u)}?`),o:[r.num,...wrong],ok:0,w:tr(`${cname(u)} je ${r.num} – ${r.word.toLowerCase()}.`,`${cname(u)} is ${r.num} – ${r.word.toLowerCase()}.`)}}
  return {q:tr(`„${nm}“: akordy ${seqOf(a.cs).slice(0,6).map(c=>cname(c)).join(' ')}. Jaká je tónina?`,`“${nm}”: chords ${seqOf(a.cs).slice(0,6).map(c=>cname(c)).join(' ')}. What’s the key?`),o:[keyName(k),keyName({t:k.minor?(k.t+3)%12:(k.t+9)%12,minor:!k.minor}),keyName({t:(k.t+7)%12,minor:k.minor})],ok:0,w:tr('Začíná a končí na domově.','It starts and ends at home.')}})}}
 if(id==='tension'||id==='home'||id==='numbers'){const k=keyQ(false);return mk(k,()=>({q:tr(`V tónině ${keyName(k)}: který akord je napětí (V)?`,`In ${keyName(k)}: which chord is the tension (V)?`),o:[cname(C0(k.t+7,'M')),cname(C0(k.t+5,'M')),cname(C0(k.t+9,'m'))],ok:0,w:tr(`Pátý akord od domova: ${cname(C0(k.t+7,'M'))}.`,`Five steps up from home: ${cname(C0(k.t+7,'M'))}.`)}))}
 if(id==='capo'){const n=1+Math.floor(Math.random()*5),sh=rnd([C0(7,'M'),C0(0,'M'),C0(2,'M'),C0(9,'M'),C0(4,'m'),C0(9,'m')]);return withFlat(false,()=>({q:tr(`Kapo na ${n}. pražci, hraješ tvar ${cname(sh)}. Co zní?`,`Capo on fret ${n}, you play a ${cname(sh)} shape. What sounds?`),o:[cname(tp(sh,n)),cname(tp(sh,n+1)),cname(tp(sh,-n))],ok:0,w:tr(`${cname(sh)} posunuté o ${n} půltónů nahoru je ${cname(tp(sh,n))}.`,`${cname(sh)} moved up ${n} half steps is ${cname(tp(sh,n))}.`)}))}
 if(id==='minor'){const r=rk();return withFlat([5,10,3,8,1].includes((r+3)%12),()=>({q:tr(`Jaké tóny má ${nn(r)} moll?`,`Which notes make ${nn(r)} minor?`),o:[triadNames(r,[0,3,7]),triadNames(r,[0,4,7]),triadNames(r,[0,5,7])],ok:0,w:tr('Moll má prostřední tón o pražec níž než dur.','Minor has the middle note one fret lower than major.')}))}
 if(id==='scale'){const pairs=[['E','F',1],[cz?'H':'B','C',1],['C','D',2],['F','G',2],['A',cz?'H':'B',2],['D','E',2],['G','A',2]],p=rnd(pairs);return {q:tr(`Kolik pražců je mezi ${p[0]} a ${p[1]}?`,`How many frets between ${p[0]} and ${p[1]}?`),o:[String(p[2]),String(3-p[2]),'3'],ok:0,w:tr(`E–F a ${cz?'H':'B'}–C jsou 1 pražec, ostatní sousední tóny 2.`,`E–F and ${cz?'H':'B'}–C are 1 fret, other neighbours 2.`)}}
 if(id==='triad'){const r=rk(),mi=Math.random()<.5,ts=mi?[0,3,7]:[0,4,7];return withFlat([5,10,3,8,1].includes(mi?(r+3)%12:r),()=>({q:tr(`Z jakých tónů je ${nn(r)}${mi?'m':''}?`,`Which notes make ${nn(r)}${mi?'m':''}?`),o:[triadNames(r,ts),triadNames(r,[0,2,4]),triadNames(r,[0,5,9])],ok:0,w:tr('1., 3. a 5. tón stupnice.','The 1st, 3rd and 5th of the scale.')}))}
 if(id==='seventh'){const k=keyQ(false);return mk(k,()=>({q:tr(`Který akord táhne do ${nn(k.t)} nejvíc?`,`Which chord pulls to ${nn(k.t)} the most?`),o:[cname(C0(k.t+7,'M','7')),cname(C0(k.t+5,'M')),cname(C0(k.t+9,'m'))],ok:0,w:tr('Pětka se sedmičkou.','The five with a seventh.')}))}
 if(id==='pent'){const k=keyQ(Math.random()<.6),set=k.minor?[0,3,5,7,10]:[0,2,4,7,9],out=k.minor?rnd([2,8]):rnd([5,11]),ins=shuffle(set.slice(1)).slice(0,2);return mk(k,()=>({q:tr(`Který tón NEpatří do ${keyName(k)} pentatoniky?`,`Which note is NOT in the ${keyName(k)} pentatonic?`),o:[nn(k.t+out),...ins.map(i=>nn(k.t+i))],ok:0,w:tr(`${keyName(k)} pentatonika: ${set.map(i=>nn(k.t+i)).join(' ')}.`,`${keyName(k)} pentatonic: ${set.map(i=>nn(k.t+i)).join(' ')}.`)}))}
 if(id==='relative'){const k=keyQ(false);return mk(k,()=>({q:tr(`Paralelní moll k ${nn(k.t)} dur je…`,`The relative minor of ${nn(k.t)} major is…`),o:[nn(k.t+9),nn(k.t+4),nn(k.t+2)].map(s=>s+' '+x.minor),ok:0,w:tr('Tři půltóny pod domovem.','Three half steps below home.')}))}
 if(id==='keyfind'){const k=keyQ(false);return mk(k,()=>{const cs=[C0(k.t,'M'),C0(k.t+9,'m'),C0(k.t+5,'M'),C0(k.t+7,'M'),C0(k.t,'M')];return {q:tr(`Akordy ${cs.map(c=>cname(c)).join(' ')}. Jaká je tónina?`,`Chords ${cs.map(c=>cname(c)).join(' ')}. What’s the key?`),o:[keyName(k),keyName({t:(k.t+9)%12,minor:true}),keyName({t:(k.t+5)%12,minor:false})],ok:0,w:tr('Začíná i končí na něm.','It starts and ends there.')}})}
 if(id==='borrowed'){const k=keyQ(false);return mk(k,()=>({q:tr(`Který akord v ${keyName(k)} je vypůjčený?`,`Which chord in ${keyName(k)} is borrowed?`),o:[cname(C0(k.t+10,'M')),cname(C0(k.t+5,'M')),cname(C0(k.t+9,'m'))],ok:0,w:tr(`${cname(C0(k.t+10,'M'))} je bVII, rockový host z moll.`,`${cname(C0(k.t+10,'M'))} is bVII, the rock guest from minor.`)}))}
 return null;
}
