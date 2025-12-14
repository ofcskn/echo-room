import { adapters } from '../adapters';
import { MessageRow } from '../types';
import { generateId } from '../utils/uuid';

export const MessageService = {
  async loadMessages(roomId: string): Promise<MessageRow[]> {
    return adapters.messageRepository.getMessages(roomId);
  },

  async sendMessage(roomId: string, content: string, clientMsgId?: string): Promise<MessageRow> {
    const msgId = clientMsgId ?? generateId();
    return adapters.messageRepository.sendMessage(roomId, content, msgId);
  },

  subscribe(
    roomId: string,
    onMessage: (msg: MessageRow) => void,
    onStatusChange?: (status: 'SUBSCRIBED' | 'CLOSED' | 'CHANNEL_ERROR') => void,
  ): () => void {
    return adapters.messageRepository.subscribeToMessages(roomId, onMessage, onStatusChange);
  },

  subscribeToPresence(roomId: string, onCountChange: (count: number) => void): () => void {
    return adapters.messageRepository.subscribeToPresence(roomId, onCountChange);
  },
};
