import { config } from '../config/config';
import { IAuthRepository, IMessageRepository, IRoomRepository } from '../repositories/interfaces';
import { MockAuthRepository, MockMessageRepository, MockRoomRepository } from '../repositories/mockRepository';
import { SupabaseAuthRepository, SupabaseMessageRepository, SupabaseRoomRepository } from '../repositories/supabaseRepository';

const useMock = config.dataSource === 'mock';

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
