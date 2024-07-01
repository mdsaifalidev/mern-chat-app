import { useState } from "react";
import ChatList from "../components/ChatList";
import ChatWindow from "../components/ChatWindow";

const Home = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  return (
    <div className="container-fluid">
      <div className="row no-gutters">
        <ChatList selectChat={setSelectedChat} />
        <ChatWindow chat={selectedChat} />
      </div>
    </div>
  );
};

export default Home;
