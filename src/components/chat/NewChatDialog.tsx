import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { chatService, Profile } from "@/lib/chat";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface NewChatDialogProps {
  onChatCreated?: (chatId: string) => void;
}

export default function NewChatDialog({ onChatCreated }: NewChatDialogProps) {
  const [users, setUsers] = useState<Profile[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isGroup, setIsGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    } else {
      // Reset state when dialog closes
      setSelectedUsers([]);
      setSearchQuery("");
      setIsGroup(false);
      setGroupName("");
    }
  }, [isOpen]);

  const loadUsers = async () => {
    try {
      const users = await chatService.listUsers();
      setUsers(users.filter((u) => u.id !== user?.id));
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleCreateChat = async () => {
    if (selectedUsers.length === 0) return;

    try {
      const chatId = await chatService.createChat(
        [user?.id!, ...selectedUsers],
        isGroup,
        isGroup ? groupName : undefined,
      );
      onChatCreated?.(chatId);
      setIsOpen(false);
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  const isCreateDisabled =
    selectedUsers.length === 0 || (isGroup && !groupName.trim());

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          New Chat
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Chat</DialogTitle>
        </DialogHeader>
        <Tabs
          defaultValue="direct"
          className="w-full"
          onValueChange={(value) => setIsGroup(value === "group")}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="direct">Direct Message</TabsTrigger>
            <TabsTrigger value="group">Group Chat</TabsTrigger>
          </TabsList>
          <TabsContent value="direct">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <Input
                  placeholder="Search users..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <UserList
                users={filteredUsers}
                selectedUsers={selectedUsers}
                setSelectedUsers={setSelectedUsers}
                maxSelect={1}
              />
            </div>
          </TabsContent>
          <TabsContent value="group">
            <div className="space-y-4">
              <div>
                <Label htmlFor="groupName">Group Name</Label>
                <Input
                  id="groupName"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter group name"
                />
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <Input
                  placeholder="Search users..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <UserList
                users={filteredUsers}
                selectedUsers={selectedUsers}
                setSelectedUsers={setSelectedUsers}
              />
            </div>
          </TabsContent>
        </Tabs>
        <Button
          onClick={handleCreateChat}
          disabled={isCreateDisabled}
          className="w-full mt-4"
        >
          Create {isGroup ? "Group" : "Chat"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

interface UserListProps {
  users: Profile[];
  selectedUsers: string[];
  setSelectedUsers: (users: string[]) => void;
  maxSelect?: number;
}

function UserList({
  users,
  selectedUsers,
  setSelectedUsers,
  maxSelect,
}: UserListProps) {
  return (
    <ScrollArea className="h-[300px] pr-4">
      <div className="space-y-2">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center space-x-3 p-2 rounded hover:bg-accent"
          >
            <Checkbox
              id={user.id}
              checked={selectedUsers.includes(user.id)}
              onCheckedChange={(checked) => {
                if (checked) {
                  if (maxSelect === 1) {
                    setSelectedUsers([user.id]);
                  } else {
                    setSelectedUsers([...selectedUsers, user.id]);
                  }
                } else {
                  setSelectedUsers(
                    selectedUsers.filter((id) => id !== user.id),
                  );
                }
              }}
            />
            <Avatar>
              <AvatarImage src={user.avatar_url} />
              <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user.full_name}</p>
              <p className="text-sm text-gray-500">@{user.username}</p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
