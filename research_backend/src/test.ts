import * as zmq from "zeromq";
async function main() {
  const sock = new zmq.Request();
  sock.connect("tcp://localhost:3000");
  await sock.send(
    JSON.stringify({
      type: "get-patients-data-paillier",
    })
  );
  const [result] = await sock.receive();
  console.log(JSON.parse(result.toString()));

  await sock.send(
    JSON.stringify({
      type: "get-patients-data-seal",
    })
  );
  const [result2] = await sock.receive();
  console.log(JSON.parse(result2.toString()));
}
main();
