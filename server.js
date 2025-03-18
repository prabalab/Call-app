const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const { ExpressPeerServer } = require("peer");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { 
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Enable CORS
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

// Configure PeerJS server
const peerServer = ExpressPeerServer(server, {
    debug: true,
    path: "/peerjs",
    proxied: true, // Important for hosted environments
    allow_discovery: true
});

app.use("/peerjs", peerServer);

// Add event listeners for PeerJS server
peerServer.on('connection', (client) => {
    console.log('PeerJS client connected:', client.getId());
});

peerServer.on('disconnect', (client) => {
    console.log('PeerJS client disconnected:', client.getId());
});

// Socket.io signaling
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-room", (roomId, userId) => {
        socket.join(roomId);
        socket.to(roomId).emit("user-connected", userId);
        
        socket.on("disconnect", () => {
            socket.to(roomId).emit("user-disconnected", userId);
        });
    });

    socket.on("call-user", (data) => {
        io.to(data.userToCall).emit("incoming-call", {
            from: socket.id,
            signal: data.signal,
            userId: data.userId
        });
    });

    socket.on("answer-call", (data) => {
        io.to(data.to).emit("call-accepted", {
            signal: data.signal,
            userId: data.userId
        });
    });
});

// Routes
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
