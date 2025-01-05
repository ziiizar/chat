import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Smile, Paperclip, Send } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MessageInputProps {
  onSendMessage?: (message: string) => void;
  onAttachFile?: (file: File) => void;
  disabled?: boolean;
}

const MessageInput = ({
  onSendMessage = () => {},
  onAttachFile = () => {},
  disabled = false,
}: MessageInputProps) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.size <= 10 * 1024 * 1024) {
      // 10MB limit
      onAttachFile(file);
    }
  };

  return (
    <div className="bg-white border-t p-4 flex items-end gap-2 h-[120px]">
      <div className="flex-1 flex gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                disabled={disabled}
              >
                <Smile className="h-5 w-5 text-gray-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Add emoji</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Input
                  type="file"
                  className="hidden"
                  id="file-upload"
                  onChange={handleFileChange}
                  accept="image/*,.pdf,.doc,.docx"
                  disabled={disabled}
                />
                <label htmlFor="file-upload">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10"
                    disabled={disabled}
                    asChild
                  >
                    <span>
                      <Paperclip className="h-5 w-5 text-gray-500" />
                    </span>
                  </Button>
                </label>
              </div>
            </TooltipTrigger>
            <TooltipContent>Attach file (max 10MB)</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
          disabled={disabled}
          onKeyPress={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
      </div>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleSend}
              disabled={!message.trim() || disabled}
              size="icon"
            >
              <Send className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Send message</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default MessageInput;
