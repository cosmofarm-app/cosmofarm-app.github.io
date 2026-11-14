/* Step 0 test page. No names, IDs or secrets. The probe address comes from config.js (an empty test endpoint) and can be changed on the phone. */
(function(){
  'use strict';
  var out=document.getElementById('out'),url=document.getElementById('url'),page=document.body.getAttribute('data-page');
  function log(s){out.value+=s+'\n';out.scrollTop=out.scrollHeight;}
  function standalone(){return (window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||navigator.standalone===true;}
  var dflt=(typeof STEP0_URL==='string')?STEP0_URL:'';try{url.value=localStorage.getItem('step0url')||dflt;}catch(e){url.value=dflt;}
  url.addEventListener('change',function(){try{localStorage.setItem('step0url',url.value.trim());}catch(e){}});
  document.getElementById('env').textContent='ページ: '+page+' ／ ホーム画面から: '+(standalone()?'はい':'いいえ')+' ／ 電波: '+(navigator.onLine?'あり':'なし');
  log('time '+new Date().toISOString());log('page '+page+' standalone '+standalone()+' online '+navigator.onLine);log('ua '+navigator.userAgent);
  var inApp=/\bLine\/|FBAN|FBAV|Instagram/.test(navigator.userAgent);
  if(inApp){log('inapp LINE などのアプリの中のブラウザです');var n=document.createElement('p'),l=document.createElement('a');n.className='warn';n.textContent='LINE などのアプリの中で開いています。下のリンクから Safari / Chrome で開いてください。 ';l.href=location.origin+location.pathname+'?openExternalBrowser=1';l.textContent='ブラウザで開く';n.appendChild(l);document.body.insertBefore(n,document.getElementById('env'));}
  document.addEventListener('securitypolicyviolation',function(e){log('CSP違反 '+e.violatedDirective+' '+e.blockedURI);});
  if('serviceWorker' in navigator){navigator.serviceWorker.register('sw.js').then(function(r){log('sw registered scope '+r.scope);return navigator.serviceWorker.ready;}).then(function(){log('sw ready controller '+(navigator.serviceWorker.controller?'yes':'no (次に開いたとき yes)'));}).catch(function(e){log('sw NG '+e.message);});}else log('sw なし');
  function db(){return new Promise(function(ok,ng){var q=indexedDB.open('step0',1);q.onupgradeneeded=function(){q.result.createObjectStore('rows',{autoIncrement:true});};q.onsuccess=function(){ok(q.result);};q.onerror=function(){ng(q.error);};});}
  document.getElementById('store').addEventListener('click',function(){
    var p=navigator.storage&&navigator.storage.persist?navigator.storage.persist():Promise.resolve('n/a');
    p.then(function(g){log('persist '+g);return navigator.storage&&navigator.storage.estimate?navigator.storage.estimate():null;})
     .then(function(est){if(est)log('usage '+est.usage+' quota '+est.quota);return db();})
     .then(function(d){return new Promise(function(ok,ng){var t=d.transaction('rows','readwrite'),s=t.objectStore('rows');s.add({at:Date.now(),standalone:standalone()});var all=s.getAll();t.oncomplete=function(){ok(all.result);};t.onerror=function(){ng(t.error);};});})
     .then(function(rows){log('indexedDB rows '+rows.length+' oldest '+new Date(rows[0].at).toISOString()+' (standalone '+rows[0].standalone+')');})
     .catch(function(e){log('store NG '+(e&&e.message||e));});
  });
  document.getElementById('call').addEventListener('click',function(){
    var u=url.value.trim();if(!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(u)){log('アドレスの形が違います');return;}
    var i=0,times=[];
    (function next(){if(i>=5){times.sort(function(a,b){return a-b;});log('call 5回 ms 中央 '+times[Math.floor(times.length/2)]+' 最小 '+times[0]+' 最大 '+times[times.length-1]+' 成功 '+times.length+'/5');return;}
      var t0=performance.now();i++;
      fetch(u,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({step0:1,n:i}),redirect:'follow',cache:'no-store'})
       .then(function(r){return r.text().then(function(t){return {status:r.status,final:r.url.split('?')[0],text:t};});})
       .then(function(r){var ms=Math.round(performance.now()-t0),ok=false;try{ok=JSON.parse(r.text).probe==='COSMO_STEP0';}catch(e){}
         log('call '+i+' '+(ok?'OK':'NG')+' '+ms+'ms status '+r.status+' via '+r.final);if(ok)times.push(ms);next();})
       .catch(function(e){log('call '+i+' NG '+Math.round(performance.now()-t0)+'ms '+(e&&e.message||e));next();});
    })();
  });
  document.getElementById('copy').addEventListener('click',function(){out.select();if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(out.value).then(function(){log('コピーしました');},function(){log('コピーできません。長押しで選んでください');});});
})();
