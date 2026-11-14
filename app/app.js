function cosmoV2449ResetClient_(doc,bridge,initial){
 'use strict';
 var langs=['ja','en','id'],lang=langs.includes(initial)?initial:'ja',state='intro',receipt=null,op=null,opLogin=null,busy=false;
 var enabled=bridge&&typeof bridge.request==='function'&&typeof bridge.complete==='function'&&typeof bridge.status==='function';
 var text={newRequest:['新しく再設定を申請する','Start a new reset request','Ajukan pengaturan ulang baru'],approvalHold:['本人確認と承認は完了しています。管理者が再設定手段の発行結果を確認して再開します。','Identity verification and approval are complete. An administrator will reconcile issuance and resume.','Verifikasi identitas dan persetujuan selesai. Pengelola akan memeriksa hasil penerbitan lalu melanjutkan.'],restart:['この再設定手段は利用できません。新しく申請し、管理者へ本人確認を依頼してください。','This reset method is no longer usable. Start a new request and ask an administrator to verify your identity.','Sarana pengaturan ulang ini tidak dapat digunakan. Ajukan permintaan baru dan minta pengelola memverifikasi identitas Anda.'],forgot:['パスワードを忘れた','Forgot password','Lupa kata sandi'],title:['パスワードの再設定','Reset password','Atur ulang kata sandi'],loginId:['ログインID','Login ID','ID login'],request:['再設定を申請する','Request a reset','Ajukan pengaturan ulang'],intro:['ログインIDを入力して申請してください。管理者が本人確認後に承認します。メールアドレスは不要です。','Enter your login ID to request a reset. A manager will verify your identity and approve it. No email address is required.','Masukkan ID login untuk mengajukan pengaturan ulang. Manajer akan memverifikasi identitas Anda lalu menyetujuinya. Alamat email tidak diperlukan.'],received:['申請を受け付けました。管理者へ本人確認を依頼してください。本人確認した端末で、本人専用の再設定手段を受け取ります。','Request received. Ask a manager to verify your identity. Receive your private reset method on the verified device.','Permintaan diterima. Minta manajer memverifikasi identitas Anda. Terima sarana pengaturan ulang pribadi pada perangkat yang diverifikasi.'],code:['本人専用の再設定コード','Your private reset code','Kode pengaturan ulang pribadi Anda'],newPassword:['新しいパスワード（8文字以上）','New password (at least 8 characters)','Kata sandi baru (minimal 8 karakter)'],confirm:['新しいパスワードをもう一度入力','Confirm new password','Konfirmasi kata sandi baru'],set:['新しいパスワードを設定','Set new password','Tetapkan kata sandi baru'],check:['申請状況を確認','Check request status','Periksa status permintaan'],waiting:['本人確認・管理者承認をお待ちください。','Await identity verification and administrator approval.','Tunggu verifikasi identitas dan persetujuan pengelola.'],ready:['承認済みです。本人専用のコードと新しいパスワードを入力してください。','Approved. Enter your private code and a new password.','Disetujui. Masukkan kode pribadi dan kata sandi baru.'],done:['再設定が完了しました。以前のセッションは無効です。新しいパスワードでログインしてください。','Password reset complete. Previous sessions are invalid. Log in with your new password.','Pengaturan ulang selesai. Sesi sebelumnya tidak berlaku. Masuk dengan kata sandi baru.'],invalid:['入力内容を確認してください。パスワードは8〜128文字で、確認欄と一致する必要があります。','Check your entries. The password must contain 8–128 characters and match the confirmation.','Periksa isian. Kata sandi harus terdiri dari 8–128 karakter dan cocok dengan konfirmasi.'],hold:['再設定の接続は準備中です。現在は申請・パスワードを送信できません。','Reset connection is being prepared. Requests and passwords cannot be sent yet.','Koneksi pengaturan ulang sedang disiapkan. Permintaan dan kata sandi belum dapat dikirim.'],uncertain:['処理結果を確認できません。申請状況を確認してください。新しいコードが必要な場合は管理者へ本人確認を依頼してください。','The result could not be confirmed. Check the request status. If a new code is needed, ask an administrator to verify your identity.','Hasil belum dapat dipastikan. Periksa status permintaan. Jika perlu kode baru, minta pengelola memverifikasi identitas Anda.'],back:['ログインに戻る','Back to login','Kembali ke halaman masuk'],reference:['申請番号','Request reference','Nomor permintaan']};
 function el(id){return doc.getElementById(id);}
 function t(k){return text[k][langs.indexOf(lang)];}
 function clearSecrets(){el('reset-code').value='';el('reset-password').value='';el('reset-confirm').value='';}
 function render(){doc.querySelectorAll('[data-reset-text]').forEach(function(n){n.textContent=t(n.getAttribute('data-reset-text'));});el('reset-status').textContent=t(!enabled?'hold':state);el('reset-reference').textContent=receipt?t('reference')+': '+receipt:'';el('reset-complete-form').hidden=!receipt||!['ready','invalid'].includes(state);el('reset-new').hidden=!receipt;el('reset-check').hidden=!receipt||state==='done';['reset-request-submit','reset-complete-submit','reset-check'].forEach(function(id){el(id).disabled=!enabled||busy;});el('reset-panel').setAttribute('aria-busy',String(busy));}
 function opId(){var bytes=new Uint8Array(16);doc.defaultView.crypto.getRandomValues(bytes);return Array.from(bytes,function(b){return b.toString(16).padStart(2,'0');}).join('');}
 function restart(){state='intro';receipt=null;op=null;opLogin=null;clearSecrets();}
 el('reset-new').addEventListener('click',function(){if(busy)return;restart();render();el('reset-login-id').focus();});
 el('login-forgot').addEventListener('click',function(){if(state==='done')restart();el('reset-panel').hidden=false;el('login-form').hidden=true;el('reset-login-id').value=el('login-worker').value;render();el('reset-login-id').focus();});
 el('reset-back').addEventListener('click',function(){if(busy)return;clearSecrets();el('reset-panel').hidden=true;el('login-form').hidden=false;el('login-password').value='';el('login-worker').focus();});
 el('reset-request-form').addEventListener('submit',async function(e){e.preventDefault();if(!enabled||busy)return;var name=el('reset-login-id').value;if(!/^[A-Za-z]{3,24}$/.test(name)){state='invalid';render();return;}if(opLogin!==name.toLowerCase()){op=opId();opLogin=name.toLowerCase();receipt=null;}busy=true;render();try{var r=await bridge.request({loginId:name,operationId:op});if(r&&r.status==='REQUEST_RECEIVED'&&/^SYNTH-RESET-[a-f0-9]{32}$/.test(r.requestId)){receipt=r.requestId;state='received';}else state='uncertain';}catch(err){state='uncertain';}finally{busy=false;render();}});
 el('reset-check').addEventListener('click',async function(){if(!enabled||busy||!receipt)return;busy=true;render();try{var r=await bridge.status({requestId:receipt});state=r&&r.status==='COMPLETED_RELOGIN_REQUIRED'?'done':r&&r.status==='AWAITING_EMPLOYEE_PASSWORD'?'ready':r&&r.status==='PENDING_PERSON_VERIFICATION'?'waiting':r&&r.status==='APPROVAL_RECONCILIATION_REQUIRED'?'approvalHold':r&&r.status==='RESTART_REQUIRED'?'restart':'uncertain';if(state==='done')clearSecrets();}catch(err){state='uncertain';}finally{busy=false;render();}});
 el('reset-complete-form').addEventListener('submit',async function(e){e.preventDefault();if(!enabled||busy||!receipt)return;var password=el('reset-password').value,token=el('reset-code').value;if(!/^[A-Za-z0-9_-]{43}$/.test(token)||Array.from(password).length<8||Array.from(password).length>128||password!==el('reset-confirm').value){state='invalid';clearSecrets();render();return;}busy=true;render();try{var r=await bridge.complete({requestId:receipt,token:token,password:password});state=r&&r.status==='PASS_ISOLATED_PASSWORD_SET'&&r.loginRequired===true?'done':'uncertain';}catch(err){state='uncertain';}finally{password=null;token=null;clearSecrets();busy=false;render();}});
 var trialViews={},trialViewKey=null;
 function switchTrialContext(key,clearAll){
  if(!bridge||bridge.trialOnly!==true||busy||typeof key!=='string'||key.length>80)return false;
  if(clearAll)trialViews={};else if(trialViewKey)trialViews[trialViewKey]={state:state,receipt:receipt,op:op,opLogin:opLogin};
  restart();var previous=trialViews[key];if(previous){state=previous.state;receipt=previous.receipt;op=previous.op;opLogin=previous.opLogin;}
  trialViewKey=key;el('reset-panel').hidden=true;el('login-form').hidden=false;render();return true;
 }
 render();return Object.freeze({setLanguage:function(value){if(langs.includes(value))lang=value;render();},switchTrialContext:switchTrialContext});
};

