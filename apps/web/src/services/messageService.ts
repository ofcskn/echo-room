
import { adapters } from '../adapters';
import { MessageRow } from '../types';

export const MessageService = {
 async loadMessages(roomId: string): Promise<MessageRow[]> {
    return adapters.messageRepository.getMessages(roomId);
  },

  async sendMessage(roomId: string, content: string): Promise<void> {
    const clientMsgId = crypto.randomUUID();
    await adapters.messageRepository.sendMessage(roomId, content, clientMsgId);
  },

  subscribe(
    roomId: string,
    onMessage: (msg: MessageRow) => void,
    onStatusChange?: (status: "SUBSCRIBED" | "CLOSED" | "CHANNEL_ERROR") => void
  ): () => void {
    return adapters.messageRepository.subscribeToMessages(
      roomId,
      onMessage,
      onStatusChange
    );
  },

  subscribeToPresence(
    roomId: string,
    onCountChange: (count: number) => void
  ): () => void {
    return adapters.messageRepository.subscribeToPresence(roomId, onCountChange);
  }
};
