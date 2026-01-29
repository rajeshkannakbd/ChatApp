import Message from "../Models/Message.js";
import User from "../Models/User.js";
import { io, userSocketMap } from "../index.js";
import cloudinary from "../lib/cloudinary.js";

// get all users except logged-in user
export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user; // ✅ FIX

    const filteredUsers = await User.find({
      _id: { $ne: userId },
    }).select("-password");

    const unseenMessages = {};

    await Promise.all(
      filteredUsers.map(async (user) => {
        const count = await Message.countDocuments({
          senderId: user._id,
          receiverId: userId,
          seen: false,
        });
        if (count > 0) unseenMessages[user._id] = count;
      }),
    );

    res.status(200).json({ users: filteredUsers, unseenMessages });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// get messages with selected user
export const getMessages = async (req, res) => {
  try {
    const selectedUserId = req.params.id;
    const myId = req.user; // ✅ FIX

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: myId },
      ],
    });

    await Message.updateMany(
      { senderId: selectedUserId, receiverId: myId, seen: false },
      { $set: { seen: true } },
    );

    res.status(200).json({ messages });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// mark messages as seen
export const markMessagesAsSeen = async (req, res) => {
  try {
    const messageId = req.params.id;

    await Message.findByIdAndUpdate(messageId, {
      seen: true,
    });

    res.status(200).json({ message: "Message marked as seen" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// send message
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user; // ✅ FIX
    const receiverId = req.params.id;
    const { text, image } = req.body;

    let imageUrl = "";
    if (image) {
      const upload = await cloudinary.uploader.upload(image);
      imageUrl = upload.secure_url;
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json({ message: newMessage });
  } catch (error) {
  console.error("IMAGE SEND ERROR:", error);
  res.status(400).json({
    message: error.message,
    cloudinaryError: error?.error || null,
  });
}
};
