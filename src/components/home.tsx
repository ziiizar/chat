import { useState } from "react";
import ChatSidebar from "./chat/ChatSidebar";
import ConversationPanel from "./chat/ConversationPanel";

const Home = () => {
  const [selectedChatId, setSelectedChatId] = useState<string>();

  return (
    <div className="flex h-screen bg-gray-100">
      <ChatSidebar
        selectedChatId={selectedChatId}
        onChatSelect={setSelectedChatId}
      />
      <div className="flex-1">
        <ConversationPanel selectedChatId={selectedChatId} />
      </div>
    </div>
  );
};

export default Home;
