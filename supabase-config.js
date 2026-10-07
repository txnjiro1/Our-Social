/* OurSocial — Supabase browser configuration
 *
 * Replace ONLY the two placeholder values below with your Supabase project
 * URL and PUBLISHABLE key. Never put a secret/service key in this file.
 */

const OUR_SOCIAL_SUPABASE_URL = 'https://cobrfupuqwjidwhxpnmv.supabase.co';
const OUR_SOCIAL_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_k4ZT_0HkDUCLmJtGNQrHtg_5NAZLUXP';

window.ourSocialSupabase = null;

if (
  window.supabase &&
  OUR_SOCIAL_SUPABASE_URL.startsWith('https://') &&
  OUR_SOCIAL_SUPABASE_PUBLISHABLE_KEY &&
  !OUR_SOCIAL_SUPABASE_PUBLISHABLE_KEY.includes('YOUR_')
) {
  window.ourSocialSupabase = window.supabase.createClient(
    OUR_SOCIAL_SUPABASE_URL,
    OUR_SOCIAL_SUPABASE_PUBLISHABLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    }
  );
}
