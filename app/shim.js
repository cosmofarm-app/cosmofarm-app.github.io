/* COSMO FARM PWA: stands in for google.script.* when the screens run outside Apps Script.
 * google.script.run.<fn>(packet) becomes one POST (text/plain JSON) to the Apps Script relay (V182). Only {action,data} goes out.
 * The relay's own refusals (stopped, busy, not allowed) come back to the screen as an ordinary HOLD answer, so the screen's
 * existing messages are used. No names, IDs or keys are in this file; the relay address comes from config.js. */
(function(){
  'use strict';
  var CFG=window.COSMO_PWA||{},EXEC=String(CFG.exec||''),TIMEOUT=60000;
  function hold(code){return JSON.stringify({status:'HOLD',code:code});}
  function post(fn,packet){
    var body='{"pwa":1,"v":1,"fn":'+JSON.stringify(fn)+',"packet":'+JSON.stringify(packet===undefined?null:packet)+'}';
    var ac=typeof AbortController==='function'?new AbortController():null,timer=ac?setTimeout(function(){ac.abort();},TIMEOUT):null;
    return fetch(EXEC,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:body,redirect:'follow',cache:'no-store',credentials:'omit',signal:ac?ac.signal:undefined})
      .then(function(r){return r.text();})
      .then(function(t){if(timer)clearTimeout(timer);var j;try{j=JSON.parse(t);}catch(e){return hold('RELAY_BAD_ANSWER');}
        if(j&&j.status==='OK'&&typeof j.result==='string')return j.result;
        return hold(j&&typeof j.code==='string'?j.code:'RELAY_BAD_ANSWER');},
        function(e){if(timer)clearTimeout(timer);throw e;});
  }
  /* calls answered on the phone (no network). Step 2 puts the screens' own files here. */
  var LOCAL={cosmoV181ScreensRpc:function(){return Promise.resolve(hold('PWA_SCREENS_NOT_YET'));}};
  function call(fn,args){var packet=args&&args.length?args[0]:null;
    if(typeof fn!=='string'||!/^cosmoV[0-9]+[A-Za-z]*Rpc$/.test(fn))return Promise.resolve(hold('RELAY_FN_NOT_ALLOWED'));
    if(LOCAL[fn])return LOCAL[fn](packet);
    return post(fn,packet);}
  function runner(){var ok=null,ng=null,uo;
    var r=new Proxy({},{get:function(_,k){
      if(k==='withSuccessHandler')return function(f){ok=f;return r;};
      if(k==='withFailureHandler')return function(f){ng=f;return r;};
      if(k==='withUserObject')return function(u){uo=u;return r;};
      if(typeof k!=='string')return undefined;
      return function(){var a=Array.prototype.slice.call(arguments);
        call(k,a).then(function(x){if(ok)ok(x,uo);},function(e){if(ng)ng(e instanceof Error?e:new Error(String(e)),uo);});};}});
    return r;}
  var changeHandler=null;
  window.addEventListener('popstate',function(e){if(changeHandler)try{changeHandler({state:e.state||{},location:{parameter:{},hash:''}});}catch(_){}});
  window.google={script:{
    get run(){return runner();},
    history:{push:function(s){try{history.pushState(s||{},'');}catch(_){}} ,replace:function(s){try{history.replaceState(s||{},'');}catch(_){}} ,setChangeHandler:function(f){changeHandler=typeof f==='function'?f:null;}},
    url:{getLocation:function(cb){try{cb({parameter:{},parameters:{},hash:location.hash.replace(/^#/,'')});}catch(_){}}},
    host:{close:function(){},setHeight:function(){},setWidth:function(){},origin:location.origin}
  }};
  window.__cosmoPwa={post:post,exec:EXEC,version:String(CFG.version||'')};
})();
