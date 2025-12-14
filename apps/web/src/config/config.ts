// Safely access environment variables, falling back to empty object if undefined
const env = (import.meta as any).env || {};

export const config = {
  // Use placeholder values to prevent crashes when env vars are missing
  supabaseUrl: env.VITE_SUPABASE_URL || "https://mock.supabase.co",
  supabaseKey: env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || "mock-key",
  // FORCE MOCK DATA as requested
  dataSource: env.VITE_DATA_SOURCE || "mock",
};