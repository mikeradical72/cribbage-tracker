// Node unit tests for engine.js + every number printed in the Guide. Run: node test-engine.js
const E=require('./engine.js'),T=require('./crib-table.js');E.setCribTable(T);
const fs=require('fs');let fails=0;const ok=(c,m)=>{if(!c){fails++;console.log('FAIL',m);}};
const P=s=>s.split(' ').map(E.parse),sc=(h,st,cr)=>E.score(P(h),st?E.parse(st):null,!!cr);
// 1) known hands
[['5h 5d 5c Js','5s',0,29],['5h 5d 5c 5s','Js',0,28],['7h 7d 8c 8s','9h',0,24],['4h 4d 5c 5s','6h',0,24],['3h 3d 3c 3s','9h',0,24],
 ['2h 4h 6h 8h','Kh',0,5],['2h 4h 6h 8h','Ks',0,4],['2h 4h 6h 8h','Ks',1,0],['2h 4h 6h 8h','Kh',1,5],['Jh 2s 4c 6d','8h',0,1],['Jh 2s 4c 6d','8s',0,0],
 ['3h 3d 4c 4s','5h',0,20],['3h 3d 4c 4s','2h',0,16],['3h 3d 4c 5s',null,0,10]].forEach(([h,s,c,x])=>ok(sc(h,s,c).total===x,`${h}|${s}=${sc(h,s,c).total} exp ${x}`));
// run/pair components from the Counting table
const rp=(h,s)=>{const r=sc(h,s);return r.pairs+r.runs;};
ok(rp('3h 3d 4c 5s',null)===8,'double run of 3');ok(rp('3h 3d 4c 5s','6h')===10,'double run of 4');ok(rp('3h 3d 3c 4s','5h')===15,'triple run');ok(rp('3h 3d 4c 4s','5h')===16,'double-double');
// 2) full distribution: mean 4.7692, 1,009,008 zeros of 12,994,800; no 19/25/26/27
if(!process.argv.includes('--fast')){const cnt={};let sum=0,N=0;
 for(let a=0;a<52;a++)for(let b=a+1;b<52;b++)for(let c=b+1;c<52;c++)for(let d=c+1;d<52;d++){const h=[a,b,c,d].map(E.fromId);for(let s=0;s<52;s++){if(s===a||s===b||s===c||s===d)continue;const v=E.total(h,E.fromId(s),false);cnt[v]=(cnt[v]||0)+1;sum+=v;N++;}}
 ok(N===12994800&&cnt[0]===1009008&&cnt[29]===4&&cnt[28]===76&&!cnt[19]&&!cnt[25]&&!cnt[26]&&!cnt[27]&&(sum/N).toFixed(2)==='4.77','distribution '+JSON.stringify({N,z:cnt[0],m:sum/N}));}
// 3) crib table spot-check vs fresh exact enumeration
for(const [a,b] of [['5h','5s'],['Th','Ks'],['7h','8h'],['Jd','5d']])ok(Math.abs(E.cribAvgExact(E.parse(a),E.parse(b))-T[E.cribKey(E.parse(a),E.parse(b))])<0.001,'table '+a+b);
// 4) Guide numbers inside index.html
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const EX=eval(html.slice(html.indexOf('const EXAMPLES=')+15,html.indexOf('];',html.indexOf('const EXAMPLES='))+1));
const CH=eval(html.slice(html.indexOf('const CHEAT=')+12,html.indexOf('];',html.indexOf('const CHEAT='))+1));
const r1=x=>Math.round(x*10)/10;
ok(EX.length>=10,'example count');
EX.forEach((e,i)=>{const a=E.analyze(P(e.h),!!e.d),b=a[0],tz=P(e.toss).map(E.id);
  const m=`ex${i+1} ${e.h}`;
  ok(b.toss.every(c=>tz.includes(E.id(c))),m+' best toss is '+b.toss.map(E.name).join(' '));
  ok(b.now===e.now,m+' now '+b.now);ok(r1(b.handEV)===e.ev,m+' ev '+b.handEV);ok(r1(b.crib)===e.crib,m+' crib '+b.crib);ok(r1(b.net)===e.net,m+' net '+b.net);ok(r1(b.net-a[1].net)===e.gap,m+' gap '+(b.net-a[1].net));});
{const a=E.analyze(P(EX[0].h),false)[0];ok(a.toss.map(E.name).sort().join()===['3♥','9♠'].sort().join(),'ex1 pone same keep');}
const RK={A:1,J:11,Q:12,K:13};const rk=x=>RK[x]||+x;
CH.forEach(([k,v])=>{const [x,y]=k.split('-').map(rk);const t=T[Math.min(x,y)+'-'+Math.max(x,y)+'o'];ok(r1(t)===v,'cheat '+k+' '+t);});
// text claims
let s5=0;for(let o=1;o<=13;o++)if(o!==5)s5+=T[Math.min(5,o)+'-'+Math.max(5,o)+'o'];ok(r1(s5/12)===6.5,'avg 5');
let sk=0;for(let o=1;o<13;o++)sk+=T[o+'-13o'];ok(r1(sk/12)===4.0,'avg K');
const offs=Object.entries(T).filter(([k])=>k.endsWith('o'));ok(offs.every(([k,v])=>v>=T['10-13o']),'10-K lowest');
const pairs=[...Array(13)].map((_,i)=>T[(i+1)+'-'+(i+1)+'o']).filter((_,i)=>i!==4);ok(r1(Math.min(...pairs))===5.0&&r1(Math.max(...pairs))===6.3,'pair range');
console.log(fails?`${fails} FAILURES`:'engine + guide: all checks passed');process.exit(fails?1:0);
