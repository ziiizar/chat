import { supabase } from "./supabase";
import { RealtimeChannel } from "@supabase/supabase-js";

export interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
}

export interface Chat {
  id: string;
  created_at: string;
  updated_at: string;
  is_group: boolean;
  name?: string;
  created_by?: string;
  participants: Profile[];
  last_message?: {
    content: string;
    created_at: string;
    sender: Profile;
  };
  unread_count: number;
}

export interface Message {
  id: string;
  chat_id: string;
  content: string;
  created_at: string;
  sender: Profile;
}

export interface ChatParticipant {
  user: Profile;
  is_admin: boolean;
}

let messageSubscription: RealtimeChannel | null = null;

export const chatService = {
  async listChats(): Promise<Chat[]> {
    // First get all chats the user is part of
    const { data: userChats, error: chatsError } = await supabase
      .from("chat_participants")
      .select("chat_id")
      .order("created_at", { ascending: false });

    if (chatsError) throw chatsError;
    if (!userChats?.length) return [];

    const chatIds = userChats.map((uc) => uc.chat_id);

    // Get chat details
    const { data: chats, error: chatDetailsError } = await supabase
      .from("chats")
      .select("*")
      .in("id", chatIds)
      .order("updated_at", { ascending: false });

    if (chatDetailsError) throw chatDetailsError;
    if (!chats) return [];

    // Get participants for all chats
    const { data: participants, error: participantsError } = await supabase
      .from("chat_participants")
      .select("chat_id, is_admin, profiles(*)")
      .in("chat_id", chatIds);

    if (participantsError) throw participantsError;

    // Get last message for each chat
    const { data: lastMessages, error: messagesError } = await supabase
      .from("messages")
      .select("id, content, created_at, chat_id, profiles(*)")
      .in("chat_id", chatIds)
      .order("created_at", { ascending: false });

    if (messagesError) throw messagesError;

    // Combine all the data
    return chats.map((chat) => {
      const chatParticipants =
        participants
          ?.filter((p) => p.chat_id === chat.id)
          .map((p) => p.profiles) || [];

      const chatMessages =
        lastMessages?.filter((m) => m.chat_id === chat.id) || [];
      const lastMessage = chatMessages[0];

      return {
        id: chat.id,
        created_at: chat.created_at,
        updated_at: chat.updated_at,
        is_group: chat.is_group,
        name: chat.name,
        created_by: chat.created_by,
        participants: chatParticipants,
        last_message: lastMessage
          ? {
              content: lastMessage.content,
              created_at: lastMessage.created_at,
              sender: lastMessage.profiles,
            }
          : undefined,
        unread_count: 0, // TODO: Implement unread count
      };
    });
  },

  async listUsers(): Promise<Profile[]> {
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("*");

    if (error) throw error;
    return profiles || [];
  },

  async createChat(
    participantIds: string[],
    isGroup: boolean = false,
    groupName?: string,
  ): Promise<string> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Insert new chat
    const { data: chatData, error: chatError } = await supabase
      .from("chats")
      .insert({
        is_group: isGroup,
        name: groupName,
        created_by: user.id,
      })
      .select()
      .single();

    if (chatError) throw chatError;

    // Add participants
    const participants = participantIds.map((userId) => ({
      chat_id: chatData.id,
      user_id: userId,
      is_admin: userId === user.id && isGroup, // Creator is admin for group chats
    }));

    const { error: participantError } = await supabase
      .from("chat_participants")
      .insert(participants);

    if (participantError) throw participantError;

    return chatData.id;
  },

  async getMessages(chatId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from("messages")
      .select("*, profiles(*)")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return (data || []).map((message) => ({
      ...message,
      sender: message.profiles,
    }));
  },

  async sendMessage(
    chatId: string,
    content: string,
    senderId: string,
  ): Promise<void> {
    const { error } = await supabase.from("messages").insert({
      chat_id: chatId,
      content,
      sender_id: senderId,
    });

    if (error) throw error;
  },

  async addParticipants(chatId: string, userIds: string[]): Promise<void> {
    const participants = userIds.map((userId) => ({
      chat_id: chatId,
      user_id: userId,
      is_admin: false,
    }));

    const { error } = await supabase
      .from("chat_participants")
      .insert(participants);

    if (error) throw error;
  },

  async removeParticipant(chatId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from("chat_participants")
      .delete()
      .eq("chat_id", chatId)
      .eq("user_id", userId);

    if (error) throw error;
  },

  async updateGroupName(chatId: string, name: string): Promise<void> {
    const { error } = await supabase
      .from("chats")
      .update({ name })
      .eq("id", chatId);

    if (error) throw error;
  },

  subscribeToMessages(
    chatId: string,
    onMessage: (message: Message) => void,
  ): void {
    // Unsubscribe from previous subscription if exists
    if (messageSubscription) {
      messageSubscription.unsubscribe();
    }

    messageSubscription = supabase
      .channel(`chat:${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`,
        },
        async (payload) => {
          // Fetch the complete message with sender information
          const { data, error } = await supabase
            .from("messages")
            .select("*, profiles(*)")
            .eq("id", payload.new.id)
            .single();

          if (!error && data) {
            onMessage({
              ...data,
              sender: data.profiles,
            });
          }
        },
      )
      .subscribe();
  },

  unsubscribeFromMessages(): void {
    if (messageSubscription) {
      messageSubscription.unsubscribe();
      messageSubscription = null;
    }
  },
};
