const express = require("express");
import "dotenv/config";
import { runClient } from "./zeromq/client";

const app = express();

const HOST = process.env.HOST;
const PORT = process.env.PORT;

runClient("Gay");

app.listen(PORT, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
});
