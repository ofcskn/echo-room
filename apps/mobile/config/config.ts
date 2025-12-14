export const config = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co',
  supabaseKey: process.env.EXPO_PUBLIC_SUPABASE_KEY || 'mock-key',
  dataSource: process.env.EXPO_PUBLIC_DATA_SOURCE || 'mock',
};
