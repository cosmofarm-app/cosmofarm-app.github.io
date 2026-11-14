/* COSMO FARM phone check. Shows what this phone is, in large letters, for the leader to copy onto the survey sheet.
 * Sends nothing, stores nothing, registers no service worker. No names or IDs. */
(function(){
  'use strict';
  var ua=navigator.userAgent||'',rows=document.getElementById('rows');
  function row(ja,en,id,value,small){var tr1=document.createElement('tr'),th=document.createElement('th'),tr2=document.createElement('tr'),td=document.createElement('td');
    th.textContent=ja+' / '+en+' / '+id;td.textContent=value;if(small){var s=document.createElement('small');s.textContent=small;td.appendChild(s);}
    tr1.appendChild(th);tr2.appendChild(td);rows.appendChild(tr1);rows.appendChild(tr2);return td;}
  function num(v){var p=String(v||'').split(/[._]/).map(function(x){return parseInt(x,10);});return isNaN(p[0])?null:p[0]+(isNaN(p[1])?0:p[1]/100);}
  var isIOS=/iPhone|iPad|iPod/.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1),isAndroid=/Android/.test(ua);
  var inApp=/\bLine\//.test(ua)?'LINE':/FBAN|FBAV/.test(ua)?'Facebook':/Instagram/.test(ua)?'Instagram':/\bwv\)/.test(ua)?'WebView':'';
  var standalone=(window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||navigator.standalone===true;
  var os='?',osV=null,m;
  if(isIOS){m=ua.match(/OS (\d+[_\d]*) like Mac OS X/);os=m?m[1].replace(/_/g,'.'):'?';osV=num(os);}
  else if(isAndroid){m=ua.match(/Android (\d+(?:\.\d+)*)/);os=m?m[1]:'?';osV=num(os);}
  var br='?',brV=null;
  if(inApp){br=inApp;}
  else if((m=ua.match(/CriOS\/(\d+)/))){br='Chrome (iPhone)';brV=+m[1];}
  else if((m=ua.match(/EdgA?\/(\d+)/))){br='Edge';brV=+m[1];}
  else if((m=ua.match(/SamsungBrowser\/(\d+)/))){br='Samsung Internet';brV=+m[1];}
  else if((m=ua.match(/Firefox\/(\d+)|FxiOS\/(\d+)/))){br='Firefox';brV=+(m[1]||m[2]);}
  else if((m=ua.match(/Chrome\/(\d+)/))){br='Chrome';brV=+m[1];}
  else if(isIOS&&(m=ua.match(/Version\/(\d+(?:\.\d+)?)/))){br='Safari';brV=parseFloat(m[1]);}
  var sw=('serviceWorker' in navigator),idb=('indexedDB' in window);
  if(inApp){var w=document.getElementById('warn'),a=document.createElement('a');w.hidden=false;
    w.textContent=inApp+' の中で開いています。下を押して、Safari / Chrome で開いてください。 / Opened inside '+inApp+'. Tap below to open in Safari / Chrome. / Dibuka di dalam '+inApp+'. Tekan di bawah untuk membuka di Safari / Chrome. ';
    a.href=location.origin+location.pathname+'?openExternalBrowser=1';a.textContent='ブラウザで開く / Open in browser / Buka di browser';w.appendChild(document.createElement('br'));w.appendChild(a);}
  var tdType=row('スマホの種類','Phone type','Jenis HP',isIOS?'iPhone':isAndroid?'Android':'その他 / Other / Lainnya');
  var tdOs=row('OSの版','OS version','Versi OS',(isIOS?'iOS ':isAndroid?'Android ':'')+os,isAndroid?'確認中… / checking… / memeriksa…':'');
  var tdModel=row('機種','Model','Tipe',isIOS?'—':'?',isIOS?'iPhone は機種名を読めません。本人に聞いて書いてください。 / Ask the person. / Tanyakan ke orangnya.':'');
  row('ブラウザ','Browser','Browser',br+(brV?' '+brV:''));
  row('ホーム画面から開いた','Opened from home screen','Dibuka dari layar utama',standalone?'はい / Yes / Ya':'いいえ / No / Tidak');
  row('電波なしの仕組み','Offline support','Dukungan offline',sw?'○':'×');
  row('スマホの中の保存','Storage on phone','Penyimpanan di HP',idb?'○':'×');
  row('画面の大きさ','Screen size','Ukuran layar',screen.width+' × '+screen.height);
  var res=document.getElementById('result');
  function verdict(){var cls,ja,en,id,code;
    /* provisional limits (2026-11-14): iOS 16.4+, Android 9+ with Chrome 100+. To be fixed after the survey. */
    if(inApp){cls='mid';code='△';ja='ブラウザで開き直してください';en='Open again in the browser';id='Buka lagi di browser';}
    else if(!sw||!idb){cls='ng';code='×';ja='このブラウザでは使えません';en='This browser cannot be used';id='Browser ini tidak bisa dipakai';}
    else if((isIOS&&osV!==null&&osV<16.04)||(isAndroid&&osV!==null&&osV<9)||(!isIOS&&br==='Chrome'&&brV&&brV<100)){cls='mid';code='△';ja='版が古いかもしれません（リーダーに知らせる）';en='The version may be too old (tell your leader)';id='Versi mungkin terlalu lama (beri tahu leader)';}
    else if(!isIOS&&!isAndroid){cls='mid';code='△';ja='スマホで開いてください';en='Please open on a phone';id='Buka di HP';}
    else{cls='ok';code='○';ja='使えます';en='OK to use';id='Bisa dipakai';}
    res.className='result '+cls;res.textContent=code+' '+ja;var s=document.createElement('small');s.textContent=en+' / '+id;res.appendChild(s);}
  verdict();
  /* Chrome on Android blurs the version and the model in the plain user agent ("Android 10; K"). Ask for the real ones. */
  if(isAndroid&&navigator.userAgentData&&navigator.userAgentData.getHighEntropyValues){
    navigator.userAgentData.getHighEntropyValues(['platformVersion','model']).then(function(h){
      if(h.platformVersion){os=h.platformVersion.split('.')[0]==='0'?h.platformVersion:String(parseInt(h.platformVersion,10)||h.platformVersion);osV=num(h.platformVersion);tdOs.textContent='Android '+os;}
      else{tdOs.lastChild&&tdOs.removeChild(tdOs.lastChild);}
      tdModel.textContent=h.model||'?';verdict();
    },function(){tdOs.lastChild&&tdOs.removeChild(tdOs.lastChild);});
  }else if(isAndroid){var sm=tdOs.querySelector('small');if(sm)sm.textContent='この版は正しくないことがあります。設定の画面でも確かめてください。 / May be inaccurate; check Settings. / Mungkin tidak tepat; cek Pengaturan.';
    m=ua.match(/Android [^;]+; ([^)]+?)(?: Build|\))/);tdModel.textContent=m&&m[1]!=='K'?m[1]:'?';}
  document.getElementById('foot').textContent=ua;
})();
