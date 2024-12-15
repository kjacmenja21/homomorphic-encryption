import { Config } from "./models/config";
import * as express from "express";
import { PatientService } from "./services/patientService";
import { HealthData } from "./models/healthData";
import { SealService } from "./services/sealService";
import { ZeromqServer } from "./services/zeromqServer";

let sealService: SealService;
let patientService: PatientService;
let config: Config;
let zeromqServer: ZeromqServer;

async function main() {
  config = await Config.load();

  sealService = new SealService();
  await sealService.init();
  sealService.decodeKeys(config.sealKeys.publicKey, config.sealKeys.privateKey);
  sealService.initHelpers();

  patientService = new PatientService(config, sealService);

  zeromqServer = new ZeromqServer(config, patientService);
  zeromqServer.start();

  startHttp();
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
