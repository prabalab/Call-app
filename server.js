const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("call-user", (data) => {
        io.to(data.userToCall).emit("incoming-call", { from: socket.id, signal: data.signal });
    });

    socket.on("answer-call", (data) => {
        io.to(data.to).emit("call-accepted", data.signal);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

server.listen(5000, () => console.log("Server running on port 5000"));
