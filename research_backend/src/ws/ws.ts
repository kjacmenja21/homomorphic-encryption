import WebSocket, { WebSocketServer } from "ws";

// This function sets up the WebSocket server
export function setupWebSocketServer() {
  const wss = new WebSocketServer({ port: parseInt(process.env.WS_PORT) });

  wss.on("connection", (ws: WebSocket) => {
    console.log("Client connected");

    // Send a welcome message to the client
    ws.send("Hello Client!");

    // Handle incoming messages
    ws.on("message", (message: WebSocket.Data) => {
      console.log(`Received message: ${message}`);
      ws.send(`Server received: ${message}`); // Echo the message back
    });

    // Handle disconnection
    ws.on("close", () => {
      console.log("Client disconnected");
    });

    // Handle WebSocket errors
    ws.on("error", (error: Error) => {
      console.error("Error on WebSocket connection:", error.message);
    });
  });

  console.log("WebSocket server running on ws://localhost:5001");
  return wss;
}
