import "dotenv/config";
import express from "express";
import http from "http";
import { apiRouter } from "./api/api";
import { setupWebSocketServer } from "./ws/ws";

const HOST = process.env.HOST;
const PORT = process.env.PORT;

const app = express();
const server = http.createServer(app); // Create the HTTP server for Express

app.use(express.json());
app.use("/", apiRouter);

setupWebSocketServer(server);

app.listen(PORT, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
});