var URL_='https://script.google.com/macros/s/AKfycbyb1aJ8iEJ2di0o3b7YS5Iw91Wd-adwNq3t27MsL6BtjhxxWVK4-reXlZSymLfipBKX/exec',SCREENS=[{"screen":"V156_ATTENDANCE","icon":"🕘","ja":"出退勤","en":"Attendance","id":"Absensi","s":{"ja":"出退勤","en":"Clock","id":"Absen"}},{"screen":"V159_WORK","icon":"🧑‍🌾","ja":"作業記録","en":"Work records","id":"Catatan kerja","s":{"ja":"作業","en":"Work","id":"Kerja"}},{"screen":"V161_HARVEST","icon":"🌸","ja":"収穫・選別・出荷","en":"Harvest · sorting · shipping","id":"Panen · sortir · kirim","s":{"ja":"収穫","en":"Harvest","id":"Panen"}},{"screen":"V160_MATERIAL","icon":"🧪","ja":"農薬・資材","en":"Pesticides · materials","id":"Pestisida · bahan","s":{"ja":"農薬","en":"Spray","id":"Obat"}},{"screen":"V157_CULTIVATION","icon":"🌱","ja":"栽培ロット","en":"Cultivation lots","id":"Lot tanam","s":{"ja":"栽培","en":"Lots","id":"Lot"}},{"screen":"V162_REPORT","icon":"📋","ja":"ひと目・報告","en":"At a glance · reports","id":"Sekilas · laporan","s":{"ja":"報告","en":"Report","id":"Laporan"}},{"screen":"V171_BOARD","icon":"🖥","ja":"据え置き画面（アンドン）","en":"Workplace screen (andon)","id":"Layar tempat kerja (andon)","s":{"ja":"アンドン","en":"Andon","id":"Andon"}}],KEYS={"store":"cosmoV181Keep","id":"cosmoV181LastId","shell":["V156_ATTENDANCE","V157_CULTIVATION","V159_WORK","V160_MATERIAL","V161_HARVEST","V162_REPORT","V171_BOARD"]},LANG='ja',TOKEN=null,ME=null,BUSY=false,MSG='';
var T={ja:{loginT:'ログイン',id:'ログインID（ローマ字の名前）',pw:'パスワード',keep:'このスマホでログインしたままにする（自分のスマホだけ）',loginB:'ログイン',logout:'ログアウト',hello:'{n} さん、おつかれさまです',loginId:'ログインID（ローマ字の名前）',menuT:'画面をえらぶ',
 checking:'ログイン中…',loginBusy:'ただいま混み合っています。少し待ってから、もう一度押してください。',fail:'ログインできませんでした。IDとパスワードを確かめてください。',comm:'通信できませんでした。電波のよい所でもう一度押してください。',
 instT:'📲 ホーム画面に置く（アプリのように使う）',installed:'✔ ホーム画面から開いています',
 line:'LINE の中の画面では追加できません。右上（または右下）の「…」から「ブラウザで開く」を押してから行ってください。',
 i1:'Safari でこの画面を開く',i2:'下の［共有］ボタン（□に↑）を押す',i3:'「ホーム画面に追加」を押す',i4:'右上の「追加」を押す',
 a1:'Chrome でこの画面を開く',a2:'右上の［⋮］を押す',a3:'「ホーム画面に追加」（または「アプリをインストール」）→「追加」',
 after:'ホーム画面の「COSMO FARM」から開くと、全画面で使えます。「ログインしたままにする」を選ぶと、ログインは最長12時間（8時間使わないと切れます）。選ばないときは、8時間または30分使わないと切れます。'},
 en:{loginT:'Log in',id:'Login ID (your name in romaji)',pw:'Password',keep:'Stay logged in on this phone (own phone only)',loginB:'Log in',logout:'Log out',hello:'Hello, {n}',loginId:'Login ID (your name in romaji)',menuT:'Choose a screen',
 checking:'Logging in…',loginBusy:'The server is busy. Wait a moment and press again.',fail:'Could not log in. Check your ID and password.',comm:'No connection. Try again where the signal is good.',
 instT:'📲 Put it on the home screen (use it like an app)',installed:'✔ Opened from the home screen',
 line:'You cannot add it from inside LINE. Tap "…" (top or bottom right) and choose "Open in browser" first.',
 i1:'Open this screen in Safari',i2:'Tap the Share button (square with ↑) at the bottom',i3:'Tap "Add to Home Screen"',i4:'Tap "Add" at the top right',
 a1:'Open this screen in Chrome',a2:'Tap ⋮ at the top right',a3:'"Add to Home screen" (or "Install app") → "Add"',
 after:'Open "COSMO FARM" from the home screen to use it full screen. With "Stay logged in", a login lasts up to 12 hours (it ends after 8 hours without use). Without it, a login ends after 8 hours, or after 30 minutes without use.'},
 id:{loginT:'Masuk',id:'ID login (nama dalam huruf latin)',pw:'Kata sandi',keep:'Tetap masuk di HP ini (HP sendiri saja)',loginB:'Masuk',logout:'Keluar',hello:'Halo, {n}',loginId:'ID login (nama dalam huruf latin)',menuT:'Pilih layar',
 checking:'Sedang masuk…',loginBusy:'Server sedang sibuk. Tunggu sebentar lalu tekan lagi.',fail:'Tidak bisa masuk. Periksa ID dan kata sandi.',comm:'Tidak ada koneksi. Coba lagi di tempat sinyal bagus.',
 instT:'📲 Taruh di layar utama (pakai seperti aplikasi)',installed:'✔ Dibuka dari layar utama',
 line:'Tidak bisa ditambahkan dari dalam LINE. Tekan "…" (kanan atas atau kanan bawah) lalu pilih "Buka di browser" dulu.',
 i1:'Buka layar ini di Safari',i2:'Tekan tombol Bagikan (kotak dengan ↑) di bawah',i3:'Tekan "Tambahkan ke Layar Utama"',i4:'Tekan "Tambah" di kanan atas',
 a1:'Buka layar ini di Chrome',a2:'Tekan ⋮ di kanan atas',a3:'"Tambahkan ke layar utama" (atau "Instal aplikasi") → "Tambah"',
 after:'Buka "COSMO FARM" dari layar utama supaya tampil penuh. Dengan "Tetap masuk", login berlaku sampai 12 jam (berakhir jika 8 jam tidak dipakai). Tanpa itu, login berakhir setelah 8 jam, atau 30 menit tidak dipakai.'}};
Object.assign(T.ja,{tdT:'✅ 今やること',tdNone:'今やることはありません',tdUpd:'更新中…',tdOpenBy:'{h} を {t} までに開ける',tdNotOpen:'{h} がまだ開いていません（期限 {t}）',tdCloseLate:'{h} の閉める期限 {t} を過ぎています',tdCloseSoon:'{h} を {t} までに閉める',tdHoldOpen:'{h} は閉めたままの日ですが開いています',tdJob:'続き：{w}　{f}　{d}/{n}{u}',tdJobMore:'続きの作業 ほか {n}件',tdAndon:'🚨 アンドン {n}件',tdAndonLate:'（10分以上 {n}件）',hoSumOpen:'開ける期限 {t}',hoSumClose:'閉める期限 {t}',hoSumDone:'今日は完了',hoHoldS:'⛔閉めたまま',hoBy:'{t} {n}',wxPopDay:'（1日 {p}%）',wxSrcT:'気象庁の予報',wxIssued:'{t} 発表',wxD0:'今日',wxD1:'明日',wxD2:'あさって',wxPopLeg:'☔ 降水確率は 6時間ごと（0-6・6-12・12-18・18-24時）',wxRain:'☔ 雨',wxWind:'💨 強風',wxCold:'🌡 低温',
 wxMore:'くわしく見る（6時間ごと・週間・過去7日）',wxSun:'日の出 {a}　日の入 {b}',wxSlots:'6時間ごとの降水確率（%）',wxWeek:'週間予報',wxPast:'過去7日（記録）',wxPastNone:'記録がまだありません',wxLoading:'天気を読み込んでいます…',wxFail:'天気を取れませんでした（{c}）。少しあとでもう一度開いてください。',
 wxOrig:'気象庁の文',wxDay:'日',wxSky:'天気',wxHL:'最高／最低',wxPopS:'降水',wxWindS:'風',wxSrcL:'出典：気象庁のページ',wxDays:['日','月','火','水','木','金','土'],
 hoT:'🏠 ハウスの開け閉め',hoTimes:'開ける {o}・閉める {c}',hoNotOnDuty:'出勤を押すと使えます（出退勤の画面）。',hoSt_OPEN:'🟢開',hoSt_CLOSED:'⚪閉',hoSt_NONE:'記録なし',hoSumNone:'記録なし {n}棟',hoHold:'今日は閉めたまま',
 HR_RAIN:'雨',HR_WIND:'強風',HR_COLD:'低温',HR_OTHER:'その他',hoDue_OPEN:'開ける期限 {t}',hoDue_CLOSE:'閉める期限 {t}',hoLeft:'（あと{m}）',hoLate:'（{m} 過ぎ）',hoH:'時間',hoMin:'分',hoOpen:'開けた',hoClose:'閉めた',
 hoSaved:'✔ 記録しました',hoSame:'すでにその状態でしたが、記録しました。',hoHoldOpened:'今日は閉めたままの日です。管理者に知らせました。',
 AL_NOT_OPEN:'🟡 期限までに開いていません',AL_NOT_CLOSED:'🔴 期限を過ぎても閉まっていません',AL_OPENED_ON_HOLD:'🟡 閉めたままの日に開けられました',
 plT:'⛔ 閉めたままにするか決める（管理者）',plHouses:'ハウス',plWhy:'理由',plWhyText:'説明（「その他」のときは必ず書く）',plHold:'⛔閉めたまま',plOpen:'開ける日に戻す',plNow:'この日の予定：{x}',plNone:'全部 開ける日',
 plHint:'天気から：{r}',plSaved:'✔ 予定を保存しました',plPick:'ハウスを1つ以上えらんでください。',plWhyNeed:'理由をえらんでください。',plOtherNeed:'「その他」のときは説明を書いてください。',
 hoDetail:'押し間違いの取消と写真は「作業」の画面でできます。',wait:'保存しています…',failed:'うまくいきませんでした（{c}）',
 E_V179_NOT_ON_DUTY:'出勤中の人だけが押せます。先に出退勤の画面で「出勤」を押してください。',E_V179_DIRECTOR_REQUIRED:'管理者だけが決められます。',E_V179_VIEWER:'見るだけの人は押せません。',E_V179_REASON:'理由をえらんでください。',
 E_V179_REASON_OTHER_TEXT:'「その他」のときは説明を書いてください。',E_V179_HOUSE:'そのハウスは記録の対象ではありません。',busy:'ほかの人が保存中でした。もう一度押してください。'});
