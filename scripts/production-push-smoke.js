import fs from 'node:fs';
import path from 'node:path';

import { ApnsSender } from '../src/apns-sender.js';
import { FcmSender } from '../src/fcm-sender.js';
import { PushConfigurationError, PushOutcome } from '../src/push-provider-result.js';

function required(env,name){
  const value=String(env[name]||'').trim();
  if(!value)throw new PushConfigurationError(`missing_${name.toLowerCase()}`);
  return value;
}

export async function runProductionPushSmoke(env=process.env){
  if(env.PUSH_SMOKE_EXECUTE!=='1'){
    throw new PushConfigurationError('push_smoke_execute_confirmation_required');
  }
  const platform=required(env,'PUSH_SMOKE_PLATFORM').toLowerCase();
  let sender,token;

  if(platform==='android'){
    token=required(env,'PUSH_SMOKE_ANDROID_TOKEN');
    sender=new FcmSender({
      serviceAccount:required(env,'FCM_SERVICE_ACCOUNT_JSON'),
    });
  }else if(platform==='ios'){
    token=required(env,'PUSH_SMOKE_IOS_TOKEN');
    sender=new ApnsSender({
      keyId:required(env,'APNS_KEY_ID'),
      teamId:required(env,'APNS_TEAM_ID'),
      bundleId:required(env,'APNS_BUNDLE_ID'),
      privateKey:required(env,'APNS_PRIVATE_KEY_P8'),
      environment:env.APNS_ENVIRONMENT||'production',
    });
  }else{
    throw new PushConfigurationError('push_smoke_platform_invalid');
  }

  const result=await sender.send({
    token,
    deliveryId:'production-push-smoke',
    productId:'production-push-smoke',
    observedPrice:1,
  },{
    title:'꼬까픽 알림 연결 테스트',
    body:'가격 알림을 받을 준비가 완료됐어요.',
  });

  const report={
    status:result.outcome===PushOutcome.success?'PASS':'FAIL',
    platform,
    outcome:result.outcome,
    code:result.code,
  };
  if(env.PUSH_SMOKE_REPORT){
    fs.mkdirSync(path.dirname(env.PUSH_SMOKE_REPORT),{recursive:true});
    fs.writeFileSync(env.PUSH_SMOKE_REPORT,JSON.stringify(report,null,2)+'\n');
  }
  if(report.status!=='PASS')process.exitCode=1;
  return report;
}

if(import.meta.url===`file://${process.argv[1]}`){
  runProductionPushSmoke()
    .then(report=>console.log(JSON.stringify(report,null,2)))
    .catch(error=>{
      const code=error instanceof PushConfigurationError?error.code:'push_smoke_failed';
      console.error(JSON.stringify({status:'FAIL',code}));
      process.exitCode=1;
    });
}
