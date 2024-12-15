import { Request, Response } from "express";
const express = require("express");
const path = require("path");
const fs = require("fs");

export const apiRouter = express.Router();

apiRouter.get("/", (req: Request, res: Response) => {
  const filePath = path.join(__dirname, "../public/index.html");
  const HOST = process.env.HOST || "localhost";
  const PORT = process.env.WS_PORT || "8080";

  fs.readFile(
    filePath,
    "utf8",
    (err: NodeJS.ErrnoException | null, data: string | undefined) => {
      if (err) {
        console.log(err);

        res.status(500).send("Error loading HTML file");
        return;
      }
      // Replace placeholders with actual values
      const updatedHtml = data
        .replace(/__HOST__/g, JSON.stringify(HOST))
        .replace(/__PORT__/g, JSON.stringify(PORT));
      res.send(updatedHtml);
    }
  );
});
