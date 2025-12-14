
import { config } from '../config/config';
import { IRoomRepository, IMessageRepository, IAuthRepository } from '../repositories/interfaces';
import { MockRoomRepository, MockMessageRepository, MockAuthRepository } from '../repositories/mockRepository';
import { SupabaseRoomRepository, SupabaseMessageRepository, SupabaseAuthRepository } from '../repositories/supabaseRepository';

const useMock = config.dataSource === 'mock';

// Singleton instances
const authRepo: IAuthRepository = useMock ? new MockAuthRepository() : new SupabaseAuthRepository();
const roomRepo: IRoomRepository = useMock
  ? new MockRoomRepository(authRepo as MockAuthRepository)
  : new SupabaseRoomRepository();
const messageRepo: IMessageRepository = useMock
  ? new MockMessageRepository(authRepo as MockAuthRepository)
  : new SupabaseMessageRepository();

export const adapters = {
  roomRepository: roomRepo,
  messageRepository: messageRepo,
  authRepository: authRepo,
};
