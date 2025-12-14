import { adapters } from "../adapters";

export const AuthService = {
  async ensureAuthenticated(): Promise<void> {
    await adapters.authRepository.ensureAuthenticated();
  }
};
