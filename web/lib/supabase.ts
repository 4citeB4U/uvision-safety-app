import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

// Only create the client when credentials are present; otherwise return a
// stub that always resolves with empty data so the app builds without .env.
function buildClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = buildClient();

export interface Incident {
  id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  max_g_force: number;
  incident_type: 'freefall' | 'impact' | 'panic';
}