Object.assign(T.en,{tdT:'✅ To do now',tdNone:'Nothing to do now',tdUpd:'Updating…',tdOpenBy:'Open {h} by {t}',tdNotOpen:'{h} is not open yet (deadline {t})',tdCloseLate:'{h} is past the closing deadline {t}',tdCloseSoon:'Close {h} by {t}',tdHoldOpen:'{h} is open on a keep-closed day',tdJob:'Continue: {w}　{f}　{d}/{n}{u}',tdJobMore:'{n} more jobs to continue',tdAndon:'🚨 Andon {n}',tdAndonLate:' ({n} over 10 min)',hoSumOpen:'Open by {t}',hoSumClose:'Close by {t}',hoSumDone:'Done for today',hoHoldS:'⛔Keep closed',hoBy:'{t} {n}',wxPopDay:'(day {p}%)',wxSrcT:'JMA forecast',wxIssued:'issued {t}',wxD0:'Today',wxD1:'Tomorrow',wxD2:'Day after',wxPopLeg:'☔ Chance of rain every 6 hours (0-6, 6-12, 12-18, 18-24 h)',wxRain:'☔ Rain',wxWind:'💨 Strong wind',wxCold:'🌡 Low temp.',
 wxMore:'Show details (6-hour, week, past 7 days)',wxSun:'Sunrise {a}　Sunset {b}',wxSlots:'Chance of rain every 6 hours (%)',wxWeek:'Weekly forecast',wxPast:'Past 7 days (records)',wxPastNone:'No records yet',wxLoading:'Loading the weather…',wxFail:'Could not get the weather ({c}). Open it again a little later.',
 wxOrig:'JMA text',wxDay:'Day',wxSky:'Weather',wxHL:'High / Low',wxPopS:'Rain',wxWindS:'Wind',wxSrcL:'Source: JMA page',wxDays:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
 hoT:'🏠 Greenhouse open / close',hoTimes:'Open {o} · Close {c}',hoNotOnDuty:'Clock in first to use this (attendance screen).',hoSt_OPEN:'🟢Open',hoSt_CLOSED:'⚪Closed',hoSt_NONE:'No record',hoSumNone:'No record: {n}',hoHold:'Keep closed today',
 HR_RAIN:'Rain',HR_WIND:'Strong wind',HR_COLD:'Low temperature',HR_OTHER:'Other',hoDue_OPEN:'Open by {t}',hoDue_CLOSE:'Close by {t}',hoLeft:' ({m} left)',hoLate:' ({m} late)',hoH:'h ',hoMin:'min',hoOpen:'Opened',hoClose:'Closed',
 hoSaved:'✔ Recorded',hoSame:'It was already in that state; recorded anyway.',hoHoldOpened:'Today is a keep-closed day. The managers were told.',
 AL_NOT_OPEN:'🟡 Not opened by the deadline',AL_NOT_CLOSED:'🔴 Still open after the deadline',AL_OPENED_ON_HOLD:'🟡 Opened on a keep-closed day',
 plT:'⛔ Decide whether to keep closed (managers)',plHouses:'Greenhouses',plWhy:'Reason',plWhyText:'Explanation (required for "Other")',plHold:'⛔Keep closed',plOpen:'Back to open',plNow:'Plan for this day: {x}',plNone:'all open',
 plHint:'From the weather: {r}',plSaved:'✔ Plan saved',plPick:'Choose at least one greenhouse.',plWhyNeed:'Choose the reason.',plOtherNeed:'Write an explanation for "Other".',
 hoDetail:'Cancel a wrong press or add a photo on the "Work" screen.',wait:'Saving…',failed:'Did not work ({c})',
 E_V179_NOT_ON_DUTY:'Only people who are clocked in can press. Clock in on the attendance screen first.',E_V179_DIRECTOR_REQUIRED:'Only managers can decide this.',E_V179_VIEWER:'View-only users cannot press.',E_V179_REASON:'Choose the reason.',
 E_V179_REASON_OTHER_TEXT:'Write an explanation for "Other".',E_V179_HOUSE:'That greenhouse is not on the list.',busy:'Someone else was saving. Press again.'});
Object.assign(T.id,{tdT:'✅ Kerjakan sekarang',tdNone:'Tidak ada yang perlu dikerjakan',tdUpd:'Memperbarui…',tdOpenBy:'Buka {h} sebelum {t}',tdNotOpen:'{h} belum dibuka (batas {t})',tdCloseLate:'{h} lewat batas tutup {t}',tdCloseSoon:'Tutup {h} sebelum {t}',tdHoldOpen:'{h} terbuka pada hari tetap tertutup',tdJob:'Lanjut: {w}　{f}　{d}/{n}{u}',tdJobMore:'{n} pekerjaan lain untuk dilanjutkan',tdAndon:'🚨 Andon {n}',tdAndonLate:' ({n} lebih 10 mnt)',hoSumOpen:'Buka sebelum {t}',hoSumClose:'Tutup sebelum {t}',hoSumDone:'Selesai hari ini',hoHoldS:'⛔Tetap tutup',hoBy:'{t} {n}',wxPopDay:'(sehari {p}%)',wxSrcT:'Prakiraan JMA',wxIssued:'terbit {t}',wxD0:'Hari ini',wxD1:'Besok',wxD2:'Lusa',wxPopLeg:'☔ Peluang hujan tiap 6 jam (0-6, 6-12, 12-18, 18-24)',wxRain:'☔ Hujan',wxWind:'💨 Angin kencang',wxCold:'🌡 Suhu rendah',
 wxMore:'Lihat detail (6 jam, mingguan, 7 hari lalu)',wxSun:'Matahari terbit {a}　terbenam {b}',wxSlots:'Peluang hujan tiap 6 jam (%)',wxWeek:'Prakiraan mingguan',wxPast:'7 hari lalu (catatan)',wxPastNone:'Belum ada catatan',wxLoading:'Memuat cuaca…',wxFail:'Cuaca tidak bisa diambil ({c}). Buka lagi sebentar lagi.',
 wxOrig:'Teks JMA',wxDay:'Hari',wxSky:'Cuaca',wxHL:'Maks / Min',wxPopS:'Hujan',wxWindS:'Angin',wxSrcL:'Sumber: halaman JMA',wxDays:['Min','Sen','Sel','Rab','Kam','Jum','Sab'],
 hoT:'🏠 Buka / tutup rumah kaca',hoTimes:'Buka {o} · Tutup {c}',hoNotOnDuty:'Tekan masuk kerja dulu (layar absensi).',hoSt_OPEN:'🟢Buka',hoSt_CLOSED:'⚪Tutup',hoSt_NONE:'Belum ada catatan',hoSumNone:'Belum ada catatan: {n}',hoHold:'Hari ini tetap tertutup',
 HR_RAIN:'Hujan',HR_WIND:'Angin kencang',HR_COLD:'Suhu rendah',HR_OTHER:'Lainnya',hoDue_OPEN:'Buka sebelum {t}',hoDue_CLOSE:'Tutup sebelum {t}',hoLeft:' (sisa {m})',hoLate:' (terlambat {m})',hoH:' jam ',hoMin:' mnt',hoOpen:'Sudah dibuka',hoClose:'Sudah ditutup',
 hoSaved:'✔ Tercatat',hoSame:'Sudah dalam keadaan itu; tetap dicatat.',hoHoldOpened:'Hari ini harus tetap tertutup. Admin sudah diberi tahu.',
 AL_NOT_OPEN:'🟡 Belum dibuka sampai batas waktu',AL_NOT_CLOSED:'🔴 Masih terbuka setelah batas waktu',AL_OPENED_ON_HOLD:'🟡 Dibuka pada hari tetap tertutup',
 plT:'⛔ Putuskan tetap tertutup atau tidak (admin)',plHouses:'Rumah kaca',plWhy:'Alasan',plWhyText:'Penjelasan (wajib untuk "Lainnya")',plHold:'⛔Tetap tutup',plOpen:'Kembali buka',plNow:'Rencana hari itu: {x}',plNone:'semua buka',
 plHint:'Dari cuaca: {r}',plSaved:'✔ Rencana tersimpan',plPick:'Pilih minimal satu rumah kaca.',plWhyNeed:'Pilih alasannya.',plOtherNeed:'Tulis penjelasan untuk "Lainnya".',
 hoDetail:'Batalkan salah tekan atau tambah foto di layar "Kerja".',wait:'Menyimpan…',failed:'Tidak berhasil ({c})',
 E_V179_NOT_ON_DUTY:'Hanya yang sudah masuk kerja yang bisa menekan. Tekan masuk kerja di layar absensi dulu.',E_V179_DIRECTOR_REQUIRED:'Hanya admin yang bisa memutuskan.',E_V179_VIEWER:'Pengguna lihat-saja tidak bisa menekan.',E_V179_REASON:'Pilih alasannya.',
 E_V179_REASON_OTHER_TEXT:'Tulis penjelasan untuk "Lainnya".',E_V179_HOUSE:'Rumah kaca itu tidak ada di daftar.',busy:'Ada orang lain yang sedang menyimpan. Tekan lagi.'});
var WX=null,WXH=null,WX_BUSY=false,HO=null,HO_SKEW=0,HO_BUSY=false,PL_DAY=0;
function el(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined&&txt!==null)e.textContent=txt;return e;}
function nv(v,u){return v===null||v===undefined?'—':String(v)+(u||'');}
function jst(ms){return new Date(ms+32400000);}
function today(){return jst(Date.now()+HO_SKEW).toISOString().slice(0,10);}
function shift(d,n){return new Date(Date.parse(d+'T00:00:00Z')+n*86400000).toISOString().slice(0,10);}
function hm(ms){var d=jst(ms);return String(d.getUTCHours()).padStart(2,'0')+':'+String(d.getUTCMinutes()).padStart(2,'0');}
function md(d){var x=new Date(Date.parse(d+'T00:00:00Z'));return (x.getUTCMonth()+1)+'/'+x.getUTCDate()+(LANG==='ja'?'（'+t('wxDays')[x.getUTCDay()]+'）':' ('+t('wxDays')[x.getUTCDay()]+')');}
function dayName(d){var n=Math.round((Date.parse(d+'T00:00:00Z')-Date.parse(today()+'T00:00:00Z'))/86400000);return n>=0&&n<=2?t('wxD'+n):'';}
function sky(x){return LANG==='en'?x.en:LANG==='id'?x.id:x.ja;}
function uuid(){var a=new Uint8Array(16);crypto.getRandomValues(a);var h=Array.from(a,function(b){return b.toString(16).padStart(2,'0');}).join('');return h.slice(0,8)+'-'+h.slice(8,12)+'-'+h.slice(12,16)+'-'+h.slice(16,20)+'-'+h.slice(20);}
function why(r){if(!r)return null;var m=/^\[([A-Z_]+)\]\s*(.*)$/.exec(r);return m?t('HR_'+m[1])+(m[2]?' '+m[2]:''):r;}
function popsEl(p,rainPct,day){var w=el('span','pops','☔ ');(p||[]).forEach(function(v,i){if(i)w.appendChild(document.createTextNode('・'));var s=el('span','p'+(v!==null&&v>=rainPct?' wet':''),v===null?'—':String(v));w.appendChild(s);});w.appendChild(document.createTextNode('%'));if(day!==null&&day!==undefined&&(p||[]).every(function(v){return v===null;})){w.appendChild(document.createTextNode(' '));w.appendChild(el('span','p'+(day>=rainPct?' wet':''),t('wxPopDay').replace('{p}',day)));}return w;}
function wxAlerts(d){var a=[];if(d.alerts.rain)a.push(['c-rain','wxRain','RAIN']);if(d.alerts.wind)a.push(['c-wind','wxWind','WIND']);if(d.alerts.cold)a.push(['c-cold','wxCold','COLD']);return a;}
function wxRender(){var box=$('wxBox');box.classList.toggle('hidden',!TOKEN);if(!TOKEN)return;var rows=$('wxRows');rows.innerHTML='';
 if(!WX){$('wxArea').textContent='🌤';$('wxSrc').textContent='';$('wxMsg').textContent=WX_BUSY?t('wxLoading'):'';return;}
 if(WX.status!=='PASS_HOME_WX'){$('wxArea').textContent='🌤';$('wxSrc').textContent='';$('wxMsg').textContent=t('wxFail').replace('{c}',WX.code||WX.status||'');return;}
 $('wxMsg').textContent='';$('wxArea').textContent='🌤 '+(WX.area||'')+(WX.temperatureArea?'（'+WX.temperatureArea+'）':'');
 var ia=typeof WX.issuedAt==='number'?WX.issuedAt:Date.parse(WX.issuedAt||'');if(!isFinite(ia))ia=null;$('wxSrc').textContent=t('wxSrcT')+(ia?'　'+t('wxIssued').replace('{t}',md(jst(ia).toISOString().slice(0,10)).replace(/（.*）|\s\(.*\)/,'')+' '+hm(ia)):'');
 WX.days.forEach(function(d){var al=wxAlerts(d),r=el('div','wxRow'+(al.length?' warn':''));r.id='wx_'+d.date;
  var l1=el('div','wxLine');l1.appendChild(el('span','wxL',dayName(d.date)));l1.appendChild(el('span','note',md(d.date)));
  var sk=el('span');sk.appendChild(el('span','wxIc',d.icons));sk.appendChild(document.createTextNode(' '+sky(d)));l1.appendChild(sk);
  var tp=el('span');tp.appendChild(el('span','tmax',nv(d.max,'℃')));tp.appendChild(document.createTextNode(' / '));tp.appendChild(el('span','tmin'+(d.alerts.cold?' cold':''),nv(d.min,'℃')));l1.appendChild(tp);r.appendChild(l1);
  var l2=el('div','wxLine');l2.appendChild(popsEl(d.pops,WX.rainPct,d.popDay));l2.appendChild(el('span','wind'+(d.wind.strong?' strong':''),'💨 '+(d.wind[LANG]||d.wind.ja)));r.appendChild(l2);
  if(al.length){var c=el('div');al.forEach(function(a){c.appendChild(el('span','chip '+a[0],t(a[1])));});r.appendChild(c);}rows.appendChild(r);});
 if($('wxMore').open)wxMoreRender();}
