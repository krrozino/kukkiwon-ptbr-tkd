interface Env { SUPABASE_URL: string; SUPABASE_PUBLISHABLE_KEY: string; }
export default {
  async scheduled(_event: ScheduledController, env: Env): Promise<void> {
    if (!env.SUPABASE_URL || !env.SUPABASE_PUBLISHABLE_KEY) throw new Error('Missing Supabase Worker secrets');
    const base = new URL(env.SUPABASE_URL);
    if (base.protocol !== 'https:' || !base.hostname.endsWith('.supabase.co')) throw new Error('Unexpected Supabase host');
    const endpoint = new URL('/rest/v1/technical_terms?select=id&limit=1',base);
    const result = await fetch(endpoint.toString(),{
      method:'GET',
      headers:{apikey:env.SUPABASE_PUBLISHABLE_KEY,Accept:'application/json','Cache-Control':'no-cache'},
      cache:'no-store'
    });
    if (!result.ok) throw new Error('Supabase health query failed with HTTP '+result.status);
    const value:unknown = await result.json();
    if (!Array.isArray(value)) throw new Error('Unexpected Supabase response');
    console.log('Supabase database query OK',new Date().toISOString());
  }
};
