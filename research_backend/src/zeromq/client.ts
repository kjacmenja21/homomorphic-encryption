import { Config } from "src/models/config";
import { Message, Request } from "zeromq";
import { PaillierService } from "../services/paillierService";
import { SealService } from "../services/sealService";

export async function setupZeroMQClient(config: Config, storage: string[]) {
  const ZEROMQ_PORT = process.env.ZEROMQ_PORT;
  const ZEROMQ_HOST = process.env.ZEROMQ_HOST;
  const client = new ZeroMQClient(ZEROMQ_HOST, ZEROMQ_PORT, config, storage);
  await client.start();
  return client;
}

class ZeroMQClient {
  url: string;
  config: Config;
  client: Request;
  paillierService: PaillierService;
  sealService: SealService;
  private storage: string[];
  private isRunning: boolean;

  constructor(host: string, port: string, config: Config, storage: string[]) {
    this.url = `tcp://${host}:${port}`;
    this.config = config;
    this.paillierService = new PaillierService();
    this.sealService = new SealService();
    this.isRunning = true;
    this.storage = storage;
    this.client = new Request(); //{
    //curvePublicKey: process.env.ZEROMQ_RESEARCH_PUBLIC_KEY,
    //curveServerKey: process.env.ZEROMQ_HOSPITAL_PUBLIC_KEY,
    //curveSecretKey: process.env.ZEROMQ_RESEARCH_SECRET_KEY,
    //}
  }

  start = async () => {
    await this.sealService.init();

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
    //console.log(`Sending request: ${message}`);
    await this.client.send(message);

    const [reply] = await this.client.receive();
    return reply;
  };

  private scheduleRequests = async () => {
    if (!this.isRunning) return;

    try {
      this.storage.push("Sending request to server...");
      const result = await this.send(
        JSON.stringify({ type: this.config.request_type })
      );
      this.handleReceives(result);
    } catch (err) {
      this.storage.push("Error sending request:", err);
    }

    const intervalMs = this.config.request_interval_seconds * 1000;
    setTimeout(this.scheduleRequests, intervalMs);
  };

  handleReceives = async (result: Message) => {
    let data = JSON.parse(result.toString());
    let type = data.type;
    console.log("Mode: " + type);
    switch (type) {
      case "patients-data-paillier":
        let paillier_time = "[Measure] Paillier processing time";

        this.storage.push("Starting Paillier process...");
        console.time(paillier_time);
        this.handlePatientsDataPaillier(data);
        console.timeEnd(paillier_time);
        break;
      case "patients-data-seal":
        let seal_time = "[Measure] Seal processing time";
        this.storage.push("Starting Seal process...");
        console.time(seal_time);
        this.handlePatientsDataSeal(data);
        console.timeEnd(seal_time);
        break;
    }
  };

  async handlePatientsDataPaillier(data: any) {
    let publicKey = this.paillierService.decodePublicKey(data.publicKey);

    let patients = data.patients.map((patient: any) => {
      this.storage.push(JSON.stringify(patient));
      let cholesterol = BigInt(patient.cholesterol);
      let bloodPressure = BigInt(patient.bloodPressure);

      // D = 514 * C + 12 * BP
      let a: bigint = publicKey.multiply(cholesterol, 514);
      let b: bigint = publicKey.multiply(bloodPressure, 12);
      let diabetes = publicKey.addition(a, b);

      return {
        aid: patient.aid,
        diabetes: diabetes.toString(),
      };
    });

    let result = {
      type: "decrypt-diabetes-results-paillier",
      patients: patients,
    };

    let diabetesData = await this.send(JSON.stringify(result));
    this.handleDiabetes(diabetesData);
  }

  async handlePatientsDataSeal(data: any) {
    let sealService = this.sealService;

    sealService.decodePublicKey(data.publicKey);
    sealService.initHelpers();

    let patients = data.patients.map((patient: any) => {
      this.storage.push(JSON.stringify(patient));

      let cholesterol = sealService.createCipherText();
      let bloodPressure = sealService.createCipherText();
      let diabetes = sealService.createCipherText();

      cholesterol.load(sealService.context, patient.cholesterol);
      bloodPressure.load(sealService.context, patient.bloodPressure);

      // D = 514 * C + 12 * BP

      let k1 = sealService.encodeNumber(514);
      let k2 = sealService.encodeNumber(12);

      let a = sealService.createCipherText();
      let b = sealService.createCipherText();

      sealService.evaluator.multiply(cholesterol, k1, a);
      sealService.evaluator.multiply(bloodPressure, k2, b);

      sealService.evaluator.add(a, b, diabetes);

      return {
        aid: patient.aid,
        diabetes: diabetes.save(),
      };
    });

    let result = {
      type: "decrypt-diabetes-results-seal",
      patients: patients,
    };

    let diabetesData = await this.send(JSON.stringify(result));
    this.handleDiabetes(diabetesData);
  }

  async handleDiabetes(data: any) {
    data = JSON.parse(data.toString());
    let string = "Patient information: " + JSON.stringify(data);
    //console.log(string);
    this.storage.push(string);
  }
}
