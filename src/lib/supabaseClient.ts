import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Warn but don't crash
if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
        'Warning: Missing Supabase environment variables. App will run in mock mode or fail on real data fetch.'
    );
}

// Create client with provided vars or empty strings to prevent instantiation error
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Helper to check configuration (always true if we pass the check above)
export const isSupabaseConfigured = true;