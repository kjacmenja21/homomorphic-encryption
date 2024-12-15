// websocket.ts
import http from "http";
import { Server } from "socket.io";

export function setupWebSocketServer(server: http.Server) {
  const io = new Server(server);
  console.log("Created new WS server");

  io.on("connection", (socket) => {
    console.log("New WebSocket connection");

    // Listen for messages from the client
    socket.on("message", (message) => {
      console.log(`Received: ${message}`);
      socket.send(`Server says: ${message}`); // Echo the message back to the client
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("WebSocket connection closed");
    });
  });

  return io; // Optional: Return the io instance if you need to interact with it outside
}
