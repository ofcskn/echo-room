import { createClient } from '@supabase/supabase-js';
import { config } from '../config/config';

if (!config.supabaseUrl || !config.supabaseKey) {
  console.warn("Supabase credentials missing. Ensure .env is set.");
}

export const supabase = createClient(config.supabaseUrl || '', config.supabaseKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});
