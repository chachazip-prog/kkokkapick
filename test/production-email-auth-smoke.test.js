const { runProductionEmailAuthSmoke } = require('../scripts/production-email-auth-smoke');

const env = {
  PRODUCTION_SUPABASE_URL: 'https://project.supabase.co',
  PRODUCTION_SUPABASE_ANON_KEY: 'public-anon-key-value',
  PRODUCTION_TEST_EMAIL: 'release@example.com',
  PRODUCTION_TEST_PASSWORD: 'not-logged',
};

const calls = [];
const fetchImpl = async (url, options) => {
  calls.push({ url, options });
  if (url.includes('grant_type=password')) {
    return new Response(JSON.stringify({
      access_token:'access-1',refresh_token:'refresh-1',user:{id:'u1'}
    }),{status:200,headers:{'content-type':'application/json'}});
  }
  if (url.includes('grant_type=refresh_token')) {
    if (!options.body.includes('refresh-1')) throw new Error('refresh token not used');
    return new Response(JSON.stringify({
      access_token:'access-2',refresh_token:'refresh-2',user:{id:'u1'}
    }),{status:200,headers:{'content-type':'application/json'}});
  }
  if (url.endsWith('/rpc/get_my_app_data')) {
    if (options.headers.Authorization !== 'Bearer access-2') throw new Error('rotated access token not used');
    return new Response(JSON.stringify({profile:null,favoriteProductIds:[],priceAlerts:[]}),{status:200,headers:{'content-type':'application/json'}});
  }
  if (url.endsWith('/rpc/get_published_catalog')) {
    return new Response(JSON.stringify({products:[{id:'p1'}]}),{status:200,headers:{'content-type':'application/json'}});
  }
  throw new Error('unexpected request');
};

runProductionEmailAuthSmoke({env,fetchImpl}).then(result=>{
  if(result.status!=='PASS'||result.catalogSampleCount!==1)throw new Error('smoke result mismatch');
  const loggable=JSON.stringify(result);
  for(const secret of [env.PRODUCTION_TEST_EMAIL,env.PRODUCTION_TEST_PASSWORD,'access-1','access-2','refresh-1']){
    if(loggable.includes(secret))throw new Error('smoke result leaks credential/session material');
  }
  if(calls.length!==4)throw new Error('unexpected call count');
  console.log('production email auth smoke contract PASS');
}).catch(error=>{console.error(error);process.exitCode=1;});