function tb(head,rows){var tbl=el('table','tb'),tr=el('tr');head.forEach(function(h){tr.appendChild(el('th',null,h));});tbl.appendChild(tr);
 rows.forEach(function(r){var x=el('tr');r.forEach(function(c,i){var td=el('td',i===1?'l':null);if(c&&typeof c==='object'){td.textContent=c.v;if(c.wet)td.className='wet';}else td.textContent=c;x.appendChild(td);});tbl.appendChild(x);});return tbl;}
function wxMoreRender(){var b=$('wxMoreBody');b.innerHTML='';if(!WX||WX.status!=='PASS_HOME_WX')return;var P=WX.rainPct;
 if(WX.solar&&WX.solar.sunrise)b.appendChild(el('div','note',t('wxSun').replace('{a}',hm(WX.solar.sunrise*1000)).replace('{b}',hm(WX.solar.sunset*1000))));
 b.appendChild(el('b',null,t('wxSlots')));
 b.appendChild(tb([t('wxDay'),'0-6','6-12','12-18','18-24'],WX.days.map(function(d){return [dayName(d.date)+' '+md(d.date).replace(/（.*）|\s\(.*\)/,'')].concat(d.pops.map(function(v){return {v:v===null?'—':v,wet:v!==null&&v>=P};}));})));
 b.appendChild(tb([t('wxDay'),t('wxOrig'),t('wxWindS')],WX.days.map(function(d){return [dayName(d.date),d.text||'—',d.wind.ja];})));
 if(WX.weekly&&WX.weekly.length){b.appendChild(el('b',null,t('wxWeek')));b.appendChild(tb([t('wxDay'),t('wxSky'),t('wxHL'),t('wxPopS')],WX.weekly.map(function(w){return [md(w.date),w.icons+' '+sky(w),nv(w.max,'℃')+' / '+nv(w.min,'℃'),{v:nv(w.pop,'%'),wet:w.pop!==null&&w.pop>=P}];})));}
 b.appendChild(el('b',null,t('wxPast')));
 if(!WXH){b.appendChild(el('div','note',t('wxLoading')));}else if(WXH.status!=='PASS_HOME_WX_HISTORY'){b.appendChild(el('div','note',t('wxFail').replace('{c}',WXH.code||'')));}
 else{var ds=WXH.days.filter(function(d){return d.covered;});if(!ds.length)b.appendChild(el('div','note',t('wxPastNone')));
  else b.appendChild(tb([t('wxDay'),t('wxSky'),t('wxHL'),'0-6・6-12・12-18・18-24'],ds.slice().reverse().map(function(d){return [md(d.date),d.icons+' '+sky(d),nv(d.max,'℃')+' / '+nv(d.min,'℃'),d.pops.map(function(v){return v===null?'—':v;}).join('・')];})));}
 if(WX.sourceUrl){var a=el('a',null,t('wxSrcL'));a.href=WX.sourceUrl;a.target='_blank';a.rel='noopener';a.className='note';b.appendChild(a);}}
async function wxLoad(){if(!TOKEN||WX_BUSY)return;WX_BUSY=true;wxRender();try{var r=await rpc('cosmoV181WxRpc','HM_WX',{token:TOKEN});if(!(r&&r.code==='LOGIN_BUSY'&&WX))WX=r;}catch(e){WX={status:'HOLD',code:'COMM'};}finally{WX_BUSY=false;}wxRender();hoRender();}
async function wxHist(){if(!TOKEN||WXH)return;try{WXH=await rpc('cosmoV181WxRpc','HM_WX_HIST',{token:TOKEN});}catch(e){WXH={status:'HOLD',code:'COMM'};}wxMoreRender();}
function hoName(h){return LANG==='en'?h.nameEn:LANG==='id'?h.nameId:h.name;}
function hoDur(ms){var m=Math.max(0,Math.round(Math.abs(ms)/60000));return (m>=60?Math.floor(m/60)+t('hoH'):'')+(m%60)+t('hoMin');}
function hoMsg(x,cls){var m=$('hoMsg');m.textContent=x||'';m.className='msg '+(cls||'');}
function explain(r){if(!r)return t('failed').replace('{c}','');var c=r.code||r.status||'';if(T.ja['E_'+c])return t('E_'+c);if(c==='V162_LOCK_BUSY'||c==='V162_STATE_CHANGED')return t('busy');return t('failed').replace('{c}',c);}
async function hoLoad(){if(!TOKEN)return;try{var r=await rpc('cosmoV179Rpc','HO_BOOT',{token:TOKEN});if(r&&r.status==='PASS_HOUSE'){HO=r;HO_SKEW=Date.parse(r.now)-Date.now();try{var c=JSON.parse(localStorage.getItem(CK)||'null');if(c&&c.r){c.r.ho=r;c.at=Date.now();localStorage.setItem(CK,JSON.stringify(c));}}catch(e){}}else if(r&&r.code==='LOGIN_OR_SESSION_UNAVAILABLE'){await lost();return;}else if(!(r&&r.code==='LOGIN_BUSY'))HO=null;}catch(e){}hoRender();}
/* 2026-11-11 S000「ログインしたままなのにログイン画面に戻る」: the server used to answer LOGIN_OR_SESSION_UNAVAILABLE also when its login lock was
 * only busy (many screens at once); now it says LOGIN_BUSY, which never logs out. A login counts as lost only when SESSION says
 * LOGIN_OR_SESSION_UNAVAILABLE twice (1.5 s apart). */
var LOST_P=null;
function lost(){if(LOST_P)return LOST_P;var tk=TOKEN;LOST_P=(async function(){if(!tk)return true;for(var i=0;i<2;i++){if(i)await new Promise(function(z){setTimeout(z,1500);});if(TOKEN!==tk)return false;
  try{var s=await rpc('cosmoV155Rpc','SESSION',{token:tk});if(s&&(s.status==='PASS_ISOLATED_SESSION'||s.code==='LOGIN_BUSY'))return false;}catch(e){return false;}}
  if(TOKEN!==tk)return false;TOKEN=null;ME=null;HO=null;WX=null;WXH=null;JB=null;AN=null;MSG='';rm();dropCache();shellReset();render();return true;})();
 LOST_P.then(function(){LOST_P=null;},function(){LOST_P=null;});return LOST_P;}
/* Home in one call + last content first (S000 2026-11-11 反応速度). The cache is per login, kept 36 hours, removed at logout. */
var JB=null,AN=null,FIELDS={},UNITS={},HOME_FRESH=false,HOME_BUSY=false,CK='cosmoV181HomeCache';
function saveCache(r){try{localStorage.setItem(CK,JSON.stringify({u:(ME&&ME.loginId)||'',at:Date.now(),r:r}));}catch(e){}}
function readCache(){try{var c=JSON.parse(localStorage.getItem(CK)||'null');if(c&&c.r&&c.r.ho&&c.u===((ME&&ME.loginId)||'')&&Date.now()-c.at<36*3600000)return c.r;}catch(e){}return null;}
function dropCache(){try{localStorage.removeItem(CK);}catch(e){}}
function applyHome(r,fresh){HO=r.ho&&r.ho.status==='PASS_HOUSE'?r.ho:HO;if(fresh&&HO)HO_SKEW=Date.parse(HO.now)-Date.now();else if(!fresh)HO_SKEW=0;WX=r.wx||WX;JB=r.jb||JB;AN=r.an||AN;FIELDS=r.fields||FIELDS;UNITS=r.units||UNITS;HOME_FRESH=!!fresh;wxRender();hoRender();}
async function homeLoad(){if(!TOKEN||HOME_BUSY)return;HOME_BUSY=true;WX_BUSY=!WX;wxRender();todoRender();
 try{var r=await rpc('cosmoV181HomeRpc','HM_BOOT',{token:TOKEN});
  if(r&&r.status==='PASS_HOME'){WX_BUSY=false;applyHome(r,true);saveCache(r);}
  else if(r&&r.code==='LOGIN_OR_SESSION_UNAVAILABLE'){WX_BUSY=false;await lost();}
  else if(r&&r.code==='LOGIN_BUSY'){WX_BUSY=false;wxRender();todoRender();setTimeout(function(){if(TOKEN)homeLoad();},5000);}
  else{WX_BUSY=false;HOME_FRESH=true;await Promise.all([hoLoad(),wxLoad()]);}}
 catch(e){WX_BUSY=false;HOME_FRESH=true;wxRender();todoRender();}finally{HOME_BUSY=false;}}
