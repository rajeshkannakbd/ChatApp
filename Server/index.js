import express from "express";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
import { Server } from "socket.io";

import { connectDB } from "./lib/db.js";
import userRouter from "./Routes/userRoutes.js";
import messageRouter from "./Routes/messageRoutes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(
  cors({
    origin: "https://chat-app-client-phi-six.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));

// Socket.IO
export const io = new Server(server, {
  cors: {
    origin: "https://chat-app-client-phi-six.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// Online users map
export const userSocketMap = {};

// Socket connection
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  console.log("User Connected:", userId);

  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  // Send online users
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Disconnect
  socket.on("disconnect", () => {
    console.log("User Disconnected:", userId);

    delete userSocketMap[userId];

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// Routes
app.get("/api/status", (req, res) => {
  res.send("API is working");
});

app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// Database connection
await connectDB();

// Server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});

export default server;