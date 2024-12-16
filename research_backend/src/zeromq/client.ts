import { Config } from "src/models/config";
import { Message, Request } from "zeromq";

export async function setupZeroMQClient(config: Config) {
  const ZEROMQ_PORT = process.env.ZEROMQ_PORT;
  const ZEROMQ_HOST = process.env.ZEROMQ_HOST;
  const client = new ZeroMQClient(ZEROMQ_HOST, ZEROMQ_PORT, config);
  await client.start();
  return client;
}

class ZeroMQClient {
  url: string;
  config: Config;
  client: Request;
  private isRunning: boolean;

  constructor(host: string, port: string, config: Config) {
    this.url = `tcp://${host}:${port}`;
    this.config = config;
    this.client = new Request();
    this.isRunning = true;
  }

  start = async () => {
    try {
      this.connect().then(() => {
        console.log("Client connected to server.");
        this.scheduleRequests();
      });
    } catch (err) {
      console.error("Error connecting to ZeroMQ:", err);
      await this.close();
    }
  };

  connect = async () => {
    // Connect to the ZeroMQ server endpoint
    await this.client.connect(this.url);
    console.log(`Connected to ${this.url}`);
  };

  close = async () => {
    await this.client.close();
    console.log(`Closed connection to ${this.url}`);
  };

  send = async (message: string) => {
    console.log(`Sending request: ${message}`);
    await this.client.send(message);

    const [reply] = await this.client.receive();
    return reply;
  };

  private scheduleRequests = async () => {
    if (!this.isRunning) return;

    try {
      const result = await this.send(
        JSON.stringify({ type: this.config.request_type })
      );
      this.handleRecieves(result);
    } catch (err) {
      console.error("Error sending request:", err);
    }

    const intervalMs = this.config.request_interval_seconds * 1000;
    setTimeout(this.scheduleRequests, intervalMs);
  };

  handleRecieves = (result: Message) => {
    console.log(JSON.parse(result.toString()));
  };
}
