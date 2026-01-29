import express from "express";
import cors from "cors";
import http from "http";
import { configDotenv } from "dotenv";
import { connectDB } from "./lib/db.js";
import userRouter from "./Routes/userRoutes.js";
import messageRouter from "./Routes/messageRoutes.js";
import { Server } from "socket.io";

const app = express();

const server = http.createServer(app);
app.use(express.json({ limit: "50mb" }));
app.use(cors());
configDotenv();

//initialize soocket.io
export const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});
export const userSocketMap = {}; // userId & socketId
// socket io connection handler
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("user connected", userId);

  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("user Disconnected", userId);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

app.use("/api/status", (req, res) => {
  res.send("API is working");
});
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

await connectDB();

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;

  server.listen(PORT, () => {
    console.log("Server is running on PORT", PORT);
  });
}

export default server;
