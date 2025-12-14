
import { adapters } from '../adapters';

export const AuthService = {
  async getUserId(): Promise<string> {
    return await adapters.authRepository.getUserId();
  }
};
