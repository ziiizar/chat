import { useEffect, useState } from "react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { chatService, Message, Chat } from "@/lib/chat";
import { useAuth } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ConversationPanelProps {
  selectedChatId?: string;
}

const ConversationPanel = ({ selectedChatId }: ConversationPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chat, setChat] = useState<Chat | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (selectedChatId) {
      loadMessages();
      chatService.subscribeToMessages(selectedChatId, (message) => {
        setMessages((prev) => [...prev, message]);
      });
    }

    return () => {
      chatService.unsubscribeFromMessages();
    };
  }, [selectedChatId]);

  const loadMessages = async () => {
    if (!selectedChatId) return;

    try {
      const messages = await chatService.getMessages(selectedChatId);
      setMessages(messages);

      // Load chat details
      const chats = await chatService.listChats();
      const currentChat = chats.find((c) => c.id === selectedChatId);
      setChat(currentChat || null);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedChatId || !user) return;

    try {
      await chatService.sendMessage(selectedChatId, content, user.id);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const getChatName = () => {
    if (!chat || !user) return "";
    const otherParticipants = chat.participants.filter((p) => p.id !== user.id);
    return otherParticipants.map((p) => p.full_name).join(", ");
  };

  if (!selectedChatId) {
    return (
      <div className="flex flex-col h-full bg-white items-center justify-center text-gray-500">
        Select a chat to start messaging
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header */}
      <div className="flex items-center px-6 py-4 border-b border-gray-200 h-[72px]">
        <div className="flex items-center gap-3">
          {chat && (
            <Avatar>
              <AvatarImage
                src={
                  chat.participants.find((p) => p.id !== user?.id)?.avatar_url
                }
              />
              <AvatarFallback>
                {getChatName().charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
          <h2 className="text-lg font-semibold">{getChatName()}</h2>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <MessageList
          messages={messages.map((msg) => ({
            id: msg.id,
            content: msg.content,
            timestamp: msg.created_at,
            sender: msg.sender,
            isSelf: msg.sender.id === user?.id,
          }))}
        />
      </div>

      {/* Message Input */}
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ConversationPanel;
