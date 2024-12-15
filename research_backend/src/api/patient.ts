import { Request, Response } from "express";
import { mqttSendMessage } from "../zeromq/client";
const express = require("express");

export const patientRouter = express.Router();

patientRouter.post("/data", (req: Request, res: Response) => {
  const data = req.body;
  console.log(data);

  mqttSendMessage(JSON.stringify(data));
  res.json({ message: "Data received!", data });
});
