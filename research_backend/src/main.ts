import "dotenv/config";
import express, { Request, Response } from "express";
import { apiRouter } from "./api/api";
import { Config } from "./models/config";
import { setupWebSocketServer } from "./ws/ws";
import { setupZeroMQClient } from "./zeromq/client";

const HOST = process.env.HOST;
const PORT = process.env.PORT;

var config = new Config();

const app = express();
const wss = setupWebSocketServer(config);
const zmqClient = setupZeroMQClient(config);

app.use(express.json());
app.use("/", apiRouter);

app.get("/config", (req: Request, res: Response) => {
  res.json(JSON.stringify(config));
});

app.listen(PORT, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
