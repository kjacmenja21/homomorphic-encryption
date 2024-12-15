import { Request } from "zeromq";

const ZEROMQ_PORT = process.env.ZEROMQ_PORT;
const ZEROMQ_HOST = process.env.ZEROMQ_HOST;

export async function mqttSendMessage(message: string) {
  const client = new Request();

  try {
    await client.connect(`tcp://${ZEROMQ_HOST}:${ZEROMQ_PORT}`);
    console.log("Client connected to server.");

    console.log(`Sending request: ${message}`);
    await client.send(message);

    const [reply] = await client.receive();
    console.log(`Received reply: ${reply.toString()}`);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}
