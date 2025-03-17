const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Enable CORS and serve static files from the "public" folder
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

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

// Handle all other routes and serve index.html
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Set the server to listen on a specific port
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
