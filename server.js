const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { 
    cors: { 
        origin: process.env.NODE_ENV === "development" ? "*" : ["https://call-app-ypk7.onrender.com"] 
    } 
});

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Validate and handle call initiation
    socket.on("call-user", (data) => {
        if (!data?.userToCall || !data?.signal) {
            return socket.emit("error", "Invalid call request");
        }
        
        const targetSocket = io.sockets.sockets.get(data.userToCall);
        if (!targetSocket) {
            return socket.emit("error", "User not available");
        }

        io.to(data.userToCall).emit("incoming-call", { 
            from: socket.id, 
            signal: data.signal 
        });
    });

    // Handle call answer
    socket.on("answer-call", (data) => {
        if (!data?.to || !data?.signal) {
            return socket.emit("error", "Invalid answer");
        }
        io.to(data.to).emit("call-accepted", { 
            signal: data.signal 
        });
    });

    // Relay ICE candidates
    socket.on("ice-candidate", (data) => {
        if (!data?.to || !data?.candidate) return;
        io.to(data.to).emit("ice-candidate", { 
            candidate: data.candidate 
        });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        socket.broadcast.emit("user-disconnected", socket.id);
    });
});

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
