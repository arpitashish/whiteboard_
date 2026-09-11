const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const connectToDB = require('./config/db')
const { Server } = require("socket.io");
const http = require("http");
const Canvas = require("./models/canvasModel");



const userRoutes = require("./routes/userRoutes");
const canvasRoutes = require("./routes/canvasRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/canvas", canvasRoutes);


connectToDB();

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
      origin: ["http://localhost:3000", "https://whiteboard-xi-beryl.vercel.app"], 
      methods: ["GET", "POST"],
    },
  });

let canvasData = {};

let i = 0;

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("joinCanvas", async ({ canvasId }) => {
        console.log("Joining canvas:", canvasId);

        try {
            const canvas = await Canvas.findById(canvasId);

            console.log(canvas);

            if (!canvas) {
                console.log("Canvas not found.");
                return;
            }

            socket.join(canvasId);

            console.log(`User ${socket.id} joined canvas ${canvasId}`);

            if (canvasData[canvasId]) {
                socket.emit("loadCanvas", canvasData[canvasId]);
            } else {
                socket.emit("loadCanvas", canvas.elements || []);
            }

        } catch (error) {
            console.error("Error joining canvas:", error);
        }
    });

    socket.on("drawingUpdate", async ({ canvasId, elements }) => {
        try {
            canvasData[canvasId] = elements;

            socket.to(canvasId).emit(
                "receiveDrawingUpdate",
                elements
            );

            const canvas = await Canvas.findById(canvasId);

            if (canvas) {
                await Canvas.findByIdAndUpdate(
                    canvasId,
                    { elements },
                    {
                        new: true,
                        useFindAndModify: false,
                    }
                );
            }
        } catch (error) {
            console.error("Error updating canvas:", error);
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

server.listen(5000, () => {
    console.log("Server running on port 5000");
});