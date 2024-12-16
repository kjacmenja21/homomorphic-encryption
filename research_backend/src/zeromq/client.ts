import { Config } from "src/models/config";
import { PaillierService } from "../services/paillierService";
import { Message, Request } from "zeromq";
import { SealService } from "../services/sealService";

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

  paillierService: PaillierService;
  sealService: SealService;

  constructor(host: string, port: string, config: Config) {
    this.url = `tcp://${host}:${port}`;
    this.config = config;
    this.client = new Request();
    this.paillierService = new PaillierService();
    this.sealService = new SealService();
  }

  start = async () => {
    await this.sealService.init();
    this.sealService.initHelpers();

    try {
      this.connect().then(() => {
        console.log("Client connected to server.");

        setTimeout(async () => {
          const result = await this.send(JSON.stringify({ type: this.config.request_type }));
          this.handleRecieves(result);
        }, this.config.request_interval_seconds * 1000);
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

  handleRecieves = async (result: Message) => {
    let data = JSON.parse(result.toString());
    let type = data.type;

    switch (type) {
      case "patients-data-paillier":
        this.handlePatientsDataPaillier(data);
        break;
      case "patients-data-seal":
        this.handlePatientsDataSeal(data);
        break;
    }
  };

  async handlePatientsDataPaillier(data: any) {
    let publicKey = this.paillierService.decodePublicKey(data.publicKey);

    let patients = data.patients.map((patient: any) => {
      let cholesterol = BigInt(patient.cholesterol);
      let bloodPressure = BigInt(patient.bloodPressure);

      let diabetes = publicKey.addition(cholesterol, bloodPressure);

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

    let patients = data.patients.map((patient: any) => {
      let cholesterol = sealService.createCipherText();
      let bloodPressure = sealService.createCipherText();
      let diabetes = sealService.createCipherText();

      cholesterol.load(sealService.context, patient.cholesterol);
      bloodPressure.load(sealService.context, patient.bloodPressure);

      sealService.evaluator.add(cholesterol, bloodPressure, diabetes);

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
    console.log(data);
  }
}