function nowMin(){var d=jst(Date.now()+HO_SKEW);return d.getUTCHours()*60+d.getUTCMinutes();}
function hmMin(x){var m=/^(\d{1,2}):(\d{2})$/.exec(String(x||''));return m?(+m[1])*60+(+m[2]):null;}
function todayLast(fid){var d=today(),L=null;(HO.today||[]).forEach(function(e){if(e.fieldId===fid&&e.status==='OK'&&jst(Date.parse(e.at)).toISOString().slice(0,10)===d&&(!L||Date.parse(e.at)>=Date.parse(L.at)))L=e;});return L;}
function stToday(h){var L=todayLast(h.fieldId);return L?(L.action==='OPEN'?'OPEN':'CLOSED'):(h.state==='OPEN'?'OPEN':'NONE');}
/* 今日は完了 only when every house has today's 閉めた (last record today) or is a keep-closed day; otherwise 記録なし n棟 (S000 2026-11-11). */
function hoNoRecord(){return HO.houses.filter(function(h){var L=todayLast(h.fieldId);if(h.mode==='HOLD'&&h.state!=='OPEN')return false;return !(L&&L.action==='CLOSE'&&h.state!=='OPEN');}).length;}
function openedToday(fid){var d=today();return (HO.today||[]).some(function(e){return e.fieldId===fid&&e.status==='OK'&&e.action==='OPEN'&&jst(Date.parse(e.at)).toISOString().slice(0,10)===d;});}
/* S000 2026-11-11: what each house needs now. Red only when it is really past the deadline and still needs doing. */
function hoInfo(h){var n=nowMin(),o=hmMin(HO.times&&HO.times.open),c=hmMin(HO.times&&HO.times.close),st=h.state||'NONE';
 if(h.mode==='HOLD')return {kind:st==='OPEN'?'HOLDOPEN':'HOLD',level:st==='OPEN'?'warn':''};
 if(st==='OPEN')return {kind:'CLOSE',level:c!==null&&n>c?'late':c!==null&&n>=c-60?'soon':''};
 if(o!==null&&n<o)return {kind:'OPENBY',level:''};
 if(!openedToday(h.fieldId)&&(c===null||n<c))return {kind:'NOTOPEN',level:'warn'};
 return {kind:'DONE',level:''};}
function hoRender(){var box=$('hoBox'),on=!!(TOKEN&&HO&&HO.houses&&HO.houses.length);box.classList.toggle('hidden',!on);todoRender();if(!on)return;
 var n=nowMin(),o=hmMin(HO.times&&HO.times.open),anyOpen=HO.houses.some(function(h){return h.state==='OPEN';});
 var nr=hoNoRecord();$('hoTimes').textContent=!HO.times?'':(o!==null&&n<o)?t('hoSumOpen').replace('{t}',HO.times.open):anyOpen?t('hoSumClose').replace('{t}',HO.times.close):nr?t('hoSumNone').replace('{n}',nr):t('hoSumDone');
 $('hoNote').classList.toggle('hidden',!!HO.canPress);var rows=$('hoRows');rows.innerHTML='';
 HO.houses.forEach(function(h){var I=hoInfo(h),st=h.state||'NONE',sd=stToday(h),d=el('div','hrow'+(I.level==='late'?' late':I.level==='warn'?' warn':''));d.id='hr_'+h.fieldId;
  d.appendChild(el('span','hn',hoName(h)));if(!(h.mode==='HOLD'&&sd==='NONE'))d.appendChild(el('span','hs'+(sd==='NONE'?' none':''),t('hoSt_'+sd)));
  d.appendChild(el('span','hl',h.last?t('hoBy').replace('{t}',(jst(Date.parse(h.last.at)).toISOString().slice(0,10)===today()?'':(jst(Date.parse(h.last.at)).getUTCMonth()+1)+'/'+jst(Date.parse(h.last.at)).getUTCDate()+' ')+hm(Date.parse(h.last.at))).replace('{n}',h.last.byName||''):''));
  /* One button: the next thing to do. A keep-closed day shows no button (only [閉めた] if the house is open anyway). */
  if(h.mode==='HOLD'&&st!=='OPEN'){d.appendChild(el('span','hh',t('hoHoldS')+(h.plan&&h.plan.reason?'（'+why(h.plan.reason)+'）':'')));}
  else{var act=st==='OPEN'?'CLOSE':'OPEN',b=el('button',act==='CLOSE'?'cl':null,t(act==='OPEN'?'hoOpen':'hoClose'));b.type='button';b.id='ho_'+h.fieldId+'_'+act;b.disabled=!HO.canPress||HO_BUSY;b.onclick=function(){hoPress(h,act);};d.appendChild(b);}
  rows.appendChild(d);});
 $('plBox').classList.toggle('hidden',!HO.isDirector);plRender();}
function jbType(c){var x=JB&&JB.types?JB.types.filter(function(y){return y.code===c;})[0]:null;return x?(LANG==='en'?x.en:LANG==='id'?x.idn:x.ja):c;}
function fieldName(f){var x=FIELDS[f];return x?(LANG==='en'?x.en:LANG==='id'?x.id:x.ja):(f||'');}
function unitName(u){var x=UNITS[u];return x?(LANG==='en'?' '+x.en:LANG==='id'?' '+x.id:x.ja):'';}
function todoRender(){var box=$('todoBox');box.classList.toggle('hidden',!TOKEN);if(!TOKEN)return;var R=$('tdRows');R.innerHTML='';$('tdUpd').textContent=HOME_FRESH?'':t('tdUpd');
 function item(icon,text,cls,go){var a=el(go?'a':'div','td'+(cls?' '+cls:''));if(go){var local=go.charAt(0)==='#';a.href=local?go:URL_+'?screen='+go;a.target=local?'_self':'_top';}
  a.appendChild(el('span','ti',icon));a.appendChild(el('span','tx',text));if(go)a.appendChild(el('span','chevron','›'));R.appendChild(a);}
 if(HO&&HO.houses)HO.houses.forEach(function(h){var I=hoInfo(h),nm=hoName(h),go='#hr_'+h.fieldId;
  if(I.kind==='CLOSE'&&I.level==='late')item('🔴',t('tdCloseLate').replace('{h}',nm).replace('{t}',HO.times.close),'late',go);
  else if(I.kind==='CLOSE'&&I.level==='soon')item('🏠',t('tdCloseSoon').replace('{h}',nm).replace('{t}',HO.times.close),'',go);
  else if(I.kind==='NOTOPEN')item('🟡',t('tdNotOpen').replace('{h}',nm).replace('{t}',HO.times.open),'warn',go);
  else if(I.kind==='OPENBY')item('🏠',t('tdOpenBy').replace('{h}',nm).replace('{t}',HO.times.open),'',go);
  else if(I.kind==='HOLDOPEN')item('🟡',t('tdHoldOpen').replace('{h}',nm),'warn',go);});
 if(JB&&JB.status==='PASS'){var js=JB.jobs.filter(function(j){return j.mine||j.status==='DOING';});js.slice(0,3).forEach(function(j){
  item('🧑‍🌾',t('tdJob').replace('{w}',jbType(j.workType)).replace('{f}',fieldName(j.fieldId)).replace('{d}/{n}',j.total===null||j.total===undefined?nv(j.done):nv(j.done)+'/'+nv(j.total)).replace('{u}',unitName(j.unit)),j.long?'warn':'','V159_WORK');});
  if(js.length>3)item('…',t('tdJobMore').replace('{n}',js.length-3),'','V159_WORK');}
 if(AN&&AN.status==='PASS'&&AN.open>0)item('🚨',t('tdAndon').replace('🚨 ','').replace('{n}',AN.open)+(AN.overdue?t('tdAndonLate').replace('{n}',AN.overdue):''),AN.overdue?'late':'warn','V171_BOARD');
 if(!R.children.length)item('',t('tdNone'),'ok',null);}
function plDate(){return shift(HO&&HO.date||today(),PL_DAY);}
function plRender(){var P=$('hoPlan'),on=!!(HO&&HO.isDirector);P.classList.toggle('hidden',!on);if(!on)return;
 var seg=$('plDays');seg.innerHTML='';[0,1,2].forEach(function(i){var b=el('button',i===PL_DAY?'on':null,t('wxD'+i)+' '+md(shift(HO.date,i)).replace(/（.*）|\s\(.*\)/,''));b.type='button';b.id='pl_d'+i;b.onclick=function(){PL_DAY=i;plRender();};seg.appendChild(b);});
 var d=plDate(),plan=(HO.plans&&HO.plans[d])||{},held=HO.houses.filter(function(h){return plan[h.fieldId]&&plan[h.fieldId].mode==='HOLD';});
 $('plNow').textContent=t('plNow').replace('{x}',held.length?held.map(function(h){return hoName(h)+(plan[h.fieldId].reason?'（'+why(plan[h.fieldId].reason)+'）':'');}).join('、'):t('plNone'));
 var wd=WX&&WX.days?WX.days.filter(function(x){return x.date===d;})[0]:null,al=wd?wxAlerts(wd):[],sel=$('plWhy'),keep=sel.getAttribute('data-day')===d?sel.value:null;
 $('plHint').textContent=al.length?t('plHint').replace('{r}',al.map(function(a){return t(a[1]);}).join(' ')):'';
 sel.innerHTML='';var o0=el('option',null,'—');o0.value='';sel.appendChild(o0);(HO.holdReasons||['RAIN','WIND','COLD','OTHER']).forEach(function(c){var o=el('option',null,t('HR_'+c));o.value=c;sel.appendChild(o);});
 sel.value=keep!==null?keep:(al.length?al[0][2]:'');sel.setAttribute('data-day',d);
 var hb=$('plHouses'),was={};Array.prototype.forEach.call(hb.querySelectorAll('input'),function(i){was[i.value]=i.checked;});hb.innerHTML='';
 HO.houses.forEach(function(h){var l=el('label','ck'),i=el('input');i.type='checkbox';i.value=h.fieldId;i.id='pl_h_'+h.fieldId;i.checked=was[h.fieldId]!==undefined?was[h.fieldId]:true;l.appendChild(i);l.appendChild(document.createTextNode(hoName(h)));hb.appendChild(l);});
 $('plHoldB').disabled=HO_BUSY;$('plOpenB').disabled=HO_BUSY;}
async function hoSend(a,data){var r=null;for(var k=0;k<3;k++){r=await rpc('cosmoV179Rpc',a,data);if(r&&r.code==='LOGIN_OR_SESSION_UNAVAILABLE'){if(await lost())return null;continue;}
 if(r&&(r.code==='V162_STATE_CHANGED'||r.code==='V162_LOCK_BUSY'||r.code==='LOGIN_BUSY'||(r.durable&&r.durable.status==='HOLD_NOT_PERSISTED'))){await new Promise(function(z){setTimeout(z,r.code==='LOGIN_BUSY'?1500:600);});continue;}return r;}return r;}
async function hoPress(h,act){if(HO_BUSY||!TOKEN)return;HO_BUSY=true;hoRender();var label=hoName(h)+'　'+t(act==='OPEN'?'hoOpen':'hoClose');hoMsg(label+'　'+t('wait'),'wait');
 try{var r=await hoSend('HO_PRESS',{token:TOKEN,operationId:'HO-'+uuid(),fieldId:h.fieldId,action:act});if(!r)return;if(r.status!=='PASS_HOUSE_SAVED'){hoMsg(explain(r),'err');return;}
  var ex=[];if(r.same)ex.push(t('hoSame'));if(act==='OPEN'&&r.mode==='HOLD')ex.push(t('hoHoldOpened'));hoMsg(t('hoSaved')+'　'+label+(r.event?'　'+hm(Date.parse(r.event.at)):'')+(ex.length?'\n'+ex.join('\n'):''),ex.length?'wait':'ok');
 }catch(e){hoMsg(t('comm'),'err');}finally{HO_BUSY=false;await hoLoad();}}
