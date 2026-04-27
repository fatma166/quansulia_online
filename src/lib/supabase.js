import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qaioxhpcyzmamcvdqqub.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaW94aHBjeXptYW1jdmRxcXViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2ODk5MjksImV4cCI6MjA3NTI2NTkyOX0.ONSoZu18CxounMDqf0byUuD6pRhiGSrSJnT3dqoXCjQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  db: {
    schema: 'public',
  },
  realtime: {
    timeout: 10000,
  },
});
