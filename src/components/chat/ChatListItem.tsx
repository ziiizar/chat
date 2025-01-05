import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

interface ChatListItemProps {
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline?: boolean;
  isGroup?: boolean;
}

const ChatListItem = ({
  name = "John Doe",
  avatar,
  lastMessage = "Hey, how are you?",
  timestamp = "12:30 PM",
  unreadCount = 2,
  isOnline = false,
  isGroup = false,
}: ChatListItemProps) => {
  return (
    <div className="flex items-center gap-3 p-4 hover:bg-gray-100 cursor-pointer bg-white border-b border-gray-200 h-[72px]">
      <div className="relative">
        {isGroup ? (
          <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </div>
        ) : (
          <Avatar>
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
          </Avatar>
        )}
        {!isGroup && isOnline && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold truncate">{name}</h3>
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {timestamp}
          </span>
        </div>
        <p className="text-sm text-gray-600 truncate">{lastMessage}</p>
      </div>

      {unreadCount > 0 && (
        <Badge
          variant="secondary"
          className="rounded-full bg-blue-500 text-white"
        >
          {unreadCount}
        </Badge>
      )}
    </div>
  );
};

export default ChatListItem;
