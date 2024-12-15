import * as zmq from "zeromq";
import { Config } from "./models/config";
import { PaillierExample } from "./zeromq/paillierExample";
import * as express from "express";
import { PatientService } from "./services/patientService";
import { HealthData } from "./models/healthData";
import { SealService } from "./services/sealService";

let sealService: SealService;
let paillierExample: PaillierExample;
let patientService: PatientService;
let config: Config;

async function main() {
  config = await Config.load();

  sealService = new SealService();
  await sealService.init();
  sealService.decodeKeys(config.sealKeys.publicKey, config.sealKeys.privateKey);
  sealService.initHelpers();

  patientService = new PatientService(config, sealService);
  paillierExample = new PaillierExample(patientService);

  startZeromq();
  startHttp();
}

async function startZeromq() {
  let socket = new zmq.Reply();

  await socket.bind("tcp://localhost:" + config.zmqPort);

  for await (let [msg] of socket) {
    let data = JSON.parse(msg.toString());

    await handleZeromqRequest(socket, data);
  }
}

async function handleZeromqRequest(socket: zmq.Reply, data: any) {
  let type = data.type;

  switch (type) {
    case "get-patients-data-paillier":
      await paillierExample.getPatientsData(socket);
      break;
  }
}

async function startHttp() {
  let app = express();
  app.use(express.json());

  app.get("/patients", (req, res) => getAllPatients(req, res));
  app.put("/patient_health_data", (req, res) => updatePatientHealthData(req, res));

  app.listen(80);
}

async function getAllPatients(req: express.Request, res: express.Response) {
  let data = await patientService.getPatientsDecrypted();
  res.json(data);
}

async function updatePatientHealthData(req: express.Request, res: express.Response) {
  let data = req.body;

  let hpData = new HealthData();
  hpData.cholesterol = data.cholesterol;
  hpData.bloodPressure = data.bloodPressure;

  await patientService.updatePatientHealthData(data.oib, hpData);
  res.send("OK");
}

main();
