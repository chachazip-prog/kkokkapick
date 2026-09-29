const fs=require('fs');
const sql=fs.readFileSync('supabase/migrations/026_commercial_event_abuse_guard.sql','utf8');
for(const needle of [
  "p_event_type not in ('impression','click')",
  "length(v_session)<16",
  "interval '1 minute'",
  ">=60",
  "interval '10 seconds'",
  "revenue)",
  "v_session,null",
  "grant execute on function public.record_commercial_event(uuid,text,uuid,text) to anon,authenticated"
]) if(!sql.includes(needle)) throw new Error('missing commercial abuse guard: '+needle);
if(/inet_client_addr|x-forwarded-for|ip_address/i.test(sql)) throw new Error('public event guard must not collect IP addresses');
console.log('commercial event abuse contract PASS');