async function plSend(mode){if(HO_BUSY||!TOKEN||!HO)return;var ids=Array.prototype.filter.call($('plHouses').querySelectorAll('input'),function(i){return i.checked;}).map(function(i){return i.value;});
 if(!ids.length){hoMsg(t('plPick'),'err');return;}var code=$('plWhy').value,tx=$('plText').value.trim();
 if(mode==='HOLD'&&!code){hoMsg(t('plWhyNeed'),'err');return;}if(code==='OTHER'&&!tx){hoMsg(t('plOtherNeed'),'err');return;}
 var reason=code?('['+code+'] '+tx).trim():tx;HO_BUSY=true;plRender();hoMsg(t('wait'),'wait');
 try{var r=await hoSend('HO_PLAN',{token:TOKEN,operationId:'HO-'+uuid(),date:plDate(),fieldIds:ids.length===HO.houses.length?'ALL':ids,mode:mode,reason:reason});if(!r)return;
  if(r.status!=='PASS_HOUSE_SAVED'){hoMsg(explain(r),'err');return;}$('plText').value='';hoMsg(t('plSaved'),'ok');
 }catch(e){hoMsg(t('comm'),'err');}finally{HO_BUSY=false;await hoLoad();}}
function $(i){return document.getElementById(i);}function t(k){return (T[LANG]&&T[LANG][k]!==undefined)?T[LANG][k]:(T.ja[k]!==undefined?T.ja[k]:k);}
function rpc(fn,action,data){return new Promise(function(res,rej){google.script.run.withSuccessHandler(function(x){try{res(JSON.parse(x));}catch(e){rej(e);}}).withFailureHandler(rej)[fn]({action:action,data:data});});}
function rd(){try{var s=JSON.parse(localStorage.getItem(KEYS.store)||'null');if(s&&typeof s.token==='string'&&s.exp>Date.now())return s;localStorage.removeItem(KEYS.store);}catch(e){}return null;}
function rm(){try{localStorage.removeItem(KEYS.store);}catch(e){}}
function standalone(){try{return (window.navigator.standalone===true)||window.matchMedia('(display-mode: standalone)').matches;}catch(e){return false;}}
function showMsg(){var n=$('login-status');if(!n)return;n.textContent=MSG?t(MSG):'';n.className=(MSG==='fail'||MSG==='comm'||MSG==='loginBusy')?'err':MSG==='checking'?'wait':'';
 var b=document.querySelector('#login-form .submit');if(b)b.disabled=MSG==='checking';
 /* 2026-11-12 S000「ログイン中が出ない」: on a phone the keyboard stays open after pressing ログイン and covers the line under the button —
  * close the keyboard and bring the line into view. */
 if(MSG&&!TOKEN){try{var a=document.activeElement;if(a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName))a.blur();}catch(e){}setTimeout(function(){try{var r=n.getBoundingClientRect();if(r.bottom>window.innerHeight||r.top<0)n.scrollIntoView({block:'center'});}catch(e){}},60);}}
function render(){document.body.classList.toggle('in',!!TOKEN);$('homeApp').hidden=!TOKEN;
 Array.prototype.forEach.call(document.querySelectorAll('[data-t]'),function(e){e.textContent=t(e.getAttribute('data-t'));});
 $('who').textContent=TOKEN&&ME?t('hello').replace('{n}',ME.displayName||ME.loginId||''):'';
 var g=$('grid');g.innerHTML='';[{screen:'HOME',icon:'🏠',ja:'ホーム',en:'Home',id:'Beranda'}].concat(SCREENS).forEach(function(s){var a=document.createElement('a'),sh=s.s||s;a.id='go_'+s.screen;a.href=URL_+'?screen='+s.screen;a.target='_top';a.title=LANG==='en'?s.en:LANG==='id'?s.id:s.ja;if(s.screen===CUR)a.className='on';
  a.appendChild(el('span','ic',s.icon));a.appendChild(el('span','nm',LANG==='en'?sh.en:LANG==='id'?sh.id:sh.ja));g.appendChild(a);});
 var ua=navigator.userAgent||'',ios=/iPhone|iPad|iPod/.test(ua),and=/Android/.test(ua),line=/ Line\//i.test(ua);
 $('inLine').classList.toggle('hidden',!line);$('instState').textContent=standalone()?t('installed'):'';$('instAnd').classList.toggle('hidden',ios&&!and);$('instIos').classList.toggle('hidden',and&&!ios);
 showMsg();wxRender();hoRender();spdRender();tabH();frLang();}
function setLang(l){if(!T[l])l='ja';LANG=l;try{localStorage.setItem('cosmoV181Lang',l);sessionStorage.setItem('COSMO_V2426_DISPLAY_LANGUAGE',l);}catch(e){}render();}
async function logout(){var tk=TOKEN;TOKEN=null;ME=null;HO=null;WX=null;WXH=null;JB=null;AN=null;MSG='';rm();dropCache();shellReset();render();if(tk)rpc('cosmoV155Rpc','LOGOUT',{token:tk}).catch(function(){});}
function afterLogin(){dcLoad();homeLoad();scPrefetch();}
/* The official login page (cosmoV2426LoginClient_) calls this bridge: real V155 login, kept on this phone when the box is on. */
function cosmoV181HomeBridge_(){var lang0=null;try{lang0=localStorage.getItem('cosmoV181Lang');}catch(e){}if(['ja','en','id'].indexOf(lang0)<0)lang0=null;
 return {initialLang:function(){return lang0;},bindRecovery:function(){},setLanguage:function(l){if(T[l]&&l!==LANG){LANG=l;try{localStorage.setItem('cosmoV181Lang',l);}catch(e){}render();}else if(T[l])LANG=l;},
  statusText:function(){return MSG?t(MSG):'';},loginIdText:function(){return t('loginId');},
  login:async function(q){if(BUSY)return;MSG='';var id=String(q.loginId||'').trim(),pw=q.password;if(!id||!pw){MSG='fail';showMsg();return;}BUSY=true;MSG='checking';showMsg();
   try{var r=await rpc('cosmoV155Rpc','LOGIN',{loginId:id,password:pw,keep:!!$('cv181keep').checked});if(r.status!=='PASS_ISOLATED_LOGIN'){MSG=r&&r.code==='LOGIN_BUSY'?'loginBusy':'fail';return;}
    TOKEN=r.token;ME=r.view;MSG='';try{localStorage.setItem(KEYS.id,id);}catch(e){}
    if($('cv181keep').checked){try{localStorage.setItem(KEYS.store,JSON.stringify({token:r.token,view:r.view||null,exp:Number(r.expiresAt)||Date.now()+28800000}));}catch(e){}}else rm();
    render();afterLogin();window.scrollTo(0,0);
   }catch(e){MSG='comm';}finally{pw=null;BUSY=false;showMsg();}},
  /* Kept login: loading screen (logo + words + spinner) while checking; the check and the first data loads run at the same time (S000 2026-11-11 反応速度). */
  start:function(){try{var last=localStorage.getItem(KEYS.id);if(last&&!$('login-worker').value)$('login-worker').value=last;}catch(e){}
   var s=rd();if(!s){document.documentElement.classList.remove('cv-checking');render();return;}document.documentElement.classList.add('cv-checking');
   TOKEN=s.token;ME=s.view||null;var c=readCache();if(c){document.documentElement.classList.remove('cv-checking');applyHome(c,false);}render();
   dcLoad();homeLoad().then(function(){document.documentElement.classList.remove('cv-checking');render();});scPrefetch();}};}
$('wxMore').addEventListener('toggle',function(){if($('wxMore').open){wxMoreRender();wxHist();}});
setInterval(function(){if(TOKEN&&document.visibilityState==='visible')homeLoad();},600000);
document.addEventListener('visibilitychange',function(){if(TOKEN&&document.visibilityState==='visible'&&HO&&Date.now()+HO_SKEW-Date.parse(HO.now)>120000)hoLoad();});
/* ---------- one app (S000 2026-11-11 反応速度): the staff screens open inside this page and stay open; switching does not load a new page.
 * The screens' pages are kept on this phone (no one's data in them) and checked against the server in the background (only a changed page
 * is sent again). Each screen's first data (…_BOOT and the like) is shown from the last time at once and then replaced by the new data read
 * in the background; that data is kept on the phone only while "stay logged in" is on, for this login only, and is wiped at log out. ---------- */
var SHELL=KEYS.shell||[],SHELL_OFF=false,CUR='HOME',FR={},SCH={},DC={},SC_INFL=null,SCH_LOADED=null,IDB=null,LT=null,SPD_T0=null,SPK='cosmoV181Speed',DC_T=null;
var DC_RE=/^[A-Z0-9]+_BOOT$|^SITE_LIST$|^WX_TODAY$/;
(function(){var A={ja:{home:'ホーム',upd:'↻ 新しい内容を読み込み中…',scrLoad:'読み込み中…',scrFail:'画面を読み込めませんでした。電波のよい所で、もう一度押してください。',retry:'もう一度',direct:'ふつうの画面で開く',
  spdT:'⏱ 画面の切り替えの速さ（このスマホの記録）',spdNone:'まだ記録がありません',spd_keep:'開いたまま',spd_cache:'前回の内容',spd_net:'サーバー待ち',spd_page:'画面も読み込み',sec:'{s}秒'},
 en:{home:'Home',upd:'↻ Loading the latest…',scrLoad:'Loading…',scrFail:'Could not load the screen. Try again where the signal is good.',retry:'Try again',direct:'Open as a normal page',
  spdT:'⏱ Screen switching speed (records on this phone)',spdNone:'No records yet',spd_keep:'already open',spd_cache:'last content',spd_net:'waited for the server',spd_page:'screen loaded too',sec:'{s} s'},
 id:{home:'Beranda',upd:'↻ Memuat yang terbaru…',scrLoad:'Memuat…',scrFail:'Layar tidak bisa dimuat. Coba lagi di tempat yang sinyalnya bagus.',retry:'Coba lagi',direct:'Buka sebagai halaman biasa',
  spdT:'⏱ Kecepatan pindah layar (catatan di HP ini)',spdNone:'Belum ada catatan',spd_keep:'sudah terbuka',spd_cache:'isi terakhir',spd_net:'menunggu server',spd_page:'layar juga dimuat',sec:'{s} detik'}};
 Object.keys(A).forEach(function(l){Object.keys(A[l]).forEach(function(k){T[l][k]=A[l][k];});});})();
