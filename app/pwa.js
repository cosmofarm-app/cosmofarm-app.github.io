/* COSMO FARM PWA: the three rules agreed on 2026-11-14 (S000), and the service worker.
 * 1. Use it from the home screen. 2. On iPhone, add to the home screen BEFORE logging in (Safari and the home-screen app keep
 * separate storage). 3. Inside LINE (or another in-app browser) nothing can be kept: show how to open the real browser. */
(function(){
  'use strict';
  var ua=navigator.userAgent||'',isIOS=/iPhone|iPad|iPod/.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  var inApp=/\bLine\//.test(ua)?'LINE':/FBAN|FBAV/.test(ua)?'Facebook':/Instagram/.test(ua)?'Instagram':'';
  var standalone=(window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||navigator.standalone===true;
  var T={inApp:{ja:'{a} の中で開いています。下を押して、Safari / Chrome で開いてください。',en:'Opened inside {a}. Tap below to open in Safari / Chrome.',id:'Dibuka di dalam {a}. Tekan di bawah untuk membuka di Safari / Chrome.'},
    open:{ja:'ブラウザで開く',en:'Open in browser',id:'Buka di browser'},
    addIOS:{ja:'ログインの前に、下の共有ボタン →「ホーム画面に追加」をしてください。そのあと、ホーム画面のアイコンから開いてログインします。',en:'Before logging in: tap the Share button below, then "Add to Home Screen". Then open the app from the home screen icon and log in.',id:'Sebelum login: tekan tombol Bagikan di bawah, lalu "Tambahkan ke Layar Utama". Lalu buka dari ikon di layar utama dan login.'},
    addAnd:{ja:'メニュー（︙）→「ホーム画面に追加」をしてから、ホーム画面のアイコンから開いて使ってください。',en:'Menu (︙) → "Add to Home screen", then open the app from the home screen icon.',id:'Menu (︙) → "Tambahkan ke layar utama", lalu buka dari ikon di layar utama.'}};
  function lang(){var l=null;try{l=localStorage.getItem('cosmoV181Lang')||localStorage.getItem('COSMO_V2426_DISPLAY_LANGUAGE');}catch(e){}return ['ja','en','id'].indexOf(l)>=0?l:'ja';}
  function bar(){var b=document.getElementById('cfPwaBar');if(!b){b=document.createElement('div');b.id='cfPwaBar';b.className='cf-pwa-bar';b.setAttribute('role','status');document.body.insertBefore(b,document.body.firstChild);}return b;}
  function render(){var L=lang(),b;
    if(inApp){b=bar();b.textContent='';var p=document.createElement('p');p.textContent=T.inApp[L].replace('{a}',inApp);var a=document.createElement('a');a.href=location.origin+location.pathname+'?openExternalBrowser=1';a.textContent=T.open[L];a.className='cf-pwa-open';b.appendChild(p);b.appendChild(a);document.documentElement.classList.add('cf-inapp');return;}
    if(!standalone){b=bar();b.textContent='';var q=document.createElement('p');q.textContent=(isIOS?T.addIOS:T.addAnd)[L];b.appendChild(q);document.documentElement.classList.add('cf-browser');}
  }
  window.__cosmoPwaEnv={inApp:inApp,standalone:standalone,ios:isIOS,canKeep:!inApp&&(standalone||!isIOS)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render);else render();
  document.addEventListener('click',function(e){var t=e.target;if(t&&t.closest&&t.closest('.lang,[data-lang],#langs'))setTimeout(render,50);},true);
  if('serviceWorker' in navigator&&!inApp&&(location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1')){
    try{navigator.serviceWorker.register('sw.js').catch(function(){});}catch(e){}
  }
})();
