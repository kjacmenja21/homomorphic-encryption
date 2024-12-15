import * as zmq from "zeromq";
import { Config } from "./models/config";

async function main() {
  let config = await Config.load();
  let socket = new zmq.Reply();

  await socket.bind("tcp://localhost:" + config.zmqPort);

  for await (let [msg] of socket) {
    let data = JSON.parse(msg.toString());
    await handleRequest(data);

    console.log(typeof msg);
    console.log(msg.toString());

    await socket.send("Hi");
  }
}

async function handleRequest(request: any) {}

main();