function idb(){if(IDB)return IDB;IDB=new Promise(function(res){try{var q=indexedDB.open('cosmoV181',1);q.onupgradeneeded=function(){try{q.result.createObjectStore('kv');}catch(e){}};q.onsuccess=function(){res(q.result);};q.onerror=q.onblocked=function(){res(null);};setTimeout(function(){res(null);},4000);}catch(e){res(null);}});return IDB;}
function kvReq(mode,f){return idb().then(function(db){if(!db)return null;return new Promise(function(res){try{var tx=db.transaction('kv',mode),st=tx.objectStore('kv'),r=f(st);tx.oncomplete=function(){res(r&&r.result!==undefined?r.result:true);};tx.onerror=tx.onabort=function(){res(null);};}catch(e){res(null);}});});}
function kvGet(k){return kvReq('readonly',function(st){return st.get(k);});}function kvPut(k,v){return kvReq('readwrite',function(st){return st.put(v,k);});}
function kvDel(k){return kvReq('readwrite',function(st){return st.delete(k);});}function kvKeys(){return kvReq('readonly',function(st){return st.getAllKeys();});}
/* screens' pages */
function scLoadLocal(){if(!SCH_LOADED)SCH_LOADED=Promise.all(SHELL.map(function(s){return kvGet('scr:'+s).then(function(v){if(v&&typeof v.html==='string'&&/^[0-9a-f]{16}$/.test(v.hash||'')&&!SCH[s])SCH[s]={hash:v.hash,html:v.html};});})).catch(function(){});return SCH_LOADED;}
async function gunzip(b64){var bin=atob(b64),u=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return await new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream('gzip'))).text();}
async function scFetch(list){var have={};list.forEach(function(s){if(SCH[s])have[s]=SCH[s].hash;});var gz=typeof DecompressionStream==='function'&&typeof Response==='function'&&typeof Blob==='function'&&!!(Blob.prototype&&Blob.prototype.stream);
 var r=await rpc('cosmoV181ScreensRpc','SC_GET',{have:have,gz:gz,only:list});if(!r||r.status!=='PASS_SCREENS')throw new Error((r&&r.code)||'SC_GET');
 for(var i=0;i<r.screens.length;i++){var x=r.screens[i];if(x.same||SHELL.indexOf(x.screen)<0)continue;var h=typeof x.html==='string'?x.html:await gunzip(x.gz);var old=SCH[x.screen];SCH[x.screen]={hash:x.hash,html:h};kvPut('scr:'+x.screen,{hash:x.hash,html:h});
  if(old&&FR[x.screen]){if(CUR!==x.screen)frDrop(x.screen);else FR[x.screen].old=true;}}return r;}
function scPrefetch(){if(SC_INFL)return SC_INFL;SC_INFL=scLoadLocal().then(function(){return scFetch(SHELL);}).catch(function(){SC_INFL=null;});return SC_INFL;}
async function scHtml(s){await scLoadLocal();if(SCH[s])return SCH[s].html;if(SC_INFL){await SC_INFL;if(SCH[s])return SCH[s].html;}await scFetch([s]);return SCH[s]?SCH[s].html:null;}
/* each screen's first data: last content first */
function dcKey(fn,a){try{var p=a&&a[0];if(!p||typeof p!=='object'||typeof p.action!=='string'||!DC_RE.test(p.action))return null;var d={},k;for(k in (p.data||{}))if(k!=='token')d[k]=p.data[k];return fn+'|'+p.action+'|'+JSON.stringify(d);}catch(e){return null;}}
function dcUser(){return (ME&&ME.loginId)||'';}
function dcTake(k,x){try{var j=JSON.parse(x);if(j&&typeof j.status==='string'&&j.status.indexOf('PASS')===0){DC[k]=x;dcSave();}}catch(e){}}
function dcSave(){if(!rd())return;clearTimeout(DC_T);DC_T=setTimeout(function(){if(TOKEN&&rd())kvPut('dat:'+dcUser(),{u:dcUser(),at:Date.now(),m:DC});},800);}
function dcLoad(){var u=dcUser(),keep=!!rd();kvKeys().then(function(ks){(ks||[]).forEach(function(k){k=String(k);if(k.indexOf('dat:')===0&&(!keep||k!=='dat:'+u))kvDel(k);});});if(!keep)return Promise.resolve();return kvGet('dat:'+u).then(function(v){if(v&&v.u===u&&u===dcUser()&&Date.now()-v.at<36*3600000&&v.m)Object.keys(v.m).forEach(function(k){if(!(k in DC))DC[k]=v.m[k];});});}
function dcDrop(){DC={};clearTimeout(DC_T);kvKeys().then(function(ks){(ks||[]).forEach(function(k){if(String(k).indexOf('dat:')===0)kvDel(k);});});}
function gasCall(fn,args){return new Promise(function(res,rej){var a;try{a=JSON.parse(JSON.stringify(args||[]));}catch(e){rej(e);return;}var r=google.script.run.withSuccessHandler(res).withFailureHandler(rej);r[fn].apply(r,a);});}
function frCall(s,fn,args,ok,ng){var f=FR[s],k=dcKey(fn,args);function soon(g,v){setTimeout(function(){try{g(v);}catch(e){}},0);}
 if(k&&f&&!f.ready&&DC[k]!==undefined){f.stale=true;f.used[k]=DC[k];if(!f.pend[k]){f.pend[k]=gasCall(fn,args);f.pend[k].then(function(x){dcTake(k,x);},function(){});}soon(ok,DC[k]);return;}
 if(k&&f&&f.pend[k]){var p=f.pend[k];delete f.pend[k];p.then(function(x){ok(x);},function(e){ng(e);});return;}
 gasCall(fn,args).then(function(x){if(k)dcTake(k,x);ok(x);},function(e){ng(e);});}
/* the bridge a screen inside this page talks to (window.__cosmoShell in the screen) */
function cosmoV181ShellFor(s){return {session:function(){return TOKEN?{token:TOKEN,view:ME||null,exp:Date.now()+3600000}:null;},langNow:function(){return LANG;},
 lang:function(l){if(FR[s])FR[s].lang=l;if(T[l]&&l!==LANG)setLang(l);},ready:function(){frReady(s);},adopt:function(r){if(!TOKEN&&r&&r.token){TOKEN=r.token;ME=r.view||null;render();}},
 logout:function(){if(TOKEN)logout();},lost:function(sure){if(!TOKEN)return;if(sure){TOKEN=null;ME=null;HO=null;WX=null;WXH=null;JB=null;AN=null;MSG='';rm();dropCache();shellReset();render();}else lost();},
 go:function(x){if(x==='HOME'||SHELL.indexOf(x)>=0){go(x);return true;}return false;},call:function(fn,args,ok,ng){frCall(s,fn,args,ok,ng);},
 visible:function(){return CUR===s&&document.visibilityState==='visible';}};}
/* runs first inside each screen: google.script.run through this page, links between screens stay inside this page */
function frShim(SC){var S=parent.cosmoV181ShellFor(SC);window.__cosmoShell=S;
 function runner(){var ok=null,ng=null,uo;var r=new Proxy({},{get:function(_,k){if(k==='withSuccessHandler')return function(f){ok=f;return r;};if(k==='withFailureHandler')return function(f){ng=f;return r;};
  if(k==='withUserObject')return function(u){uo=u;return r;};if(typeof k!=='string'||k==='then')return undefined;
  return function(){S.call(k,Array.prototype.slice.call(arguments),function(x){if(ok)ok(x,uo);},function(e){if(ng)ng(e,uo);});};}});return r;}
 window.google={script:{run:new Proxy({},{get:function(_,k){return runner()[k];}}),url:{getLocation:function(cb){cb({parameter:{screen:SC},parameters:{screen:[SC]},hash:''});}},
  host:{close:function(){},setHeight:function(){},setWidth:function(){}},history:{push:function(){},replace:function(){},setChangeHandler:function(){}}}};
 document.addEventListener('click',function(ev){var a=ev.target&&ev.target.closest?ev.target.closest('a[href]'):null;if(!a)return;var m=/[?&]screen=([A-Z0-9_]+)/.exec(a.getAttribute('href')||'');if(m&&S.go(m[1])){ev.preventDefault();ev.stopPropagation();}},true);
 document.addEventListener('DOMContentLoaded',function(){var a=document.getElementById('cv181home');if(a&&a.parentNode&&a.parentNode!==document.body)a.parentNode.style.display='none';});}
function frPrep(s,h){var shim='<'+'script>('+frShim.toString()+')('+JSON.stringify(s)+');<'+'/script>',m=/<head(\s[^>]*)?>/i.exec(h)||/<html(\s[^>]*)?>/i.exec(h);
 return m?h.slice(0,m.index+m[0].length)+shim+h.slice(m.index+m[0].length):shim+h;}
function frMake(s,h){setTimeout(function(){var f=FR[s];if(f&&!f.ready){SHELL_OFF=true;frDrop(s);if(CUR===s){clearTimeout(LT);var x=$('scrHost');x.classList.remove('loading');x.classList.add('fail');}}},25000);var el=document.createElement('iframe');el.title=s;el.setAttribute('allow','geolocation; camera; microphone; clipboard-write');if(CUR===s)el.className='on';
 FR[s]={el:el,ready:false,stale:false,busy:false,pend:{},used:{},fresh:0,lang:LANG};el.srcdoc=frPrep(s,h);$('scrHost').appendChild(el);}
function frDrop(s){var f=FR[s];if(!f)return;delete FR[s];try{f.el.remove();}catch(e){}}
function frReady(s){var f=FR[s];if(!f||f.ready)return;f.ready=true;f.fresh=Date.now();if(CUR===s)scShow(s);spdMark(s,f.stale?'cache':null);if(f.stale)frRevalidate(s,true);else{f.pend={};f.used={};}}
function frRevalidate(s,first){var f=FR[s];if(!f||f.busy||!TOKEN)return;var w;try{w=f.el.contentWindow;}catch(e){return;}if(!w)return;f.busy=true;f.stale=false;updShow();
 var keys=Object.keys(f.pend),wait=first?Promise.all(keys.map(function(k){return f.pend[k].then(function(x){return x!==f.used[k];},function(){return false;});})):Promise.resolve([true]);
 wait.then(function(ch){if(!ch.some(Boolean)||FR[s]!==f)return;var jobs=[];try{if(typeof w.loadSites==='function')jobs.push(w.loadSites());if(typeof w.refresh==='function')jobs.push(w.refresh());}catch(e){}
   return Promise.all(jobs).then(function(){try{if(typeof w.render==='function')w.render();if(w.TOKEN&&typeof w.loadWeather==='function')w.loadWeather();}catch(e){}});})
  .catch(function(){}).then(function(){f.pend={};f.used={};f.busy=false;f.fresh=Date.now();updShow();});}
