import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
let client;
// Defer configuration errors to the backend feature that needs the client.
// Public marketing pages remain usable without credentials; no fake project/key is used.
export const supabase = new Proxy({}, {
  get(_target, property) {
    if (!isSupabaseConfigured) throw new Error('Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to use account features.');
    client ??= createClient(supabaseUrl, supabaseAnonKey);
    const value = client[property];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
