// Cliente Supabase único. Requiere cargar antes vendor/supabase.js (UMD → window.supabase).
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config/supabase.js';
export const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, storageKey: 'gpulab.auth' }
});
