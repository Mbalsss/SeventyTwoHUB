import { createClient } from '@supabase/supabase-js';

// Environment variables with validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl) {
  console.error('Missing VITE_SUPABASE_URL environment variable');
  throw new Error('Supabase URL is required. Please check your .env file.');
}

if (!supabaseKey) {
  console.error('Missing VITE_SUPABASE_ANON_KEY environment variable');
  throw new Error('Supabase Anon Key is required. Please check your .env file.');
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch {
  throw new Error('Invalid Supabase URL format. Please check your .env file.');
}

// Create Supabase client with optimized configuration
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false, // Disable to prevent router conflicts
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'bizboost-hub@1.0.0'
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Test connection on initialization (non-blocking)
supabase.auth.getSession()
  .then(({ data, error }) => {
    if (error) {
      console.warn('Supabase connection test failed:', error.message);
    } else {
      console.log('Supabase client initialized successfully');
    }
  })
  .catch(err => {
    console.warn('Supabase initialization warning:', err.message);
  });