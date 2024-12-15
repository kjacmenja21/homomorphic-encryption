const express = require("express");
import "dotenv/config";
import { patientRouter } from "./api/patient";

const app = express();

const HOST = process.env.HOST;
const PORT = process.env.PORT;

app.use(express.json());
app.use(express.static("src/public"));
app.use("/api", patientRouter);

app.listen(PORT, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
});
