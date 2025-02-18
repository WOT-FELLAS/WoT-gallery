import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Serve static files from the public folder in the client directory
app.use(express.static(path.join(__dirname, "../client/public")));

app.get("/remote", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/public/remote-classic.html"));
});

// --- Controller Namespace ---
const controllerNamespace = io.of("/controller");

controllerNamespace.on("connection", (socket) => {
  console.log("A controller user connected:", socket.id);

  socket.on("style-selected", (style) => {
    console.log(`Style selected: ${style}`);
    controllerNamespace.emit("style-changed", style);
  });

  socket.on("toggle-camera", () => {
    console.log("Camera toggled");
    controllerNamespace.emit("toggle-camera");
  });

  socket.on("handle-go-back", () => {
    console.log("Go back");
    controllerNamespace.emit("handle-go-back");
  });

  socket.on("handle-capture-photo", () => {
    console.log("Capture photo");
    controllerNamespace.emit("handle-capture-photo");
  });

  socket.on("handle-direction", (direction) => {
    console.log(`Direction ${direction}`);
    controllerNamespace.emit("handle-direction", direction);
  });

  socket.on("handle-click", () => {
    console.log("Click detected");
    controllerNamespace.emit("handle-click");
  });

  socket.on("toggle-recognizing", () => {
    console.log("Toggle recognizing");
    controllerNamespace.emit("toggle-recognizing");
  });

  socket.on("disconnect", () => {
    console.log("A controller user disconnected:", socket.id);
  });
});

// --- Gallery Namespace ---
const galleryNamespace = io.of("/gallery");

galleryNamespace.on("connection", (socket) => {
  console.log("A gallery user connected:", socket.id);

  socket.on("new-image", () => {
    console.log("New image received for the gallery:");
    galleryNamespace.emit("gallery-update"); // Notify all gallery clients
  });

  socket.on("disconnect", () => {
    console.log("A gallery user disconnected:", socket.id);
  });
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
