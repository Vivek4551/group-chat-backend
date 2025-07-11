const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = 3000;
let messageHistory = [];

io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  socket.on("join", (username) => {
    socket.username = username;
    socket.emit("messageHistory", messageHistory);
    io.emit("system", `${username} joined the chat`);
  });

  socket.on("sendMessage", (msg) => {
    const message = {
      id: Date.now(),
      text: msg,
      username: socket.username,
      timestamp: new Date().toISOString()
    };
    messageHistory.push(message);
    if (messageHistory.length > 20) messageHistory.shift();
    io.emit("receiveMessage", message);
  });

  socket.on("disconnect", () => {
    if (socket.username) {
      io.emit("system", `${socket.username} left the chat`);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
