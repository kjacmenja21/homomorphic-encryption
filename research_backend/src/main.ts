import "dotenv/config";
import express from "express";
import { apiRouter } from "./api/api";
import { setupWebSocketServer } from "./ws/ws";

const HOST = process.env.HOST;
const PORT = process.env.PORT;

const app = express();
const wss = setupWebSocketServer();

app.use(express.json());
app.use("/", apiRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
