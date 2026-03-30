// ═══════════════════════════════════════════════════════════════════
// FILO — Supabase Client
// ═══════════════════════════════════════════════════════════════════
//
// Requires: npm install @supabase/supabase-js
//
// This module creates and exports a singleton Supabase client
// configured from environment variables.
// ═══════════════════════════════════════════════════════════════════

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[FILO] Supabase environment variables are missing. " +
    "Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file."
  );
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export default supabase;
