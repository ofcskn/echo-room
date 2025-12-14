import { adapters } from '../adapters';

export const AuthService = {
  async ensureAuthenticated(): Promise<void> {
    await adapters.authRepository.ensureAuthenticated();
  },

  async getUserId(): Promise<string> {
    await adapters.authRepository.ensureAuthenticated();
    return adapters.authRepository.getUserId();
  },
};
