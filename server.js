const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("call-user", (data) => {
        console.log(`Call from ${socket.id} to ${data.userToCall}`);
        io.to(data.userToCall).emit("incoming-call", { from: socket.id, signal: data.signal });
    });

    socket.on("answer-call", (data) => {
        console.log(`${socket.id} answered the call from ${data.to}`);
        io.to(data.to).emit("call-accepted", { signal: data.signal });
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

// Handle all other routes and serve index.html
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
