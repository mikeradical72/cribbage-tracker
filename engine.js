/* Crib Log — cribbage scoring + discard engine (no deps). Works in the browser (window.CribEngine) and Node (require). */
(function(root){
'use strict';
const RANKS=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
const SUITS=['♠','♥','♦','♣'];
const val=r=>r>10?10:r;                         // r: 1..13
const card=(r,s)=>({r,s});
const name=c=>RANKS[c.r-1]+SUITS[c.s];
const id=c=>(c.r-1)*4+c.s;                       // 0..51
const fromId=i=>({r:(i>>2)+1,s:i&3});
// parse "5♠" / "5s" / "10h" / "Jd"
function parse(t){t=String(t).trim();const sc={'♠':0,s:0,S:0,'♥':1,h:1,H:1,'♦':2,d:2,D:2,'♣':3,c:3,C:3}[t.slice(-1)];
  const rs=t.slice(0,-1).toUpperCase();const r=rs==='T'?10:RANKS.indexOf(rs)+1;if(!r||sc===undefined)throw new Error('bad card '+t);return{r,s:sc};}

/* Score a set of cards. hand = 4 cards; starter = card or null; isCrib toggles flush rule.
   Returns {total,fifteens,pairs,runs,flush,nobs}. With starter=null it counts the 4 kept cards alone (no nobs). */
function score(hand,starter,isCrib){
  const all=starter?hand.concat([starter]):hand.slice(),n=all.length;
  // fifteens
  let f=0;const lim=1<<n;
  for(let m=1;m<lim;m++){let s=0;for(let i=0;i<n;i++)if(m&(1<<i))s+=val(all[i].r);if(s===15)f++;}
  // pairs
  const cnt=new Array(15).fill(0);for(const c of all)cnt[c.r]++;
  let p=0;for(let r=1;r<=13;r++)p+=cnt[r]*(cnt[r]-1);         // n*(n-1)/2 pairs *2 pts
  // runs (max length >=3, multiplied by duplicates)
  let runs=0;
  for(let r=1;r<=13;){if(!cnt[r]){r++;continue;}let len=0,mult=1,k=r;while(k<=13&&cnt[k]){len++;mult*=cnt[k];k++;}if(len>=3)runs+=len*mult;r=k;}
  // flush
  let fl=0;const s0=hand[0].s;
  if(hand.every(c=>c.s===s0)){
    if(isCrib){if(starter&&starter.s===s0)fl=5;}
    else fl=(starter&&starter.s===s0)?5:4;
  }
  // nobs (his nobs): jack in hand/crib matching starter suit
  const nobs=starter&&hand.some(c=>c.r===11&&c.s===starter.s)?1:0;
  const r={fifteens:f*2,pairs:p,runs,flush:fl,nobs};r.total=r.fifteens+r.pairs+r.runs+r.flush+r.nobs;return r;
}
const total=(h,st,cr)=>score(h,st,cr).total;

/* Average crib value of a 2-card discard, assuming the other player's two crib cards and the cut are random
   from the 50 cards not in the discard. Exact enumeration: C(50,2)*48 = 58,800 cribs per entry.
   Key: lo rank, hi rank (1..13), suited flag. Precomputed by build-crib-table.js into CRIB_TABLE. */
function cribKey(a,b){const lo=Math.min(a.r,b.r),hi=Math.max(a.r,b.r);return lo+'-'+hi+(a.s===b.s?'s':'o');}
function cribAvgExact(a,b){
  const used=new Set([id(a),id(b)]),rest=[];for(let i=0;i<52;i++)if(!used.has(i))rest.push(fromId(i));
  let sum=0,n=0;
  for(let i=0;i<rest.length;i++)for(let j=i+1;j<rest.length;j++){const cr=[a,b,rest[i],rest[j]];
    for(let k=0;k<rest.length;k++){if(k===i||k===j)continue;sum+=total(cr,rest[k],true);n++;}}
  return sum/n;
}
let CRIB_TABLE=root&&root.CRIB_TABLE||null;
function cribAvg(a,b){if(CRIB_TABLE){const v=CRIB_TABLE[cribKey(a,b)];if(v!=null)return v;}return cribAvgExact(a,b);}

/* All 15 ways to throw 2 of 6. For each: kept 4, points before the cut, exact average hand points over the
   46 unseen starters, average crib value (table), and net = hand ± crib (dealer adds, pone subtracts). */
function analyze(six,dealer){
  const out=[];
  for(let i=0;i<6;i++)for(let j=i+1;j<6;j++){
    const keep=six.filter((_,k)=>k!==i&&k!==j),toss=[six[i],six[j]];
    const seen=new Set(six.map(id));let hs=0,n=0,mx=0,mn=99;
    for(let x=0;x<52;x++){if(seen.has(x))continue;const t=total(keep,fromId(x),false);hs+=t;n++;if(t>mx)mx=t;if(t<mn)mn=t;}
    const handEV=hs/n,crib=cribAvg(toss[0],toss[1]);
    out.push({keep,toss,now:total(keep,null,false),handEV,min:mn,max:mx,crib,net:dealer?handEV+crib:handEV-crib});
  }
  return out.sort((a,b)=>b.net-a.net);
}
function deal(n=6,rng=Math.random){const d=[...Array(52).keys()];for(let i=51;i>0;i--){const j=Math.floor(rng()*(i+1));[d[i],d[j]]=[d[j],d[i]];}return d.slice(0,n).map(fromId);}

const API={RANKS,SUITS,val,card,name,id,fromId,parse,score,total,cribKey,cribAvg,cribAvgExact,analyze,deal,
  setCribTable(t){CRIB_TABLE=t;},get CRIB_TABLE(){return CRIB_TABLE;}};
if(typeof module!=='undefined'&&module.exports)module.exports=API;else root.CribEngine=API;
})(typeof window!=='undefined'?window:globalThis);
