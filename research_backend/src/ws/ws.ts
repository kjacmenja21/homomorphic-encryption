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
      handleCommand(message.toString(), ws);
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

function handleCommand(message: string, ws: WebSocket) {
  // Split the message into command and parameters
  const parts = message.split(" ");

  const command = parts[0]; // First part is the command
  const params = parts.slice(1); // The rest are parameters

  // Handle different commands
  switch (command) {
    case "send_message":
      // Example: send_message <message>
      sendMessage(params.join(" "), ws);
      break;

    case "add":
      // Example: add <num1> <num2>
      if (params.length === 2) {
        const num1 = parseFloat(params[0]);
        const num2 = parseFloat(params[1]);
        if (!isNaN(num1) && !isNaN(num2)) {
          const result = num1 + num2;
          ws.send(`Result: ${result}`);
        } else {
          ws.send("Invalid numbers for addition.");
        }
      } else {
        ws.send("Invalid number of parameters for add command.");
      }
      break;

    case "subtract":
      // Example: subtract <num1> <num2>
      if (params.length === 2) {
        const num1 = parseFloat(params[0]);
        const num2 = parseFloat(params[1]);
        if (!isNaN(num1) && !isNaN(num2)) {
          const result = num1 - num2;
          ws.send(`Result: ${result}`);
        } else {
          ws.send("Invalid numbers for subtraction.");
        }
      } else {
        ws.send("Invalid number of parameters for subtract command.");
      }
      break;

    default:
      ws.send(`Unknown command: ${command}`);
      break;
  }
}

function sendMessage(message: string, ws: WebSocket) {
  // Send a custom message to the client
  ws.send(`Server says: ${message}`);
}