function frLang(){Object.keys(FR).forEach(function(k){var f=FR[k];if(f.lang===LANG)return;f.lang=LANG;try{var w=f.el.contentWindow;if(w&&typeof w.setLang==='function')w.setLang(LANG);}catch(e){}});}
function shellReset(){Object.keys(FR).forEach(frDrop);FR={};CUR='HOME';document.body.classList.remove('scr');var h=$('scrHost');if(h)h.classList.remove('loading','upd','fail');dcDrop();SPD_T0=null;}
function updShow(){var h=$('scrHost'),f=FR[CUR];if(h)h.classList.toggle('upd',!!(CUR!=='HOME'&&f&&f.ready&&f.busy));}
function scShow(s){var h=$('scrHost');clearTimeout(LT);h.classList.remove('loading','fail');Object.keys(FR).forEach(function(k){FR[k].el.classList.toggle('on',k===s);});updShow();}
function tabMark(){var g=$('grid');if(g)Array.prototype.forEach.call(g.children,function(a){a.classList.toggle('on',a.id==='go_'+CUR);});}
function tabH(){var g=$('grid');if(g&&g.offsetHeight)document.documentElement.style.setProperty('--tabh',g.offsetHeight+'px');}
function hpush(s){try{google.script.history.push({s:s},{},'');}catch(e){}}
function go(s,noPush){if(!TOKEN||(s!=='HOME'&&SHELL.indexOf(s)<0))return;var t0=performance.now(),same=s===CUR;if(!same&&FR[CUR]&&FR[CUR].old)frDrop(CUR);CUR=s;if(!noPush&&!same)hpush(s);
 document.body.classList.toggle('scr',s!=='HOME');tabMark();tabH();var h=$('scrHost');
 if(s==='HOME'){clearTimeout(LT);h.classList.remove('loading','upd','fail');Object.keys(FR).forEach(function(k){FR[k].el.classList.remove('on');});window.scrollTo(0,0);if(HO&&Date.now()+HO_SKEW-Date.parse(HO.now)>120000)hoLoad();return;}
 if(SHELL_OFF&&!FR[s]){h.classList.remove('loading');h.classList.add('fail');return;}var f=FR[s];SPD_T0={s:s,t:t0,page:!SCH[s]};
 if(f&&f.ready){scShow(s);spdMark(s,'keep');if(Date.now()-f.fresh>60000)frRevalidate(s,false);return;}
 Object.keys(FR).forEach(function(k){FR[k].el.classList.toggle('on',k===s);});h.classList.remove('fail');updShow();clearTimeout(LT);LT=setTimeout(function(){if(CUR===s&&!(FR[s]&&FR[s].ready))h.classList.add('loading');},150);
 if(f)return;scHtml(s).then(function(x){if(!x)throw new Error('none');if(!FR[s]&&TOKEN)frMake(s,x);},function(){if(CUR===s&&!FR[s]){clearTimeout(LT);h.classList.remove('loading');h.classList.add('fail');}});}
function spdMark(s,kind){if(!SPD_T0||SPD_T0.s!==s)return;var k=kind||(SPD_T0.page?'page':'net');if(k!=='keep'&&SPD_T0.page)k='page';var ms=Math.round(performance.now()-SPD_T0.t);SPD_T0=null;if(k==='cache'&&ms>=400)k='net';
 var L;try{L=JSON.parse(localStorage.getItem(SPK)||'[]');}catch(e){L=[];}if(!Array.isArray(L))L=[];L.unshift({s:s,k:k,ms:ms,at:Date.now()});try{localStorage.setItem(SPK,JSON.stringify(L.slice(0,40)));}catch(e){}spdRender();}
function spdRender(){var R=$('spdRows');if(!R)return;var L;try{L=JSON.parse(localStorage.getItem(SPK)||'[]');}catch(e){L=[];}R.innerHTML='';if(!Array.isArray(L)||!L.length){R.textContent=t('spdNone');return;}
 L.slice(0,12).forEach(function(x){var sc=SCREENS.filter(function(y){return y.screen===x.s;})[0],sh=sc?(sc.s||sc):{ja:x.s,en:x.s,id:x.s},d=new Date(x.at);
  R.appendChild(el('div','',('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)+'　'+(LANG==='en'?sh.en:LANG==='id'?sh.id:sh.ja)+'　'+t('sec').replace('{s}',(x.ms/1000).toFixed(x.ms<1000?2:1))+'（'+t('spd_'+x.k)+'）'));});}
(function(){var st=$('login-status'),kp=document.querySelector('#login-form .submit');if(st&&kp&&kp.parentNode)kp.parentNode.insertBefore(st,kp.nextSibling);})();
(function(){var g=$('grid'),h=document.createElement('div');h.id='scrHost';h.innerHTML='<div id="scrLoad"><div class="cv-spin"></div><div class="cv-spintx" id="scrLoadTx"></div><button type="button" id="scrRetry"></button><a id="scrDirect" data-direct="1" target="_top"></a></div><div id="scrUpd"></div>';
 document.body.appendChild(h);if(g)document.body.appendChild(g);
 $('scrRetry').onclick=function(){var s=CUR;SHELL_OFF=false;frDrop(s);CUR='HOME';go(s,true);};
 var setTx=function(){$('scrLoadTx').textContent=$('scrHost').classList.contains('fail')?t('scrFail'):t('scrLoad');$('scrRetry').textContent=t('retry');$('scrDirect').textContent=t('direct');$('scrDirect').href=URL_+'?screen='+CUR;$('scrUpd').textContent=t('upd');};
 new MutationObserver(setTx).observe(h,{attributes:true,attributeFilter:['class']});var r0=render;render=function(){r0();setTx();};
 document.addEventListener('click',function(ev){var a=ev.target&&ev.target.closest?ev.target.closest('a[href]'):null;if(!a||!TOKEN||a.getAttribute('data-direct'))return;var m=/[?&]screen=([A-Z0-9_]+)/.exec(a.getAttribute('href')||'');if(!m)return;
  if(m[1]==='HOME'||SHELL.indexOf(m[1])>=0){ev.preventDefault();go(m[1]);}},true);
 window.addEventListener('resize',tabH);
 try{google.script.history.setChangeHandler(function(e){var s=e&&e.state&&e.state.s;go(s&&(s==='HOME'||SHELL.indexOf(s)>=0)?s:'HOME',true);});}catch(e){}})();

var __hb=cosmoV181HomeBridge_();(function cosmoV2426LoginClient_(initial,base,resetBridge,authBridge){
 'use strict';
 var languages=['ja','en','id'],key='COSMO_V2426_DISPLAY_LANGUAGE',lang=languages.includes(initial)?initial:'ja',status='notice';
 var recovery=cosmoV2449ResetClient_(document,resetBridge||null,lang);
 if(authBridge)authBridge.bindRecovery(recovery);
 var text={
  worker:['作業者ID','Worker ID','ID pekerja'],password:['パスワード','Password','Kata sandi'],login:['ログイン','Log in','Masuk'],
  show:['パスワードを表示','Show password','Tampilkan kata sandi'],hide:['パスワードを隠す','Hide password','Sembunyikan kata sandi'],
  notice:['非本番の表示確認です。正式ログイン・業務保存は無効です。実際のパスワードを入力しないでください。','Non-production display preview. Real login and business saving are disabled. Do not enter a real password.','Pratinjau tampilan nonproduksi. Login nyata dan penyimpanan bisnis dinonaktifkan. Jangan masukkan kata sandi asli.'],
  hold:['HOLD：正式本人認証は未承認です。入力情報は送信・保存していません。','HOLD: real authentication is not approved. Entered information has not been sent or saved.','HOLD: autentikasi nyata belum disetujui. Informasi yang diisi tidak dikirim atau disimpan.'],
  preview:['合成データで作業入力を確認','Preview work input with synthetic data','Pratinjau input kerja dengan data sintetis'],
  language:['表示言語','Display language','Bahasa tampilan'],unavailable:['確認画面のURLはHOLDです。','Preview URL is on HOLD.','URL pratinjau berstatus HOLD.']
 };
 function t(k){return text[k][languages.indexOf(lang)];}
 function render(){
  recovery.setLanguage(lang);
  document.documentElement.lang=lang;document.title='COSMO FARM | '+t('login');
  document.querySelectorAll('[data-login-text]').forEach(n=>n.textContent=t(n.getAttribute('data-login-text')));
  ['worker','password'].forEach(k=>{var n=document.getElementById('login-'+k);n.placeholder=t(k);n.setAttribute('aria-label',t(k));});
  document.getElementById('login-toggle').setAttribute('aria-label',t(document.getElementById('login-password').type==='password'?'show':'hide'));
  document.getElementById('login-status').textContent=authBridge?authBridge.statusText():t(status);
  if(authBridge){authBridge.setLanguage(lang);var worker=document.getElementById('login-worker');worker.placeholder=authBridge.loginIdText();worker.setAttribute('aria-label',authBridge.loginIdText());}document.querySelector('.languages').setAttribute('aria-label',t('language'));
  document.querySelectorAll('[data-login-lang]').forEach(n=>n.setAttribute('aria-pressed',String(n.getAttribute('data-login-lang')===lang)));
  var link=document.getElementById('login-preview');
  if(/^https:\/\/script\.google\.com\/(?:a\/[^/]+\/)?macros\/s\/[A-Za-z0-9_-]+\/(?:exec|dev)$/.test(base)){link.href=base+'?screen=WORK&preview=v24.26&lang='+lang;}
  else{link.removeAttribute('href');link.setAttribute('aria-disabled','true');link.textContent=t('unavailable');}
 }
 if(!languages.includes(initial)){try{var remembered=sessionStorage.getItem(key);if(languages.includes(remembered))lang=remembered;}catch(e){}}
 document.getElementById('login-form').addEventListener('submit',async function(e){e.preventDefault();if(authBridge){var password=document.getElementById('login-password').value;document.getElementById('login-password').value='';try{await authBridge.login({loginId:document.getElementById('login-worker').value,password:password});}catch(ignore){}finally{password=null;render();}}else{status='hold';render();}});
 document.getElementById('login-toggle').addEventListener('click',function(){var n=document.getElementById('login-password');n.type=n.type==='password'?'text':'password';render();});
 document.querySelectorAll('[data-login-lang]').forEach(n=>n.addEventListener('click',function(){lang=n.getAttribute('data-login-lang');try{sessionStorage.setItem(key,lang);}catch(e){}render();}));
 render();
})(__hb.initialLang(),"https://script.google.com/macros/s/AKfycbyb1aJ8iEJ2di0o3b7YS5Iw91Wd-adwNq3t27MsL6BtjhxxWVK4-reXlZSymLfipBKX/exec",null,__hb);__hb.start();
/* inline handlers of the page, bound here (CSP: no inline script) */
(function(){var H=[["click",function(event){plSend('HOLD')}],["click",function(event){plSend('OPEN')}],["click",function(event){logout()}]];
 function bindAll(root){Array.prototype.forEach.call((root||document).querySelectorAll("[data-cf-on]"),function(el){var x=H[+el.getAttribute("data-cf-on")];if(!x||el.__cfOn)return;el.__cfOn=true;el.addEventListener(x[0],function(e){if(x[1].call(el,e)===false)e.preventDefault();});});}
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){bindAll();});else bindAll();window.__cfBind=bindAll;})();
