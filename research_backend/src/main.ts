const express = require("express");
import "dotenv/config";
import { apiRouter } from "./api/api";

const app = express();

const HOST = process.env.HOST;
const PORT = process.env.PORT;

app.use(express.json());
app.use("/", apiRouter);

app.listen(PORT, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
});
