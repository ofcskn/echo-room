import { supabase } from '../utils/supabase';
import { config } from '../config/config';

export const AuthService = {
  async getUserId(): Promise<string> {
    if (config.dataSource === 'mock') {
      // Return a stable mock ID for the session to persist identity across refreshes
      let mockId = localStorage.getItem('echo_mock_user_id');
      if (!mockId) {
        mockId = crypto.randomUUID();
        localStorage.setItem('echo_mock_user_id', mockId);
      }
      return mockId;
    }

    // Real Supabase Auth Flow
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) return user.id;

    const { data: anonUser, error } = await supabase.auth.signInAnonymously();
    if (error || !anonUser.user) {
      console.error("Auth Error:", error);
      throw new Error("Authentication failed");
    }
    return anonUser.user.id;
  }
};