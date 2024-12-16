import { Config } from "src/models/config";
import WebSocket, { WebSocketServer } from "ws";

// This function sets up the WebSocket server
export function setupWebSocketServer(config: Config, storage: string[]) {
  const wss = new WebSocketServer({ port: parseInt(process.env.WS_PORT) });

  wss.on("connection", (ws: WebSocket) => {
    console.log("Client connected");

    // Send a welcome message to the client
    ws.send("Connection established. Use `commands` to see comannds");

    // Handle incoming messages
    ws.on("message", (message: WebSocket.Data) => {
      console.log(`Received message: ${message}`);
      handleCommand(message.toString(), ws, config);
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

  const broadcast = (data: string) => {
    wss.clients.forEach((client) => {
      if (client.readyState === client.OPEN) {
        client.send(data);
      }
    });
  };

  // Poll the shared storage and send updates to WebSocket clients
  pollStorage(1000, storage, broadcast); // Adjust interval as needed

  console.log("WebSocket server running on ws://localhost:5001");
  return wss;
}

function handleCommand(message: string, ws: WebSocket, config: Config) {
  // Split the message into command and parameters
  const parts = message.split(" ");

  const command = parts[0]; // First part is the command
  const params = parts.slice(1); // The rest are parameters

  // Handle different commands
  switch (command) {
    case "commands":
      const commands = [
        "send_message <param1> <param2>...",
        "request_interval <seconds>",
      ];
      // Example: send_message <message>
      sendMessage(commands.map((str) => `"${str}"`).join(" "), ws);
      break;

    case "request_interval":
      // Example: request_interval <seconds>
      if (params.length === 1) {
        const value = parseFloat(params[0]);
        if (!isNaN(value)) {
          config.request_interval_seconds = value;
          ws.send(
            `Request interval set to: ${config.request_interval_seconds}`
          );
        } else {
          ws.send("Invalid number for value.");
        }
      }
      break;

    default:
      ws.send(`Unknown command: ${command}`);
      break;
  }
}

function sendMessage(message: string, ws: WebSocket) {
  ws.send(`[Server]: ${message}`);
}

function pollStorage(
  intervalMs: number,
  storage: string[],
  sendToClients: (data: string) => void
) {
  let lastIndex = 0; // Tracks the last read index

  setInterval(() => {
    if (lastIndex < storage.length) {
      const newEntries = storage.slice(lastIndex);
      lastIndex = storage.length; // Update index to the latest entry
      newEntries.forEach(sendToClients);
    }
  }, intervalMs);
}
