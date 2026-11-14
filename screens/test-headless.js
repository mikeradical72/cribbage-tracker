const puppeteer=require('puppeteer-core');
const full=async(p,path)=>{const h=await p.evaluate(()=>document.documentElement.scrollHeight);await p.setViewport({width:390,height:Math.max(844,h),deviceScaleFactor:2,isMobile:true,hasTouch:true});await sleep(250);await p.screenshot({path});await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});await sleep(150);};
const OUT='/workspace/cribbage-tracker/screens/';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox','--font-render-hinting=none']});
 const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});
 const URL=process.argv[2]||'http://localhost:8123/';
 await p.goto(URL,{waitUntil:'networkidle0'});
 await p.evaluate(()=>localStorage.clear());await p.reload({waitUntil:'networkidle0'});
 await p.screenshot({path:OUT+'0-empty.png'});
 const seed=[['2026-11-01','Robert',121,98,'me'],['2026-11-03','Robert',105,121,'them'],['2026-11-05','Justin',121,85,'me'],['2026-11-07','Q',59,121,'them'],['2026-11-09','Robert',121,115,'them'],['2026-11-10','Justin',121,112,'me']];
 await p.evaluate(seed=>{const s={v:1,me:'Mike',sound:false,matches:seed.map(([date,opponent,myScore,oppScore,firstDealer],i)=>({id:'s'+i,status:'final',opponent,firstDealer,myScore,oppScore,date,createdAt:1+i,updatedAt:1+i,scheduled:null,invite:null,notes:''}))};localStorage.setItem('crib.v1',JSON.stringify(s));},seed);
 await p.reload({waitUntil:'networkidle0'});
 let st=await p.evaluate(()=>__crib.stats());console.log('seed stats',JSON.stringify(st));
 await p.screenshot({path:OUT+'1-dashboard.png'});await full(p,OUT+'1-dashboard-full.png');
 // log a win via UI
 await p.click('[data-tab=log]');await sleep(200);
 await p.click('#opps button[data-o="Robert"]');
 await p.click('#deal [data-v=me]');
 await p.click('#win [data-v=me]');
 await p.type('#op','97');await sleep(200);
 console.log('preview:',await p.$eval('#prev',e=>e.textContent));
 await p.evaluate(()=>document.activeElement.blur());
 await p.screenshot({path:OUT+'2-log.png'});await full(p,OUT+'2-log-full.png');
 // validation checks
 const v=await p.evaluate(()=>[__crib.validate({opponent:'A',my:'121',opp:'121',date:'2026-11-01'}).err,__crib.validate({opponent:'A',my:'120',opp:'100',date:'2026-11-01'}).err,__crib.validate({opponent:'A',my:'130',opp:'100',date:'2026-11-01'}).err,__crib.validate({opponent:'',my:'121',opp:'100',date:'2026-11-01'}).err]);
 console.log('validation',v);
 await p.$eval('#save',e=>e.scrollIntoView({block:'center'}));await sleep(150);await p.click('#save');await sleep(1700);
 await p.screenshot({path:OUT+'3-win-animation.png'});
 await p.mouse.click(195,420);await sleep(400);
 console.log('after win, tab home?',await p.$eval('#top h1',e=>e.textContent), JSON.stringify(await p.evaluate(()=>__crib.stats())));
 // log a loss
 await p.click('[data-tab=log]');await sleep(200);
 await p.type('#opp','Q');await p.click('#deal [data-v=them]');await p.click('#win [data-v=them]');await p.type('#my','113');await sleep(100);
 console.log('preview:',await p.$eval('#prev',e=>e.textContent));
 await p.$eval('#save',e=>e.scrollIntoView({block:'center'}));await sleep(150);await p.click('#save');await sleep(1500);
 await p.screenshot({path:OUT+'4-loss-animation.png'});await sleep(1500);await p.screenshot({path:OUT+'4b-loss-animation-end.png'});
 await p.mouse.click(195,420);await sleep(400);
 st=await p.evaluate(()=>__crib.stats());console.log('final stats',JSON.stringify(st));
 await p.screenshot({path:OUT+'1b-dashboard-after.png'});await full(p,OUT+'1b-dashboard-after-full.png');
 await p.click('[data-tab=history]');await sleep(300);
 await p.screenshot({path:OUT+'5-history.png'});await full(p,OUT+'5-history-full.png');
 for(const f of ['W','L','close','blow']){await p.click(`#flt [data-f=${f}]`);await sleep(100);console.log('filter',f,await p.$$eval('#view .m',e=>e.length));}
 await p.click('#flt [data-f=all]');await p.select('#oppsel','Robert');await sleep(100);console.log('Robert rows',await p.$$eval('#view .m',e=>e.length));
 await p.select('#oppsel','');await sleep(100);
 // delete flow
 p.on('dialog',d=>d.accept());
 const n0=await p.evaluate(()=>__crib.S.matches.length);
 await p.click('#view .m');await sleep(400);await p.screenshot({path:OUT+'6-match-sheet.png'});await p.click('#del');await sleep(400);
 console.log('delete',n0,'->',await p.evaluate(()=>__crib.S.matches.length));
 await p.click('[data-tab=rivals]');await sleep(200);await p.screenshot({path:OUT+'7-rivals.png'});await full(p,OUT+'7-rivals-full.png');
 await p.click('[data-tab=home]');await sleep(200);await p.click('#gear');await sleep(200);await p.screenshot({path:OUT+'8-settings.png'});await full(p,OUT+'8-settings-full.png');

 // ---------- stage 2: guide ----------
 console.log('settings via gear:',await p.$eval('#top h1',e=>e.textContent));
 await p.click('#back');await sleep(150);console.log('back ->',await p.$eval('#top h1',e=>e.textContent));
 await p.click('[data-tab=guide]');await sleep(250);
 console.log('guide title',await p.$eval('#top h1',e=>e.textContent),'sections',await p.$$eval('#gsec button',b=>b.map(x=>x.textContent)));
 await p.screenshot({path:OUT+'9-guide.png'});await full(p,OUT+'9-guide-full.png');
 await p.click('#gsec [data-g=count]');await sleep(200);await p.screenshot({path:OUT+'10-counting.png'});await full(p,OUT+'10-counting-full.png');
 await p.click('#gsec [data-g=ex]');await sleep(200);
 console.log('examples',await p.$$eval('[data-ex]',e=>e.length));
 await p.click('[data-show="1"]');await sleep(200);await p.click('[data-show="0"]');await sleep(200);
 await p.$eval('[data-ex="0"]',e=>e.scrollIntoView({block:'start'}));await p.evaluate(()=>window.scrollBy(0,-90));await sleep(150);
 await p.screenshot({path:OUT+'11-example.png'});
 console.log('example1 answer:',await p.$eval('[data-ex="0"] .ans',e=>e.innerText.replace(/\s+/g,' ').slice(0,140)),'tossed cards:',await p.$$eval('[data-ex="0"] .pc.toss',e=>e.length));
 await full(p,OUT+'11-examples-full.png');
 // trainer: fixed hand so the screenshot is reproducible
 await p.click('#gsec [data-g=train]');await sleep(200);
 await p.screenshot({path:OUT+'12-trainer.png'});
 const t0=Date.now();
 await p.evaluate(()=>{const T=__crib.TR;T.six='3h 4s 5d 5c Jh Ks'.split(' ').map(CribEngine.parse);T.dealer=false;T.sel=[];T.res=null;});
 await p.click('#gsec [data-g=train]');await sleep(200);
 await p.click('#trh [data-i="4"]');await p.click('#trh [data-i="5"]');await sleep(100);
 await p.screenshot({path:OUT+'12b-trainer-picked.png'});
 const tc=Date.now();await p.click('#trgo');await sleep(150);
 console.log('trainer verdict:',await p.$eval('.verdict',e=>e.textContent),'ms',Date.now()-tc);
 await p.screenshot({path:OUT+'13-trainer-result.png'});await full(p,OUT+'13-trainer-result-full.png');
 await p.click('#trnew');await sleep(100);await p.click('#trh [data-i="0"]');await p.click('#trh [data-i="1"]');await p.click('#trgo');await sleep(100);
 console.log('random hand verdict:',await p.$eval('.verdict',e=>e.textContent),'record',await p.evaluate(()=>localStorage.getItem('crib.trainer.v1')));
 // speed: 200 random analyses in page
 console.log('200 analyses ms',await p.evaluate(()=>{const t=performance.now();for(let i=0;i<200;i++)CribEngine.analyze(CribEngine.deal(6),i%2===0);return Math.round(performance.now()-t);}));
 // guide numbers checked in-page too
 console.log('in-page example check',await p.evaluate(()=>__crib.EXAMPLES.every(e=>{const a=CribEngine.analyze(e.h.split(' ').map(CribEngine.parse),!!e.d)[0];const tz=e.toss.split(' ').map(CribEngine.parse).map(CribEngine.id);return a.toss.every(c=>tz.includes(CribEngine.id(c)))&&a.now===e.now&&Math.round(a.net*10)/10===e.net;})));
 // log nit: many opponents, scroll to bottom, Save must clear the tab bar
 await p.evaluate(()=>{const s=JSON.parse(localStorage.getItem('crib.v1'));['Ann','Bob','Cal','Dee','Eli','Fay','Gus','Hal','Ivy','Jon'].forEach((o,i)=>s.matches.push({id:'x'+i,status:'final',opponent:o,firstDealer:null,myScore:121,oppScore:100,date:'2026-10-0'+(i%9+1),createdAt:50+i,updatedAt:50+i,scheduled:null,invite:null,notes:''}));localStorage.setItem('crib.v1',JSON.stringify(s));});
 await p.reload({waitUntil:'networkidle0'});await p.click('[data-tab=log]');await sleep(200);
 await p.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));await sleep(200);
 const gapPx=await p.evaluate(()=>{const s=document.querySelector('#clear').getBoundingClientRect(),n=document.querySelector('#tabs').getBoundingClientRect();return Math.round(n.top-s.bottom);});
 console.log('log: px between Clear button and tab bar at bottom of scroll',gapPx,gapPx>0?'OK':'FAIL');
 await p.screenshot({path:OUT+'14-log-bottom.png'});
 console.log('errors',errs);
 await b.close();
})();
