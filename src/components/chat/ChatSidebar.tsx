import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search, Share2 } from "lucide-react";
import ChatListItem from "./ChatListItem";
import NewChatDialog from "./NewChatDialog";
import { chatService, Chat } from "@/lib/chat";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

interface ChatSidebarProps {
  selectedChatId?: string;
  onChatSelect?: (chatId: string) => void;
}

const ChatSidebar = ({
  selectedChatId = "",
  onChatSelect = () => {},
}: ChatSidebarProps) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();

  const loadChats = async () => {
    try {
      const chats = await chatService.listChats();
      setChats(chats);
    } catch (error) {
      console.error("Error loading chats:", error);
    }
  };

  useEffect(() => {
    loadChats();
  }, []);

  const handleInvite = () => {
    const message = encodeURIComponent(
      "🎵 El disco de Bad Bunny está bueno! 🔥\n\n" +
        "¡Hey! Te invito a unirte a nuestra app de chat. Aquí podemos hablar sobre música, crear grupos y compartir más recomendaciones. \n\n" +
        "Únete aquí: https://recursing-black1-mmclc.dev.tempolabs.ai",
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  const filteredChats = chats.filter((chat) => {
    if (chat.is_group) {
      return chat.name?.toLowerCase().includes(searchQuery.toLowerCase());
    }
    const otherParticipants = chat.participants.filter(
      (p) => p.id !== user?.id,
    );
    return otherParticipants.some(
      (p) =>
        p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.full_name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  });

  const getChatName = (chat: Chat) => {
    if (chat.is_group) {
      return chat.name || "Unnamed Group";
    }
    const otherParticipants = chat.participants.filter(
      (p) => p.id !== user?.id,
    );
    return otherParticipants.map((p) => p.full_name).join(", ");
  };

  const getChatAvatar = (chat: Chat) => {
    if (chat.is_group) {
      return undefined; // Will show group icon instead
    }
    const otherParticipants = chat.participants.filter(
      (p) => p.id !== user?.id,
    );
    return otherParticipants[0]?.avatar_url;
  };

  return (
    <div className="w-[280px] h-full border-r bg-white flex flex-col">
      <div className="p-4 space-y-4 border-b">
        <div className="flex gap-2">
          <NewChatDialog onChatCreated={loadChats} />
          <Button
            variant="outline"
            size="icon"
            onClick={handleInvite}
            className="shrink-0"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input
            placeholder="Search chats..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="flex flex-col">
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => onChatSelect(chat.id)}
              className={selectedChatId === chat.id ? "bg-gray-100" : ""}
            >
              <ChatListItem
                name={getChatName(chat)}
                avatar={getChatAvatar(chat)}
                lastMessage={chat.last_message?.content || ""}
                timestamp={chat.last_message?.created_at || chat.created_at}
                unreadCount={chat.unread_count}
                isGroup={chat.is_group}
              />
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChatSidebar;
