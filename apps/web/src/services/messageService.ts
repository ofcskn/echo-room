
import { adapters } from '../adapters';
import { MessageRow } from '../types';

export const MessageService = {
  async sendMessage(roomId: string, senderId: string, content: string): Promise<MessageRow> {
    // Idempotency: client_msg_id generation
    const clientMsgId = crypto.randomUUID();
    return await adapters.messageRepository.sendMessage({
      roomId,
      senderId,
      content,
      clientMsgId
    });
  },

  async loadMessages(roomId: string): Promise<MessageRow[]> {
    return await adapters.messageRepository.getMessages(roomId);
  },

  subscribe(roomId: string, onMessage: (msg: MessageRow) => void, onStatusChange?: (status: any) => void) {
    return adapters.messageRepository.subscribeToMessages(roomId, onMessage, onStatusChange);
  },

  subscribeToPresence(roomId: string, userId: string, onCountChange: (count: number) => void) {
    return adapters.messageRepository.subscribeToPresence(roomId, userId, onCountChange);
  }
};
