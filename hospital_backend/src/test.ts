import * as zmq from "zeromq";
import { Config } from "./models/config";

async function main() {
  const sock = new zmq.Request();

  sock.connect("tcp://localhost:3000");
  console.log("Producer bound to port 3000");

  await sock.send("4");
  const [result] = await sock.receive();

  console.log(result.toString());
}

main();
