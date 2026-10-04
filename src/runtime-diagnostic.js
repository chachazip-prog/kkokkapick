(function(){
  var box;
  function show(kind,msg){
    if(!box){
      box=document.createElement('pre');
      box.id='runtimeDiagnostic';
      box.style.cssText='position:fixed;left:12px;right:12px;bottom:92px;z-index:99999;max-height:42vh;overflow:auto;margin:0;padding:12px;background:#fff3f3;color:#8b0000;border:2px solid #d33;border-radius:12px;font:12px/1.45 monospace;white-space:pre-wrap';
      document.addEventListener('DOMContentLoaded',function(){if(!box.isConnected)document.body.appendChild(box)});
      if(document.body)document.body.appendChild(box);
    }
    box.textContent='KKOKKAPICK RUNTIME '+kind+'\n'+String(msg);
  }
  window.__kkokkapickRuntimeError=show;
  window.addEventListener('error',function(e){var opaque=(e.message==='Script error.'||!e.message)&&!e.filename&&!e.lineno&&!e.colno&&!e.error;if(opaque)return;show('ERROR',(e.message||'unknown error')+'\n'+(e.filename||'')+':'+(e.lineno||0)+':'+(e.colno||0));});
  window.addEventListener('unhandledrejection',function(e){var r=e.reason;show('REJECTION',r&&r.stack?r.stack:(r&&r.message?r.message:String(r)));});
  window.setTimeout(function(){
    if(!window.__kkokkapickBooted)show('BOOT_TIMEOUT','Application module did not finish bootstrap within 5 seconds. Check module import/parse/network failure.');
  },5000);
})();
