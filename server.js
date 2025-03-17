const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Handle call initiation
    socket.on("call-user", ({ userToCall, signal }) => {
        console.log(`Call from ${socket.id} to ${userToCall}`);
        io.to(userToCall).emit("incoming-call", { from: socket.id, signal });
    });

    // Handle answering the call
    socket.on("answer-call", ({ to, signal }) => {
        console.log(`${socket.id} answered the call from ${to}`);
        io.to(to).emit("call-accepted", { signal });
    });

    // Handle user disconnection
    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

// Serve index.html for all other routes
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
