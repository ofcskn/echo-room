import { config } from '../config/config';
import { IRoomRepository, IMessageRepository } from '../repositories/interfaces';
import { MockRoomRepository, MockMessageRepository } from '../repositories/mockRepository';
import { SupabaseRoomRepository, SupabaseMessageRepository } from '../repositories/supabaseRepository';

const useMock = config.dataSource === 'mock';

// Singleton instances
const roomRepo: IRoomRepository = useMock ? new MockRoomRepository() : new SupabaseRoomRepository();
const messageRepo: IMessageRepository = useMock ? new MockMessageRepository() : new SupabaseMessageRepository();

export const adapters = {
  roomRepository: roomRepo,
  messageRepository: messageRepo,
};
