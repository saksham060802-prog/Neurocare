import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseKey && supabaseUrl.startsWith('http'));
};

export const getSupabaseClient = () => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  return createClient(supabaseUrl, supabaseKey);
};

export const checkSupabaseConnection = async () => {
  const configured = isSupabaseConfigured();
  if (!configured) {
    return { configured: false, connected: false, message: 'Supabase credentials not configured in environment variables' };
  }
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { configured: false, connected: false, message: 'Could not initialize Supabase client' };
    }
    const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    if (error && error.code !== 'PGRST116') {
      return { configured: true, connected: false, error: error.message };
    }
    return { configured: true, connected: true };
  } catch (e: any) {
    return { configured: true, connected: false, error: e.message };
  }
};
