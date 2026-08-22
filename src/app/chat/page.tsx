import type { Metadata } from 'next';

import { ChatPanel } from '@/components/chat/chat-panel';

export const metadata: Metadata = {
  title: 'Assistant',
  description: 'Ask questions about this repository.',
};

export default function ChatPage() {
  return <ChatPanel />;
}
