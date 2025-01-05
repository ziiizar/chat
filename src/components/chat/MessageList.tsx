import React from "react";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar: string;
  };
  timestamp: string;
  isRead: boolean;
  isSelf: boolean;
};

type MessageListProps = {
  messages: Message[];
};

const defaultMessages: Message[] = [
  {
    id: "1",
    content: "Hey, how are you?",
    sender: {
      id: "1",
      name: "John Doe",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
    },
    timestamp: "9:41 AM",
    isRead: true,
    isSelf: false,
  },
  {
    id: "2",
    content: "I'm doing great! How about you?",
    sender: {
      id: "2",
      name: "Current User",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=current",
    },
    timestamp: "9:42 AM",
    isRead: true,
    isSelf: true,
  },
  {
    id: "3",
    content: "Just working on some new features. The weather is nice today!",
    sender: {
      id: "1",
      name: "John Doe",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
    },
    timestamp: "9:45 AM",
    isRead: false,
    isSelf: false,
  },
];

const MessageList = ({ messages = defaultMessages }: MessageListProps) => {
  return (
    <div className="h-full bg-background">
      <ScrollArea className="h-full px-4">
        <div className="flex flex-col space-y-4 py-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex items-start space-x-2",
                message.isSelf
                  ? "flex-row-reverse space-x-reverse"
                  : "flex-row",
              )}
            >
              <Avatar
                className="h-8 w-8"
                src={message.sender.avatar}
                alt={message.sender.name}
              />
              <div
                className={cn(
                  "flex flex-col space-y-1",
                  message.isSelf ? "items-end" : "items-start",
                )}
              >
                <div
                  className={cn(
                    "rounded-lg px-4 py-2 max-w-[70%]",
                    message.isSelf
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted",
                  )}
                >
                  {message.content}
                </div>
                <span className="text-xs text-muted-foreground">
                  {message.timestamp}
                  {message.isSelf && (
                    <span className="ml-2">{message.isRead ? "✓✓" : "✓"}</span>
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default MessageList;
