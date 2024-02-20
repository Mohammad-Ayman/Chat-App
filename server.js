import express from "express";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3500;

const app = express();

app.use(express.static(path.join(__dirname, "public")));

const expressServer = app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});

const io = new Server(expressServer, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? false
        : ["http://localhost:5500", "http://127.0.0.1:5500"],
  },
});

// Counter for generating unique user IDs
let userIdCounter = 0;

io.on("connection", (socket) => {
  console.log(`User ${socket.id} connected`);

  // Assign a unique user identifier to the connected socket
  const userId = `user-${++userIdCounter}`;

  // Upon connection - only to user
  socket.emit("message", "Welcome to Chat App!");

  // Listening for a message event
  socket.on("message", (data) => {
    console.log(data);
    io.emit("message", `${userId}: ${data}`);
  });

  // Listen for activity
  socket.on("activity", () => {
    socket.broadcast.emit("activity", userId);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`User ${socket.id} disconnected`);
  });
});
