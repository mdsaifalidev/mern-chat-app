import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import asyncHandler from "express-async-handler";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

/**
 * @function sendMessage
 * @description Send a message
 * @route POST /api/v1/messages/send/:id
 * @access Private
 */
const sendMessage = asyncHandler(async (req, res) => {
  const message = req.body?.message;
  const receiverId = req.params?.id;
  const senderId = req.user?._id;

  // Check if the message is empty
  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
  });

  // Create a new conversation if it doesn't exist
  if (!conversation) {
    conversation = await Conversation.create({
      participants: [senderId, receiverId],
    });
  }

  // Create a new message
  const newMessage = await Message.create({
    senderId,
    receiverId,
    message,
  });

  // Add the message to the conversation
  conversation.messages.push(newMessage._id);
  await conversation.save();

  const receiverSocketId = getReceiverSocketId(receiverId);
  if (receiverSocketId) {
    // io.to(<socket_id>).emit() used to send events to specific client
    io.to(receiverSocketId).emit("newMessage", newMessage);
  }

  res
    .status(201)
    .json(new ApiResponse("Message sent successfully", newMessage));
});

const getMessages = asyncHandler(async (req, res) => {
  const userToChatId = req.params?.id;
  const senderId = req.user?._id;

  const conversation = await Conversation.findOne({
    participants: { $all: [senderId, userToChatId] },
  }).populate("messages");

  if (!conversation) {
    return res
      .status(200)
      .json(new ApiResponse("Messages retrieved successfully", []));
  }

  res
    .status(200)
    .json(
      new ApiResponse("Messages retrieved successfully", conversation?.messages)
    );
});

export { sendMessage, getMessages };
