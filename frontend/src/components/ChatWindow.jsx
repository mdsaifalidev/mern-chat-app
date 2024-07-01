import { useState, useEffect } from "react";
import {
  Button,
  InputGroup,
  FormControl,
  Image,
  Spinner,
} from "react-bootstrap";
import { axiosInstance } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { extractTime } from "../utils/extractTime";
import { toast } from "react-hot-toast";

const ChatWindow = ({ chat }) => {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  useEffect(() => {
    setIsChatLoading(true);
    const fetchChat = async () => {
      try {
        const response = await axiosInstance.get(
          `/api/v1/messages/${chat._id}`
        );
        setMessages(response.data?.data);
      } catch (error) {
        toast.error(error.response.data?.message || "Something went wrong.");
      } finally {
        setIsChatLoading(false);
      }
    };
    if (chat) {
      fetchChat();
    }
  }, [chat]);

  const sendMessage = async () => {
    setIsSendingMessage(true);
    try {
      const response = await axiosInstance.post(
        `/api/v1/messages/send/${chat._id}`,
        { message: newMessage }
      );
      setMessages([...messages, response.data?.data]);
      setNewMessage("");
    } catch (error) {
      toast.error(error.response.data?.message || "Something went wrong.");
    } finally {
      setIsSendingMessage(false);
    }
  };

  useEffect(() => {
    socket?.on("newMessage", (newMessage) => {
      setMessages([...messages, newMessage]);
    });

    return () => socket?.off("newMessage");
  }, [socket, setMessages, messages]);

  const isActive = (userId) => onlineUsers.includes(userId);

  if (!chat) {
    return (
      <div
        className="col-md-8 chat-window align-items-center"
        style={{ flexDirection: "unset", justifyContent: "center" }}
      >
        <div className="text-center">
          <h3>Welcome, {user?.fullName}</h3>
          <p className="mb-0">Select a chat to start messaging.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="col-md-8 chat-window">
      <div className="chat-header d-flex align-items-center border-bottom p-3">
        <Image
          src={chat.avatar}
          roundedCircle
          width={40}
          height={40}
          className="mr-3"
        />
        <div className="user-info">
          <div className="name">{chat.fullName}</div>
          <div className="active">
            {" "}
            {isActive(chat._id) ? "Online" : "Offline"}
          </div>
        </div>
      </div>
      <div className="messages flex-grow-1 overflow-auto p-3">
        {isChatLoading ? (
          <div className="text-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : messages && messages.length > 0 ? (
          messages.map((message, index) => (
            <div
              key={index}
              className={`message ${
                message.senderId === user._id ? "sent" : "received"
              } d-flex mb-3`}
            >
              <div className="message-text p-2 rounded">
                {message.message}
                <div className="timestamp small text-muted">
                  {extractTime(message.createdAt)}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center">No messages</div>
        )}
      </div>
      <InputGroup className="mb-3">
        <FormControl
          placeholder="Type a message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        {isSendingMessage ? (
          <Button variant="primary" disabled>
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
            />{" "}
            Sending...
          </Button>
        ) : (
          <Button type="submit" onClick={sendMessage}>
            Send
          </Button>
        )}
      </InputGroup>
    </div>
  );
};

export default ChatWindow;
